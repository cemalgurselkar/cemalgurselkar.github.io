# Project progress

What has been built from `plan.md` so far, what was decided along the way, and what still needs your input.

**Status:** phases A, B and C are written, and **revision 1** (redesigned phase B plus Medium integration, from the updated `plan.md`) is written on top of them. Work stops here for your review. Nothing in revision 1 has been installed, built or tested yet, so all of it is **unverified**. Revision 1 replaces some phase B/C details described further down; see section 7 for what changed.

---

## 1. Starting point

- Your working tree already had the old Next.js site deleted (uncommitted). I did not restore or touch those files. Git still has them in history.
- The only files left were `plan.md`, `.gitignore`, `.dockerignore` and the hero image `a_clean_atmospheric_pixel_art_night_observatory_w.png` (1672×941).
- Real profile data (name, GitHub, email, project descriptions) was taken from the old `src/data/profile.ts` and `src/data/projects.ts` in git history, so nothing was invented.

## 2. Phase A — setup

| File                                                      | Purpose                                                                                                                                      |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                                            | Exact pinned versions, pnpm 10, scripts: `dev`, `build`, `preview`, `check`, `lint`, `format`, `format:check`, `test:e2e`                    |
| `.nvmrc`                                                  | Node `24.22.3` (current LTS)                                                                                                                 |
| `astro.config.mjs`                                        | Static output and Tailwind via Vite. `site` and `base` come from the `SITE_URL` / `BASE_PATH` env vars, because the domain isn't decided yet |
| `tsconfig.json`                                           | `astro/tsconfigs/strict`                                                                                                                     |
| `eslint.config.js`, `.prettierrc.json`, `.prettierignore` | Lint and format setup, including Astro files                                                                                                 |
| `.gitignore`                                              | Replaced the Next.js entries with Astro ones (`dist/`, `.astro/`)                                                                            |
| `src/styles/tokens.css`                                   | Every color, spacing and font token from plan §3, the single source of truth                                                                 |
| `src/styles/global.css`                                   | Tailwind import, maps Tailwind tokens to the CSS variables, base styles, focus ring, reduced-motion rule                                     |
| `src/layouts/BaseLayout.astro`                            | `<html lang>`, meta/OG tags, canonical (only when a site URL exists), skip link, header/footer                                               |
| `src/config/site.config.ts`                               | Profile, links, current focus and featured repos, with the typed contract from plan §8                                                       |
| `src/lib/paths.ts`                                        | `withBase()` so every internal link works under a GitHub Pages sub-path                                                                      |
| `src/lib/reading-time.ts`                                 | Approximate reading time (220 wpm)                                                                                                           |
| `public/favicon.svg`                                      | Small pixel-art favicon in the palette colors                                                                                                |
| `README.md`                                               | Short guide: requirements, commands, how to edit content                                                                                     |

### Versions (checked on the npm registry on 2026-11-26)

Astro **7.4.13**, Tailwind **4.3.5**, TypeScript **6.0.3**, ESLint **10.15.0**, Playwright **1.65.1**, pnpm **10.34.9**.

- **TypeScript is 6, not 7:** `@astrojs/check` and `typescript-eslint` don't support TS 7 yet.
- **pnpm is 10, not the newest 12:** I know its build-script approval setting (`onlyBuiltDependencies` for `sharp`/`esbuild`) works.
- **Astro 7 changes I followed:** `z` is imported from `astro/zod` (Zod 4), collections use `id` instead of `slug`, and `compressHTML: true` is set explicitly because Astro 7 changed the default whitespace handling.

## 3. Phase B — static UI

| File                                         | What it does                                                                                                                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/Header.astro`                | `CGK.` wordmark, nav with `aria-current` and a small square "pixel" marker on the active page. Below 560px it switches to a `<details>` menu, which works without JavaScript |
| `src/components/ObservatoryHero.astro`       | Framed hero using `<Picture>` (AVIF and WebP, 640–1672w, eager loading, high fetch priority, `alt=""` because it's decorative)                                               |
| `src/components/ProfileIntro.astro`          | The only H1 (your name), role, tagline, bio, links. Links with no value are hidden                                                                                           |
| `src/components/CurrentFocus.astro`          | Green square dot and "Currently exploring …"                                                                                                                                 |
| `src/components/ProjectCard.astro`           | Title links to `/projects/<id>`, a separate GitHub icon links to the repo (no nested anchors), plus a technology list                                                        |
| `src/components/PostList.astro`              | Thin-line list: date, title, category, reading time. Shows an honest empty state                                                                                             |
| `src/components/Icon.astro`                  | Three Lucide icons as static inline SVG, with no icon library at runtime                                                                                                     |
| `src/pages/index.astro`                      | Home page: hero → profile → focus → 2-column projects (max 4) → last 3 posts                                                                                                 |
| `src/content.config.ts`                      | `blog` and `projects` collections with the schemas from plan §8. Drafts are hidden in production                                                                             |
| `src/content/projects/*.md`                  | AstraRAG and MarketStream (featured), Clearpath (not featured), all with real descriptions                                                                                   |
| `src/content/blog/_template.md`              | Post template, ignored by the loader because of the leading `_`                                                                                                              |
| `src/assets/observatory-night.png`           | A **copy** of your image. The original in the repo root is untouched                                                                                                         |
| `playwright.config.ts`, `tests/home.spec.ts` | Tests at 1440/1024/768/390/320px: no horizontal overflow, aligned left edges, one H1, nav reachable, full-page screenshot per width. Also checks the skip link               |

### How the hero crop works

The image is about 16:9, and plan §4 asks for a wide banner that never crops blindly. So:

- **Mobile (<768px):** the full image, uncropped.
- **≥768px:** a **2:1** window. The image is shifted up 5%, cutting about 45% of the hidden part from the top and about 55% from the bottom. The galaxy and the full desk both stay visible.
- To adjust it, change `--hero-ratio` and `--hero-shift` in `ObservatoryHero.astro`.
- The image sits on a "stage" that keeps its native ratio. Later animation overlays use coordinates of the native image, so they follow the same crop automatically.

## 3b. Phase C — content pages

### New routes

| Route            | File                                                              | Notes                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `/projects`      | `src/pages/projects/index.astro`                                  | Every published project, ordered by `order`, 2 columns (1 on mobile)                                                                        |
| `/projects/<id>` | `src/pages/projects/[slug].astro`                                 | Title, description, technologies, Repository link, extra `links`, then the write-up. With no write-up yet, it says so honestly              |
| `/blog`          | `src/pages/blog/index.astro`                                      | All published posts, newest first. Empty state while there are none                                                                         |
| `/blog/<id>`     | `src/pages/blog/[slug].astro` + `src/layouts/ArticleLayout.astro` | Title, summary, date, updated date, reading time, category, tags, content, older/newer links. No hero image                                 |
| `/about`         | `src/pages/about.astro` + `src/config/about.ts`                   | Intro, interests, experience, education, tools, contact/CV. All text is editable in `about.ts`; nothing like "recent graduate" is hardcoded |
| 404              | `src/pages/404.astro`                                             | Small pixel telescope, links to Home and Blog; works under a base path                                                                      |
| `/rss.xml`       | `src/pages/rss.xml.ts`                                            | Published posts only. Disabled (404) until `SITE_URL` is set, so no fake domain                                                             |
| sitemap          | `astro.config.mjs`                                                | `@astrojs/sitemap` turns on only when `SITE_URL` is set; drafts have no route, so they're never listed                                      |

### Markdown, math and code

- `.md` and `.mdx` are both supported (`@astrojs/mdx`).
- Astro 7 switched to a new default Markdown processor, Sätteri, so remark/rehype plugins need `markdown.processor: unified({...})` from `@astrojs/markdown-remark`. Math is `remark-math` + `rehype-katex`, with KaTeX CSS loaded only on pages that render Markdown.
- Code highlighting uses Shiki with the `github-dark-dimmed` theme on the site's surface color. Long lines scroll **inside** the code block.
- Every heading gets an anchor link (`#`). It appears on hover or keyboard focus, and screen readers hear "Link to this section".
- Tables and wide equations scroll inside their own box, never the page. Styles live in `src/styles/prose.css`.

### Content

- **Projects:** `src/content/projects/*.md` now has 7 projects, all from your old site's data:
  - AstraRAG, MarketStream, VecTorch, Clearpath and Financial AI Agent have an overview, a results table where checked numbers existed, and limitations.
  - Fish detection and Qwen LoRA have only description + links, like before (no write-up was published).
  - The `links` in each file point at the **exact commits** that were checked. Replace them with your own links whenever you like. The format is in the next section.
- **Featured on home:** still AstraRAG and MarketStream (`featured: true`).
- **Blog:** no real posts yet.
- **Shared helpers:** `src/lib/content.ts` (`getPosts`, `getProjects`, date format). The draft filter lives here: drafts show in `pnpm dev`, never in a production build.

### Tests (`tests/content.spec.ts`)

- The e2e build uses `CONTENT_FIXTURES=1`, which swaps the blog collection for `tests/fixtures/blog/`, so test posts never mix with real ones. Tests run on port **4322**, so they never reuse your `pnpm dev` server.
- They cover:
  - draft hidden from the list and returns 404
  - posts ordered newest first, with older/newer links
  - KaTeX inline and block, Shiki block, table, heading anchor, Turkish characters
  - no page overflow at 320px
  - every project link returns 200
  - About/Projects/Blog have one H1 each
  - unknown URL gives the 404 page
- ⚠️ After `pnpm test:e2e`, `dist/` contains the **fixture** build. Run `pnpm build` again before using `dist/` for anything real; CI/deploy always builds fresh.

### How to add or change project links

In any `src/content/projects/<name>.md`:

```yaml
repo: cemalgurselkar/astraRag # → "Repository" button
links: # → extra buttons, in this order
  - label: Live demo
    url: https://example.com
  - label: Benchmark report
    url: https://github.com/...
```

Write the page body below the second `---` in Markdown. Math (`$...$`, `$$...$$`) and code blocks work.

### How to write a blog post

Copy `src/content/blog/_template.md` to `src/content/blog/my-post.md` (or `.mdx`), fill in the frontmatter, and set `draft: false` to publish.

## 4. Assumptions and open questions

1. **Hero height:** at the full 1100px width, 2:1 gives a **~550px** tall hero. The plan targets 320–440px but puts composition first. A ratio wider than about 2.3:1 would cut the galaxy or the desk. Please judge this on screen.
2. **Role / tagline:** "Computer Engineer" and the tagline come from the plan's example. The bio is your old site's intro text.
3. **Current focus:** "AI/ML and data systems" comes from your old profile. Please change it if you're exploring something more specific right now.
4. **Email** is shown (Contact/Email links), because it was public on your previous site. Set `email: undefined` to hide it.
5. **Not set, so hidden:** LinkedIn URL, resume PDF (`public/resume.pdf` plus `resumePath`), site URL/domain.
6. **Two sources for featured projects:** home-page selection uses each project file's `featured` + `order`. `featuredRepos` in the config is kept for the GitHub metadata fetch in phase D.
7. ~~Links that 404 for now~~ — fixed in phase C; every nav and project link now has a page.
8. **No blog posts yet**, so the home page shows the empty state and hides "View all" for writings.
9. **No animation yet:** the plan says not to build animation before the hero crop is approved (phase E).
10. **`.dockerignore`** is left over from the old setup. The plan has no Docker, so you can delete it.

## 5. What you need to run

Your machine currently has **Node v12** and no pnpm, which is too old for Astro 7.

**Shortcut:** `./setup.sh` does the steps below automatically, then starts the dev server. It uses nvm to switch to Node 24.22.3; if nvm is missing, it asks before installing it. It then runs the pinned pnpm through corepack, installs dependencies, and runs `pnpm dev`. Use `./setup.sh preview` for a production build, or `./setup.sh install` to only install.

Manual steps:

```bash
nvm install && nvm use            # reads .nvmrc → Node 24.22.3
corepack enable                   # provides pnpm 10.34.9 from package.json
pnpm install                      # creates pnpm-lock.yaml — commit it
pnpm dev                          # check the home page at http://localhost:4321
pnpm check && pnpm lint && pnpm format:check
pnpm build && pnpm preview
pnpm exec playwright install chromium
pnpm test:e2e                     # screenshots land in test-results/
```

**Please review:** hero crop and height, colors, spacing, scroll length, and the mobile menu at 1440, 1024, 768, 390 and 320px.

## 6. Next phases (waiting for your approval)

- ~~C — content pages~~ — done (see 3b).
- **D — GitHub:** build-time typed fetch for repo metadata, with timeout, error handling and fallback.
- **E — motion:** twinkling stars, monitor cursor, shooting star, maybe steam; motion toggle and reduced-motion support.
- **F — CI/CD:** full test suite, `ci.yml`, and `deploy.yml` (manual `workflow_dispatch` only), plus the full README.

---

## 7. Revision 1 — immersive hero, scroll motion, Medium articles

From the updated `plan.md`. This builds on the existing code rather than starting over.

### What changed on the home page

| Before                                      | Now                                                                                             |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Framed 2:1 banner inside the content column | Full-width hero, `min-height: 100svh`, `width: 100%` (not `100vw`, to avoid sideways overflow)  |
| Name as H1 in the profile block             | H1 in the hero, in Pixelify Sans: "Hi! I'm Cemal Gürsel Kar", with your `role` under it         |
| Header always on the page background        | Home: transparent, floating over the hero. Other pages: unchanged, on the solid dark background |
| —                                           | Pixel-art ↓ arrow at the bottom, an accessible link to `#about`                                 |
| "Recent Writings" (local posts)             | "Recent Articles": latest 3 Medium articles, linking straight to Medium                         |

### Hero details (`src/components/ObservatoryHero.astro`)

- Uses `object-fit: cover`, so the crop is set by `--hero-pos` (default `50% 40%`) and, on portrait screens, `--hero-pos-mobile` (default `58% 50%`). The second shifts toward the monitor, mug and cat.
- The comment at the top of the file lists where each landmark sits in the image, so you can tune the crop. On very wide or very tall screens the galaxy and the desk can't both be fully visible.
- A soft dark ellipse behind the title gives contrast, with a light shade under the header and a short fade into the page color at the bottom. Nothing else uses gradients.
- The hero is still the eager, high-priority AVIF/WebP image, now with `sizes="100vw"`. The source image is only 1672px wide, so 4K screens will scale it up.

### Motion

| Effect                                               | How                                                                                                                                   | Turned off by                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Smooth anchor scrolling                              | native `scroll-behavior: smooth`; wheel and touch scrolling are untouched                                                             | reduced motion, toggle        |
| Scroll reveal for About, project cards, article rows | `src/scripts/scroll-motion.ts`, an IntersectionObserver that runs once per element: opacity + 12px, 400ms ease-out, 60ms stagger step | reduced motion, toggle, no JS |
| Hero title fading as you scroll                      | pure CSS scroll-driven animation (no scroll listener); browsers without support skip it                                               | reduced motion, toggle        |
| Page-to-page fade, 180ms                             | native cross-document `@view-transition`; normal navigation where unsupported                                                         | reduced motion, toggle        |
| Gentle bob on the ↓ arrow                            | CSS                                                                                                                                   | reduced motion, toggle        |

- **Never stuck hidden:** content is only hidden for the reveal when `<html>` has the `motion-ready` class. A tiny inline script adds it before first paint, only when the observer API exists and motion is allowed. Without JS nothing is hidden. If the reveal script hasn't started within 3s, the class is removed. Anything that gets keyboard focus becomes visible immediately.
- **Motion toggle** (`src/components/MotionToggle.astro`, in the footer): a "Reduce motion" button (`aria-pressed`) that sets `data-motion="off"` and remembers the choice in localStorage. It's hidden without JS.
- **Phase E is not started:** no twinkling stars, shooting star or monitor animation yet.

### Medium integration

| Piece                                                | File                                                                                     |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Fetch, parse, validate, merge (pure TS, unit-tested) | `src/lib/medium.ts`                                                                      |
| `articles` collection, filled at build time          | `src/content.config.ts`                                                                  |
| Local archive / fallback (you maintain it)           | `src/data/medium-articles.json` (currently `[]`)                                         |
| Config                                               | `mediumFeedUrl`, `mediumProfileUrl`, `mediumAllowedHosts` in `src/config/site.config.ts` |
| Index page                                           | `src/pages/blog/index.astro`, using the rewritten `src/components/PostList.astro`        |

**How it works:**

- **Build time only:** the feed is fetched when the site is built, with an 8s timeout. Visitors' browsers never call Medium, and there's no proxy, backend or scraping.
- **Safe parsing:** the XML is read with `fast-xml-parser` with well-formedness checks and a 3 MB cap. Only title, link, date, categories (max 3) and a short plain-text description are kept.
  - If an item has no `<description>` (Medium personal feeds don't), the description is the first paragraph, cut to 180 characters. The full article is never copied.
  - All HTML is reduced to text, and scripts and styles are dropped with their contents.
- **Links:** only `https://` links on `medium.com`, `*.medium.com` or a host you list in `mediumAllowedHosts` are accepted. Tracking query strings (`?source=rss…`) are removed.
- **Merging:** feed and archive are de-duplicated by URL (the feed wins) and sorted newest first. Rows with an invalid date or URL are skipped.
- **Failures never break the build:** a timeout, HTTP error (403/404/429…), network error, bad XML or a non-Medium feed URL logs a `[medium]` warning, and the site uses the archive. With no archive either, the page shows an honest "No articles published yet".
- **Same tab:** article titles open Medium directly in the same tab, as the plan's default. Screen readers hear "(on Medium)". `/blog` only lists articles and has no local article pages. The list only updates when you rebuild and deploy.

**Archive format** (`src/data/medium-articles.json`), for older articles the RSS no longer includes:

```json
[
  {
    "title": "My article",
    "url": "https://medium.com/@you/my-article-abc123",
    "publishedAt": "2026-01-31",
    "description": "Optional one-line summary.",
    "tags": ["optional"]
  }
]
```

### Removed

These became obsolete, because the plan now says Medium only, with no local article pages and no local RSS. None of them held real content of yours: the only local "post" was the template.

- `src/pages/blog/[slug].astro`
- `src/layouts/ArticleLayout.astro`
- `src/pages/rss.xml.ts`
- `src/content/blog/_template.md`
- `src/lib/reading-time.ts`
- `tests/fixtures/blog/*`
- the `@astrojs/rss` dependency

MDX, KaTeX and Shiki stay, because the project detail pages still render Markdown write-ups.

### Other changes

- **Your CV path:** you had `resumePath: "public/my_cv.pdf"`, which would link to `/public/my_cv.pdf` and 404, because files in `public/` are served from the root. I changed it to `"/my_cv.pdf"`. The link now reads **CV**.
- The About section on the home page has `id="about"` (the arrow's target) and an "About me" H2. Its external links say "(opens in a new tab)" to screen readers.
- Added dependencies: `fast-xml-parser 5.12.1` and `@fontsource-variable/pixelify-sans 5.3.0`, a local font file covering Turkish letters.

### Tests (all unverified)

- `tests/medium.spec.ts`: unit tests for URL rules, parsing, HTML stripping, archive validation, merging, and fallback on 404/429/network error/bad XML/timeout/non-Medium feed URL.
- `tests/content.spec.ts`: rewritten for Medium. Checks the order, invalid rows dropped, links go to HTTPS sources without tracking, plain text only, no local article pages, and 3 articles on home.
  - The fixtures are in `tests/fixtures/medium/`, used when `CONTENT_FIXTURES=1`.
- `tests/home.spec.ts`: rewritten. Checks at 5 widths:
  - hero spans the full width and at least one screen tall
  - one H1 in Pixelify Sans
  - header floats on home only
  - arrow goes to `#about`
  - reveal runs, and focus shows content immediately
  - reduced motion and the toggle turn motion off, and the toggle remembers it
  - without JS, everything is visible
  - the CV link returns a PDF

### Assumptions (please check)

1. **Subtitle:** it shows your config `role` ("Junior Ai/Data Engineer"), not the plan's example "Computer Engineer". Change `role` if you prefer. You may also want "AI" capitalised.
2. **Mobile crop:** `58% 50%` keeps the desk, mug and cat, and loses most of the galaxy on phones. Please look at 390px and 320px.
3. **Descriptions** come from the first paragraph when the feed has none. Tell me if you'd rather show no description.
4. **`mediumAllowedHosts`** is a small addition to the plan's config contract, for publications on custom domains.
5. **Wordmark:** you changed it to your full name, so the header shows that instead of "CGK.".

### What you need to provide

- **`mediumFeedUrl`:** usually `https://medium.com/feed/@<your-username>`.
- **`mediumProfileUrl`:** `https://medium.com/@<your-username>`.
- Optionally, older articles in `src/data/medium-articles.json`.

### Commands

```bash
./setup.sh                      # installs the 2 new packages, then starts dev
pnpm check && pnpm lint && pnpm format:check
pnpm build                      # look for "[medium] … source: …" in the output
pnpm exec playwright install chromium
pnpm test:e2e                   # then run `pnpm build` again before using dist/
```

### Still open (later phases)

- **D:** GitHub metadata.
- **E:** stars, shooting star and monitor animations.
- **F:** CI/CD YAML and the full README.

---

## 8. Revision 2: animated page transitions (option A)

You asked for softer, more noticeable transitions between Home / Projects / Blog / About and chose **option A** (CSS only, no JavaScript).

- **Header:** stays perfectly still between pages (`view-transition-name: site-header`). Only the active-link highlight cross-fades.
- **Page content (`<main>`):** the old page fades out while drifting up 8px (160ms). The new page fades in rising 12px (280ms, starting after 60ms). The whole transition takes about 340ms.
  - **Plan deviation, approved by you:** this is longer than the plan's 150–200ms.
- **Footer and background:** a plain 200ms fade.
- **Different page heights:** the content box snaps to the new height and only the content animates, so the long home page doesn't "stretch" into a short one.
- **Off switches:** OS "reduce motion" and the footer "Reduce motion" toggle both turn it off completely.
- **Browser support:** Chrome, Edge and Safari 18.2+ animate. Browsers without cross-document view transitions (e.g. Firefox) simply open the page normally.
- **Files:** `src/styles/global.css` (transition rules) and `src/components/Header.astro` (one line).
- **Status:** not run or tested. Check it by clicking through the nav in Chrome or Edge.
- **To tune:** the durations and the 8px/12px distances are in the `page-out` / `page-in` rules in `global.css`.

---

## 9. Revision 3: living observatory and interactive terminal

An incremental extension of the hero. The layout, artwork, typography, palette, navigation and the sections below the hero are unchanged.

### How overlays stay aligned: the "stage"

`object-fit: cover` crops the image differently on every screen, so fixed viewport percentages would drift. Instead:

- **The stage:** the hero is a CSS size container. A `.hero-stage` box is computed in pure CSS (container units) to have exactly the size and offset that `cover` + `object-position` would give the image. The image fills that box 1:1.
- **Overlays:** every overlay sits inside a stage, positioned in percentages of the **source image**. Stars, steam, monitor effects and the clickable monitor therefore stay glued to the artwork at any size, ratio or crop, with no JavaScript needed for alignment.
- **Measurements:** all landmarks are measured once, in source pixels, in `src/lib/observatory-map.ts`.
- **Crop controls:** `--hero-px` / `--hero-py`, which replace `--hero-pos`. Same desktop crop as before: 50% / 40%.

### Ambient layers (in `src/components/observatory/`)

| Effect         | Implementation                                                                                                                                                                                                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stars          | `StarField.astro`: 26 pixel stars. Positions, size, opacity and twinkle timing are random but come from a fixed seed (stable builds, no layout shift). They are placed only inside the round window above the mountains, never over the telescope or the painted shooting star. CSS only. |
| Shooting stars | `src/scripts/observatory.ts`: every 15–40 s, random start in the upper sky away from the painted streak and the galaxy, shallow angle, 0.9–1.4 s, Web Animations (transform/opacity)                                                                                                      |
| Coffee steam   | `AmbientEffects.astro`: 4 small pixel squares rising, drifting and fading from the mug rim, around the painted steam                                                                                                                                                                      |
| Monitor        | `MonitorAnimation.astro`: clipped to the measured screen. A blinking green block cursor after the last code line, a stepped lavender scan bar across the small chart, and a very faint screen glow                                                                                        |
| Lamp           | A warm light pool swelling slowly (7 s) between two close levels. No flicker.                                                                                                                                                                                                             |
| Galaxy         | A soft tilted shimmer (11 s) blended over the galaxy. The image never rotates or distorts.                                                                                                                                                                                                |
| Parallax       | Stars ±4 px, galaxy shimmer ±2.4 px. Mouse only (`hover: hover` + `pointer: fine`), rAF-throttled. The image itself never moves, so no gaps can appear.                                                                                                                                   |
| Cat            | **Static**. See missing assets.                                                                                                                                                                                                                                                           |

### Monitor hotspot and terminal

- **`MonitorHotspot.astro`:** a transparent `<button aria-label="Open terminal">` over the measured monitor bezel. Hover or keyboard focus shows a lavender outline and a pixel tooltip `> Open Terminal`. Mouse, touch, Enter and Space all work. It's rendered `hidden` and only revealed by JS when the terminal can work, so there's never a dead button.
- **`InteractiveTerminal.astro`:** a native `<dialog>` (modal semantics, inert page, focus trap) with a navy background, thin lavender border, plex-mono text, three small window "lights", a close button and the `visitor@observatory:~$` prompt.
  - Its data is built at build time from `site.config.ts`, `about.ts`, the projects collection and the Medium articles collection. Nothing is duplicated or invented, and unset links (e.g. LinkedIn, if removed) answer "not configured yet".
- **`src/scripts/terminal/terminal.ts`:**
  - **Open:** the window grows out of the monitor (scale + offset + opacity, 300 ms). The backdrop dims to 55%. The input gets focus and page scroll is locked, with the scrollbar width compensated so the page doesn't shift.
  - **Close:** Escape, the close button, `exit`, or clicking the backdrop. The window shrinks back into the monitor (220 ms) and focus returns to the hotspot.
  - **Input:** Enter runs a command, ↑/↓ browse the history, Ctrl+L clears. Commands are case-insensitive. Output auto-scrolls and is a polite live region.
- **`src/scripts/terminal/commands.ts`:** implements all 12 commands: help, whoami, projects, interests, articles, github, linkedin, resume, date, clear, universe, exit. It's pure data in, data out.
  - **Safety:** input is only compared against this fixed list, everything is rendered with `textContent`, links are re-checked (`https:`, `http:`, `mailto:` or a same-site path only), and the data is embedded with `<` escaped. Nothing is ever executed.
- **`src/scripts/terminal/universe.ts`:** `universe` draws a pixel spiral galaxy, 90 particles on canvas 2D (DPR ≤ 2, rAF, about 9 s). It pauses while the tab is hidden, stops on `clear`, close or another `universe`, and draws a single still frame when motion is off. It's lazy-loaded (separate chunk).

### Performance and accessibility

- **Animation cost:** only `transform` and `opacity` animate, plus `translate` for parallax. There are no layout-affecting animations, and there's no scroll listener.
- **Pausing:** when the hero leaves the viewport, the tab is hidden, or motion is off (OS setting or the footer toggle), `.hero.is-idle` pauses every hero animation, the shooting-star timer stops and parallax listeners are removed. Everything resumes after a back/forward-cache restore, and all observers and listeners are released on a real unload.
- **Without JS:** stars, steam, lamp, galaxy and monitor effects still animate (CSS only). There's no hotspot and no terminal, and all content stays usable.
- **Reduced motion / toggle:** ambient layers rest in a calm static state (steam hidden). No shooting stars, no parallax, and the terminal opens and closes instantly.
- **JS weight:** three small modules in the initial bundle (observatory controller, terminal UI, command registry). The canvas simulation loads only when `universe` is typed. No new dependencies.
- **Mobile:** the terminal is almost full-width, and its input is 16 px so iOS doesn't zoom. `enterkeyhint="go"` and autocorrect/autocapitalize are off, which suits the on-screen keyboard.

### Changed vs. approved design (please confirm)

- **Portrait crop:** `--hero-px` went from 0.58 to **0.43** on portrait screens. At 0.58 the monitor (the terminal's entry point) was half off-screen on phones. Now the monitor is fully visible at 320–768 px portrait, with part of the mug; the cat is now off-screen on phones. Desktop is unchanged.

### Missing assets and limitations

1. **Cat breathing:** there's no isolated cat sprite or layer. Animating the cat would mean stretching part of the bitmap, which the brief forbids, so it stays static. To add it, provide the cat as a separate transparent PNG matching the artwork, ideally plus an "inhale" frame.
2. **Block cursor in the terminal:** the input uses the native caret in lavender. Browsers that support `caret-shape: block` show a block; others show a thin blinking line. A fully custom block cursor would need a hidden-input mirror, which is more fragile on mobile keyboards.
3. **Measured coordinates** come from the 1672×941 source and match the grid I checked. Small visual mismatches (±2 source px) are fixed in `observatory-map.ts`.
4. **Touch discoverability:** as requested, there's no permanent icon over the artwork, so on touch screens the monitor has no hover hint. Hover and focus still show it on desktop.
5. **Browser support:** Firefox has no cross-document view transitions (already noted), but everything in this revision works there.

### Files

- **New:**
  - `src/lib/observatory-map.ts`
  - `src/components/observatory/StarField.astro`
  - `src/components/observatory/AmbientEffects.astro`
  - `src/components/observatory/MonitorAnimation.astro`
  - `src/components/observatory/MonitorHotspot.astro`
  - `src/components/observatory/InteractiveTerminal.astro`
  - `src/scripts/observatory.ts`
  - `src/scripts/terminal/commands.ts`
  - `src/scripts/terminal/terminal.ts`
  - `src/scripts/terminal/universe.ts`
  - `tests/terminal.spec.ts`
  - `tests/observatory.spec.ts`
- **Modified:** `src/components/ObservatoryHero.astro` (stage geometry and layers; title, arrow and shade unchanged) and `README.md`.

### Commands (not run)

```bash
./setup.sh             # or: pnpm dev — no new packages in this revision
pnpm check && pnpm lint && pnpm format:check
pnpm exec playwright install chromium
pnpm test:e2e          # then run `pnpm build` again before using dist/
```

---

## 10. Revision 4: telescope, constellations and viewfinder

You asked for the telescope to be clickable, to draw a **real constellation** (not "CGK"), and to look around when the mouse moves. You also said the cat needs no animation, so it stays static.

### What it does

- **Clicking the telescope** (mouse, tap, Enter or Space) draws a real constellation in the clear sky along the telescope's line of sight, below the galaxy and above the lamp:
  - Its lines draw one by one and its stars pop in.
  - The name (pixel font) and a short note appear under it, and screen readers hear "Ursa Major. The Great Bear — …" through a polite live region.
  - It fades away after 7 s. Each click shows the next one: **Ursa Major → Cassiopeia → Orion → Cygnus → …**
- **Hover or focus** shows the same lavender outline as the monitor, with a pixel tooltip `> Observe the sky`.
- **Mouse over the hero:** a faint viewfinder ring glides after the pointer around the sky, joined to the painted lens by a dashed sight line, as if the telescope were scanning.
  - **Movement:** it moves with heavy, slow easing, follows only over the sky (elsewhere it keeps its last heading), and returns to its rest position along the tube's axis when the mouse leaves.
  - **While a constellation shows:** the viewfinder parks on it.
- **Why not turn the tube itself:** it's part of the painted artwork. Turning it would need a separate telescope-tube sprite; cutting it out of the picture would leave the original tube underneath (a double telescope). If you provide a transparent PNG of the tube, real rotation can replace or join the viewfinder.

### Files

- **New:**
  - `src/lib/constellations.ts`: the 4 asterisms, using real star names and simplified positions
  - `src/components/observatory/TelescopeView.astro`: constellation SVG, label, viewfinder and sight line
  - `src/components/observatory/SceneHotspot.astro`: one shared, accessible hotspot used by both the monitor and the telescope. It replaces `MonitorHotspot.astro`, which was deleted.
  - `src/scripts/telescope.ts`
- **Modified:**
  - `src/lib/observatory-map.ts`: telescope hit area, constellation field, lens and rest point, measured from the artwork
  - `src/components/ObservatoryHero.astro`: wiring
  - `tests/terminal.spec.ts`: tooltip selectors scoped
  - `tests/observatory.spec.ts`: new telescope tests
  - `README.md`

### Behaviour details

- **Performance:** the viewfinder uses transform only, with one rAF loop that stops when it settles. Element sizes are cached with a ResizeObserver, and a single SVG attribute updates the sight line.
- **When there's no viewfinder:** not for touch, reduced motion, the footer toggle, an off-screen hero or a hidden tab.
- **Reduced motion / motion off:** the constellation still appears when clicked (you asked for it), but fully drawn at once, with no animation.
- **Phones and portrait tablets:** the crop hides the telescope there, so its button isn't offered (no invisible focus stop). This is re-checked on resize and rotation. The terminal and monitor are unaffected.
- **Without JS:** no telescope button, as with the monitor.
- **No new dependencies.**

### Please review visually

- Line brightness, label size and placement of the constellation field (`constellationField` in `observatory-map.ts`).
- Viewfinder ring size (`5.2%` in `TelescopeView.astro`) and follow speed (`FOLLOW` in `telescope.ts`).
- At 1440 px wide, the right part of the telescope is cropped by the hero edge. The button still works, and its tooltip is centred over the lens so it stays on screen.

### Commands (not run)

```bash
pnpm dev               # no new packages
pnpm check && pnpm lint
pnpm test:e2e          # then run `pnpm build` again before using dist/
```

---

## 11. Revision 5: telescope zoom and eyepiece

You wanted a click on the sky to zoom into that point and show what the telescope sees, followed by information about it. Decisions you made:

- Everything is drawn in code as pixel art, with no image files.
- The painted galaxy is always Andromeda.
- Empty sky gives a random planet, exoplanet, star or constellation.

### What it does

1. **Aim:** over the sky the cursor becomes a zoom-in cursor. The viewfinder ring keeps following the mouse, as before.
2. **Zoom:** a click (or tap) zooms the artwork about 3.2× in roughly 0.75 s, with the clicked point moving to the centre of the hero. While zoomed, the image is drawn with `image-rendering: pixelated`, so it gets chunky rather than blurry. The title, buttons and scroll arrow fade out.
3. **Eyepiece:** a round lens opens over the zoomed scene.
   - The object inside is painted pixel by pixel on a 128×128 canvas and scaled up. It "comes into focus" by going from blurred to sharp.
   - A faint crosshair and a dark edge make it look like an eyepiece.
4. **Card:** next to the lens (below it on phones) the card shows:
   - the type
   - the name
   - 2–3 facts
   - a short description
   - a Wikipedia link
   - a **Point elsewhere** button that shows another object

   Exoplanets also get the note "Artist's impression", because no telescope can show their surfaces.

5. **Close:** Escape, × or a click outside. The lens fades and the zoom reverses.

### Catalog (`src/lib/sky-catalog.ts`)

| Kind           | Objects                                                                                                           | Drawn as                                                                                                                                                                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Galaxy         | Andromeda (painted galaxy only)                                                                                   | particle disc with spiral arms, bulge, dust lanes, and its companions M32 and M110                                                                                                                                                            |
| Planets        | Saturn, Jupiter, Mars, Neptune                                                                                    | lit, slowly rotating spheres with banded pixel shading and procedural surfaces. Saturn has its rings (including the Cassini division); Jupiter has the Great Red Spot and four orbiting moons; Mars has polar caps; Neptune has its dark spot |
| Exoplanets     | TRAPPIST-1e, Kepler-186f, 51 Pegasi b, HD 189733 b                                                                | the planet lit and tinted by its host star, with the star glowing at the edge of the view                                                                                                                                                     |
| Stars          | Sirius (with Sirius B), Betelgeuse (boiling surface), Polaris (with Polaris B), Vega (flattened by its fast spin) | glowing discs with limb darkening and diffraction spikes                                                                                                                                                                                      |
| Constellations | Ursa Major, Cassiopeia, Orion, Cygnus                                                                             | stars appearing, then lines drawing one by one (shapes from `constellations.ts`)                                                                                                                                                              |

- **Random pick:** first a kind, then an object of that kind, so every kind is equally likely. The same object never comes twice in a row.
- **Facts:** well-known, rounded values.
- **Keyboard path:** the telescope button picks at random including Andromeda, and zooms toward the galaxy when it picks Andromeda.

### Replaced from revision 4

- The constellations drawn directly in the sky, with their label, are gone; constellations now appear inside the eyepiece.
- `constellationField` was removed from `observatory-map.ts`.
- The telescope button now opens the eyepiece.

### Files

- **New:**
  - `src/lib/sky-catalog.ts`: data and `pickObject`
  - `src/scripts/eyepiece/render.ts`: pixel renderer (value noise, sphere, star, rings, galaxy). Loaded only on first use.
  - `src/scripts/eyepiece/eyepiece.ts`: zoom, dialog, card, focus and close
  - `src/components/observatory/Eyepiece.astro`: the dialog's markup and styles
  - `src/scripts/scroll-lock.ts`: scroll lock and the motion check, now shared by the terminal and the eyepiece
  - `tests/sky.spec.ts`: catalog unit tests
- **Modified:**
  - `src/scripts/telescope.ts`: sky clicks, zoom-in cursor, eyepiece wiring
  - `TelescopeView.astro`: only the viewfinder and sight line remain
  - `ObservatoryHero.astro`
  - `observatory-map.ts`
  - `terminal.ts`: uses the shared scroll lock; behaviour is unchanged
  - `tests/observatory.spec.ts`
  - `README.md`

### Behaviour details

- **Accessibility:**
  - The eyepiece is a native modal `<dialog>`, with focus trap and Escape.
  - Focus goes to the close button, and back to the telescope button if that opened it.
  - The canvas is `role="img"` with a label.
  - The name is the dialog's heading and the description is its description.
  - Changes from "Point elsewhere" are announced politely.
- **Reduced motion / motion off:** no zoom, no focus animation, and one finished still frame.
- **Performance:**
  - The renderer is loaded on first click, while the zoom animation runs.
  - It draws at 30 fps on 128×128 pixels, pauses while the tab is hidden, and stops on close.
  - The zoom is a single WAAPI transform.
- **Phones:** the telescope button stays hidden (the telescope is cropped out), but tapping the sky works.
- **No new dependencies.**

### Please review visually

- **Zoom:** strength `ZOOM_SCALE` and duration `ZOOM_MS` in `eyepiece.ts`.
- **Lens size:** `--lens` in `Eyepiece.astro`.
- **Objects:** colours and sizes, each in its painter in `render.ts`.
- **Clickable area:** the sky edge used for clicks, `SKY_MARGIN` in `telescope.ts`.

### Commands (not run)

```bash
./setup.sh             # or: pnpm dev
pnpm check && pnpm lint && pnpm format:check
pnpm test:e2e          # then `pnpm build` again before using dist/
```
