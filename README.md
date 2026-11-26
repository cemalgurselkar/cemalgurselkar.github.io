# Personal site

Personal engineering blog and portfolio for Cemal Gürsel Kar, built with Astro 7, TypeScript (strict) and Tailwind CSS 4. The site is fully static. The design concept is "Midnight Observatory"; see `plan.md` for the full spec and `project.md` for current progress.

## Requirements

- Node 24 (pinned in `.nvmrc`; Astro 7 needs ≥ 22.23)
- pnpm 10 (`corepack enable` picks up the version from `package.json`)

## Quick start

```bash
./setup.sh           # installs the right Node + pnpm + dependencies, then starts the dev server
./setup.sh preview   # same, but builds and serves the production version
./setup.sh install   # only install
```

## Commands

```bash
pnpm install          # first time; creates pnpm-lock.yaml (commit it)
pnpm dev              # dev server at http://localhost:4321
pnpm build            # production build into dist/
pnpm preview          # serve the production build
pnpm check            # astro check (types)
pnpm lint             # eslint
pnpm format:check     # prettier
pnpm exec playwright install chromium   # once, before e2e tests
pnpm test:e2e         # builds, serves and runs Playwright tests
```

## Editing content

- Profile, links and "currently exploring": `src/config/site.config.ts`. Leave a value `undefined` to hide it.
- Projects: one Markdown file per project in `src/content/projects/`. Set `featured: true` and `order` to show it on the home page (maximum 4).
- Project links: `repo: owner/name` gives the Repository button; extra buttons go in `links:` (`label` + `url`). The page body is the Markdown below the frontmatter.
- About page: `src/config/about.ts`.
- Medium articles: set `mediumFeedUrl` (e.g. `https://medium.com/feed/@you`) and `mediumProfileUrl` in `src/config/site.config.ts`. The feed is read at build time; older articles can be listed in `src/data/medium-articles.json`. If the feed fails, the build continues with that file.
- Hero crop: `--hero-px` / `--hero-py` (0–1, like object-position; portrait screens override them) in `src/components/ObservatoryHero.astro`.
- Hero overlays (stars, steam, monitor, clickable monitor) are positioned from `src/lib/observatory-map.ts` (landmarks measured in source pixels). If the artwork changes, re-measure there.
- Terminal commands: `src/scripts/terminal/commands.ts`. Its data comes from `site.config.ts`, `about.ts`, projects and articles.
- Telescope: clicking the sky zooms in and opens the eyepiece. What it can find (names, facts, Wikipedia links) is in `src/lib/sky-catalog.ts`. Each object is drawn in code in `src/scripts/eyepiece/render.ts`; a new object needs a painter there, which the tests check. Constellation shapes are in `src/lib/constellations.ts`, as stars in 0–1 coordinates plus the lines between them.
- The sitemap is only generated when `SITE_URL` is set at build time.
- E2E tests build with `CONTENT_FIXTURES=1` (Medium fixtures from `tests/fixtures/medium`, no network). Run `pnpm build` again before using `dist/` afterwards.
- Hero image: `src/assets/observatory-night.png`.
