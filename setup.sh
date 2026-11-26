#!/usr/bin/env bash
# One-command start for the personal site.
#
#   ./setup.sh           install everything and start the dev server (http://localhost:4321)
#   ./setup.sh preview   install, build for production, and serve the build
#   ./setup.sh install   only install dependencies
#
# What it does:
#   1. Makes sure the Node version from .nvmrc is used (via nvm; offers to install nvm if missing)
#   2. Runs the pnpm version pinned in package.json (via corepack, no global install needed)
#   3. Installs dependencies, then runs the chosen command

set -euo pipefail

cd "$(dirname "$0")"

MODE="${1:-dev}"
REQUIRED_NODE="24.16.0"   # minimum; .nvmrc pins the exact version
NVM_VERSION="v0.40.3"

info() { printf '\033[1;35m==>\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31mError:\033[0m %s\n' "$*" >&2; exit 1; }

case "$MODE" in
  dev | preview | install) ;;
  -h | --help)
    sed -n '2,7p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
    ;;
  *) fail "Unknown mode '$MODE'. Use: dev (default), preview, or install." ;;
esac

# --- 1. Node ---------------------------------------------------------------

node_ok() {
  command -v node >/dev/null 2>&1 || return 1
  node -e '
    const [a, b] = [process.versions.node, process.argv[1]].map((v) => v.split(".").map(Number));
    for (let i = 0; i < 3; i++) { if (a[i] !== b[i]) process.exit(a[i] > b[i] ? 0 : 1); }
  ' "$REQUIRED_NODE"
}

load_nvm() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  command -v nvm >/dev/null 2>&1
}

# nvm is not compatible with `set -eu`, so relax strict mode only while it runs.
nvm_run() {
  set +eu
  nvm "$@"
  local status=$?
  set -eu
  return $status
}

# Install the .nvmrc version with nvm, then put it first on PATH for this script only.
# We don't rely on `nvm use`: it refuses to work when ~/.npmrc sets `prefix`
# (a common setup for sudo-free global installs), and fixing that would mean
# deleting the user's prefix setting. Activating via PATH leaves ~/.npmrc untouched.
use_nvm_node() {
  local version bin
  version="$(tr -d '[:space:]' < .nvmrc)"
  version="v${version#v}"
  bin="$NVM_DIR/versions/node/$version/bin"
  if [ ! -x "$bin/node" ]; then
    info "Installing Node $version with nvm"
    nvm_run install "$version" || true   # may print the npmrc-prefix warning; checked below
  fi
  [ -x "$bin/node" ] || fail "Node $version could not be installed with nvm."
  export PATH="$bin:$PATH"
  hash -r
}

set +eu; load_nvm; HAS_NVM=$?; set -eu

if [ "$HAS_NVM" -eq 0 ]; then
  use_nvm_node
elif ! node_ok; then
  echo "Node >= $REQUIRED_NODE is required (found: $(node -v 2>/dev/null || echo none)), and nvm is not installed."
  read -r -p "Install nvm $NVM_VERSION from github.com/nvm-sh/nvm now? [y/N] " answer
  [[ "$answer" =~ ^[Yy]$ ]] || fail "Install Node $(cat .nvmrc) yourself (https://nodejs.org) and run ./setup.sh again."
  curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" | bash
  set +eu; load_nvm; HAS_NVM=$?; set -eu
  [ "$HAS_NVM" -eq 0 ] || fail "nvm was installed but could not be loaded. Open a new terminal and run ./setup.sh again."
  use_nvm_node
fi

node_ok || fail "Node >= $REQUIRED_NODE is required, but $(node -v) is active."
info "Node $(node -v)"

# --- 2. pnpm ---------------------------------------------------------------

PNPM_VERSION="$(node -p 'require("./package.json").packageManager.split("@")[1]')"

if command -v corepack >/dev/null 2>&1; then
  export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
  pnpm() { corepack pnpm "$@"; }
else
  pnpm() { npx --yes "pnpm@$PNPM_VERSION" "$@"; }
fi
info "pnpm $(pnpm --version)"

# --- 3. Install and run ----------------------------------------------------

info "Installing dependencies"
pnpm install

[ -f pnpm-lock.yaml ] && ! git ls-files --error-unmatch pnpm-lock.yaml >/dev/null 2>&1 &&
  info "pnpm-lock.yaml was created — remember to commit it."

case "$MODE" in
  dev)
    info "Starting dev server at http://localhost:4321 (Ctrl+C to stop)"
    pnpm dev
    ;;
  preview)
    info "Building for production"
    pnpm build
    info "Serving the build at http://localhost:4321 (Ctrl+C to stop)"
    pnpm preview
    ;;
  install)
    info "Done. Start the site with: ./setup.sh"
    ;;
esac
