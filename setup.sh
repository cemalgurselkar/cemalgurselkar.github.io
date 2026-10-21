#!/usr/bin/env bash

set -Eeuo pipefail

readonly NODE_VERSION="24.22.0"
readonly APP_PORT="${PORT:-3000}"

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
tooling_dir="${project_dir}/.tooling"

download_file() {
  local source_url="$1"
  local destination="$2"

  if command -v curl >/dev/null 2>&1; then
    curl --fail --location --show-error --silent \
      "$source_url" --output "$destination"
  elif command -v wget >/dev/null 2>&1; then
    wget --quiet "$source_url" --output-document="$destination"
  else
    echo "Hata: Node.js indirmek için curl veya wget gerekli." >&2
    exit 1
  fi
}

node_is_compatible() {
  command -v node >/dev/null 2>&1 || return 1

  local major_version
  major_version="$(node --eval 'process.stdout.write(process.versions.node.split(".")[0])')"
  [[ "$major_version" -ge 24 && "$major_version" -lt 27 ]]
}

install_local_node() {
  local platform architecture archive node_dir temporary_dir expected actual

  case "$(uname -s)" in
    Linux) platform="linux" ;;
    Darwin) platform="darwin" ;;
    *)
      echo "Hata: Otomatik Node.js kurulumu yalnızca Linux ve macOS'u destekliyor." >&2
      exit 1
      ;;
  esac

  case "$(uname -m)" in
    x86_64 | amd64) architecture="x64" ;;
    arm64 | aarch64) architecture="arm64" ;;
    *)
      echo "Hata: Desteklenmeyen işlemci mimarisi: $(uname -m)" >&2
      exit 1
      ;;
  esac

  archive="node-v${NODE_VERSION}-${platform}-${architecture}.tar.xz"
  node_dir="${tooling_dir}/node-v${NODE_VERSION}-${platform}-${architecture}"

  if [[ ! -x "${node_dir}/bin/node" ]]; then
    if [[ -e "$node_dir" ]]; then
      echo "Hata: Yarım kalmış Node.js kurulumu bulundu: ${node_dir}" >&2
      echo "Bu klasörü silip setup.sh dosyasını yeniden çalıştırın." >&2
      exit 1
    fi

    echo "Uygun Node.js bulunamadı; Node.js ${NODE_VERSION} proje içine indiriliyor..."
    mkdir -p "$tooling_dir"
    temporary_dir="$(mktemp -d)"
    trap 'rm -rf -- "${temporary_dir:-}"' EXIT INT TERM

    download_file \
      "https://nodejs.org/dist/v${NODE_VERSION}/${archive}" \
      "${temporary_dir}/${archive}"
    download_file \
      "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt" \
      "${temporary_dir}/SHASUMS256.txt"

    expected="$(awk -v file="$archive" '$2 == file { print $1 }' "${temporary_dir}/SHASUMS256.txt")"
    if command -v sha256sum >/dev/null 2>&1; then
      actual="$(sha256sum "${temporary_dir}/${archive}" | awk '{ print $1 }')"
    else
      actual="$(shasum -a 256 "${temporary_dir}/${archive}" | awk '{ print $1 }')"
    fi

    if [[ -z "$expected" || "$expected" != "$actual" ]]; then
      echo "Hata: Node.js arşivinin SHA-256 doğrulaması başarısız." >&2
      exit 1
    fi

    tar -xJf "${temporary_dir}/${archive}" -C "$tooling_dir"
    rm -rf -- "$temporary_dir"
    trap - EXIT INT TERM
  fi

  export PATH="${node_dir}/bin:${PATH}"
}

cd "$project_dir"

if ! node_is_compatible; then
  install_local_node
fi

echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

if [[ ! -d node_modules || package-lock.json -nt node_modules/.package-lock.json ]]; then
  echo "Bağımlılıklar kuruluyor..."
  npm ci
else
  echo "Bağımlılıklar güncel."
fi

echo
echo "Site hazırlanıyor: http://127.0.0.1:${APP_PORT}"
echo "Durdurmak için Ctrl+C kullanın."
echo

export NEXT_TELEMETRY_DISABLED="${NEXT_TELEMETRY_DISABLED:-1}"
exec npm run dev -- --hostname 127.0.0.1 --port "$APP_PORT"
