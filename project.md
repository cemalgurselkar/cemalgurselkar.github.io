# Project progress

What has been built from `plan.md` so far, what was decided along the way, and what still needs your input.

**Status:** phases A, B and C are written, and **revision 1** (redesigned phase B plus Medium integration, from the updated `plan.md`) is written on top of them. Work stops here for your review. Nothing in revision 1 has been installed, built or tested yet, so all of it is **unverified**. Revision 1 replaces some phase B/C details described further down; see section 7 for what changed.

---

## 1. Starting point

- Your working tree already had the old Next.js site deleted (uncommitted). I did not restore or touch those files. Git still has them in history.
- The only files left were `plan.md`, `.gitignore`, `.dockerignore` and the hero image `a_clean_atmospheric_pixel_art_night_observatory_w.png` (1672×941).
- Real profile data (name, GitHub, email, project descriptions) was taken from the old `src/data/profile.ts` and `src/data/projects.ts` in git history, so nothing was invented.

## 2. Phase A — setup

| File | Purpose |
|---|---|
| `package.json` | Exact pinned versions, pnpm 10, scripts: `dev`, `build`, `preview`, `check`, `lint`, `format`, `format:check`, `test:e2e` |
| `.nvmrc` | Node `24.22.3` (current LTS) |
| `astro.config.mjs` | Static output and Tailwind via Vite. `site` and `base` come from the `SITE_URL` / `BASE_PATH` env vars, because the domain isn't decided yet |
| `tsconfig.json` | `astro/tsconfigs/strict` |
| `eslint.config.js`, `.prettierrc.json`, `.prettierignore` | Lint and format setup, including Astro files |
| `.gitignore` | Replaced the Next.js entries with Astro ones (`dist/`, `.astro/`) |
| `src/styles/tokens.css` | Every color, spacing and font token from plan §3, the single source of truth |
| `src/styles/global.css` | Tailwind import, maps Tailwind tokens to the CSS variables, base styles, focus ring, reduced-motion rule |
| `src/layouts/BaseLayout.astro` | `<html lang>`, meta/OG tags, canonical (only when a site URL exists), skip link, header/footer |
| `src/config/site.config.ts` | Profile, links, current focus and featured repos, with the typed contract from plan §8 |
| `src/lib/paths.ts` | `withBase()` so every internal link works under a GitHub Pages sub-path |
| `src/lib/reading-time.ts` | Approximate reading time (220 wpm) |
| `public/favicon.svg` | Small pixel-art favicon in the palette colors |
| `README.md` | Short guide: requirements, commands, how to edit content |

### Versions (checked on the npm registry on 2026-11-26)

Astro **7.4.13**, Tailwind **4.3.5**, TypeScript **6.0.3**, ESLint **10.15.0**, Playwright **1.65.1**, pnpm **10.34.9**.

- **TypeScript is 6, not 7:** `@astrojs/check` and `typescript-eslint` don't support TS 7 yet.
- **pnpm is 10, not the newest 12:** I know its build-script approval setting (`onlyBuiltDependencies` for `sharp`/`esbuild`) works.
- **Astro 7 changes I followed:** `z` is imported from `astro/zod` (Zod 4), collections use `id` instead of `slug`, and `compressHTML: true` is set explicitly because Astro 7 changed the default whitespace handling.

## 3. Phase B — static UI

| File | What it does |
|---|---|
| `src/components/Header.astro` | `CGK.` wordmark, nav with `aria-current` and a small square "pixel" marker on the active page. Below 560px it switches to a `<details>` menu, which works without JavaScript |
| `src/components/ObservatoryHero.astro` | Framed hero using `<Picture>` (AVIF and WebP, 640–1672w, eager loading, high fetch priority, `alt=""` because it's decorative) |
| `src/components/ProfileIntro.astro` | The only H1 (your name), role, tagline, bio, links. Links with no value are hidden |
| `src/components/CurrentFocus.astro` | Green square dot and "Currently exploring …" |
| `src/components/ProjectCard.astro` | Title links to `/projects/<id>`, a separate GitHub icon links to the repo (no nested anchors), plus a technology list |
| `src/components/PostList.astro` | Thin-line list: date, title, category, reading time. Shows an honest empty state |
| `src/components/Icon.astro` | Three Lucide icons as static inline SVG, with no icon library at runtime |
| `src/pages/index.astro` | Home page: hero → profile → focus → 2-column projects (max 4) → last 3 posts |
| `src/content.config.ts` | `blog` and `projects` collections with the schemas from plan §8. Drafts are hidden in production |
| `src/content/projects/*.md` | AstraRAG and MarketStream (featured), Clearpath (not featured), all with real descriptions |
| `src/content/blog/_template.md` | Post template, ignored by the loader because of the leading `_` |
| `src/assets/observatory-night.png` | A **copy** of your image. The original in the repo root is untouched |
| `playwright.config.ts`, `tests/home.spec.ts` | Tests at 1440/1024/768/390/320px: no horizontal overflow, aligned left edges, one H1, nav reachable, full-page screenshot per width. Also checks the skip link |

### How the hero crop works

The image is about 16:9, and plan §4 asks for a wide banner that never crops blindly. So:

- **Mobile (<768px):** the full image, uncropped.
- **≥768px:** a **2:1** window. The image is shifted up 5%, cutting about 45% of the hidden part from the top and about 55% from the bottom. The galaxy and the full desk both stay visible.
- To adjust it, change `--hero-ratio` and `--hero-shift` in `ObservatoryHero.astro`.
- The image sits on a "stage" that keeps its native ratio. Later animation overlays use coordinates of the native image, so they follow the same crop automatically.

## 3b. Phase C — content pages

### New routes

| Route | File | Notes |
|---|---|---|
| `/projects` | `src/pages/projects/index.astro` | Every published project, ordered by `order`, 2 columns (1 on mobile) |
| `/projects/<id>` | `src/pages/projects/[slug].astro` | Title, description, technologies, Repository link, extra `links`, then the write-up. With no write-up yet, it says so honestly |
| `/blog` | `src/pages/blog/index.astro` | All published posts, newest first. Empty state while there are none |
| `/blog/<id>` | `src/pages/blog/[slug].astro` + `src/layouts/ArticleLayout.astro` | Title, summary, date, updated date, reading time, category, tags, content, older/newer links. No hero image |
| `/about` | `src/pages/about.astro` + `src/config/about.ts` | Intro, interests, experience, education, tools, contact/CV. All text is editable in `about.ts`; nothing like "recent graduate" is hardcoded |
| 404 | `src/pages/404.astro` | Small pixel telescope, links to Home and Blog; works under a base path |
| `/rss.xml` | `src/pages/rss.xml.ts` | Published posts only. Disabled (404) until `SITE_URL` is set, so no fake domain |
| sitemap | `astro.config.mjs` | `@astrojs/sitemap` turns on only when `SITE_URL` is set; drafts have no route, so they're never listed |

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
repo: cemalgurselkar/astraRag        # → "Repository" button
links:                                # → extra buttons, in this order
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

| Before | Now |
|---|---|
| Framed 2:1 banner inside the content column | Full-width hero, `min-height: 100svh`, `width: 100%` (not `100vw`, to avoid sideways overflow) |
| Name as H1 in the profile block | H1 in the hero, in Pixelify Sans: "Hi! I'm Cemal Gürsel Kar", with your `role` under it |
| Header always on the page background | Home: transparent, floating over the hero. Other pages: unchanged, on the solid dark background |
| — | Pixel-art ↓ arrow at the bottom, an accessible link to `#about` |
| "Recent Writings" (local posts) | "Recent Articles": latest 3 Medium articles, linking straight to Medium |

### Hero details (`src/components/ObservatoryHero.astro`)

- Uses `object-fit: cover`, so the crop is set by `--hero-pos` (default `50% 40%`) and, on portrait screens, `--hero-pos-mobile` (default `58% 50%`). The second shifts toward the monitor, mug and cat.
- The comment at the top of the file lists where each landmark sits in the image, so you can tune the crop. On very wide or very tall screens the galaxy and the desk can't both be fully visible.
- A soft dark ellipse behind the title gives contrast, with a light shade under the header and a short fade into the page color at the bottom. Nothing else uses gradients.
- The hero is still the eager, high-priority AVIF/WebP image, now with `sizes="100vw"`. The source image is only 1672px wide, so 4K screens will scale it up.

### Motion

| Effect | How | Turned off by |
|---|---|---|
| Smooth anchor scrolling | native `scroll-behavior: smooth`; wheel and touch scrolling are untouched | reduced motion, toggle |
| Scroll reveal for About, project cards, article rows | `src/scripts/scroll-motion.ts`, an IntersectionObserver that runs once per element: opacity + 12px, 400ms ease-out, 60ms stagger step | reduced motion, toggle, no JS |
| Hero title fading as you scroll | pure CSS scroll-driven animation (no scroll listener); browsers without support skip it | reduced motion, toggle |
| Page-to-page fade, 180ms | native cross-document `@view-transition`; normal navigation where unsupported | reduced motion, toggle |
| Gentle bob on the ↓ arrow | CSS | reduced motion, toggle |

- **Never stuck hidden:** content is only hidden for the reveal when `<html>` has the `motion-ready` class. A tiny inline script adds it before first paint, only when the observer API exists and motion is allowed. Without JS nothing is hidden. If the reveal script hasn't started within 3s, the class is removed. Anything that gets keyboard focus becomes visible immediately.
- **Motion toggle** (`src/components/MotionToggle.astro`, in the footer): a "Reduce motion" button (`aria-pressed`) that sets `data-motion="off"` and remembers the choice in localStorage. It's hidden without JS.
- **Phase E is not started:** no twinkling stars, shooting star or monitor animation yet.

### Medium integration

| Piece | File |
|---|---|
| Fetch, parse, validate, merge (pure TS, unit-tested) | `src/lib/medium.ts` |
| `articles` collection, filled at build time | `src/content.config.ts` |
| Local archive / fallback (you maintain it) | `src/data/medium-articles.json` (currently `[]`) |
| Config | `mediumFeedUrl`, `mediumProfileUrl`, `mediumAllowedHosts` in `src/config/site.config.ts` |
| Index page | `src/pages/blog/index.astro`, using the rewritten `src/components/PostList.astro` |

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
