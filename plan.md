# Cemal Gürsel Kar — Interactive Engineering Portfolio

> Implementation contract for Codex. Build **incrementally**, one phase at a time. Do not implement future phases early. After each phase: run checks, show a short summary and changed files, then **STOP and ask for approval**.

## 0. Goal and positioning

Create a polished, fast, accessible, **visibly dynamic** personal portfolio for an early-career AI/ML and data engineer. The site should feel like a carefully designed engineering product, not a generic AI-generated template. The visual direction is **Linear/Apple-level restraint + interactive engineering exhibits**: dark-first, excellent typography, expressive motion, deliberate layout, and deep project pages.

Primary audiences: technical recruiters, AI/LLM engineering hiring managers, and engineering peers. Primary conversion: inspect a project, visit GitHub, download résumé, or make contact. Content language: **English**; code and documentation can be English.

**Source of truth:** user's CV and the actual GitHub repositories. Never invent employers, dates, production deployments, benchmark numbers, achievements, or technologies. Verify each claim from the repository README/code or get user confirmation. Use placeholder labels such as `TODO: verify benchmark` instead of fabricated metrics. CV PDF should be supplied by user and stored under `public/resume/` only after user approval. Avoid exposing phone number by default; email can be shown if approved.

Candidate projects to verify: `astraRag`, `tiny-gpts`, `Clearpath_with_LanguageModels`, `fast_orderbook` (MarketStream), `Financial_AI_Agent_with_ReAct_Architecture`, fish detection, Qwen2.5-Coder LoRA fine-tuning. Repository naming/availability must be checked. GitHub: https://github.com/cemalgurselkar.

## 1. Fixed technology decisions

- **Next.js App Router**, **React**, **TypeScript** with strict mode. Use current compatible stable versions at implementation time; commit lockfile.
- **Tailwind CSS** with CSS custom properties/design tokens. Prefer custom components; **shadcn/ui + Radix primitives** only for accessible interactive controls where needed. No full pre-made portfolio themes.
- **Motion for React** (`motion/react`) for orchestrated entrances, hover, scroll and route-level transitions; native CSS for inexpensive micro-interactions.
- **React Three Fiber + Drei + Three.js**, **only** for a single optional hero visualization or dedicated exhibit. Lazy-load, throttle, and provide static fallback. Do not make WebGL mandatory for navigation.
- **Recharts** for benchmark/data plots; use plain SVG/CSS for pipeline and architecture diagrams when possible.
- **MDX** (e.g. `@next/mdx` or Contentlayer alternative if actively maintained) for hand-curated technical case studies, typed metadata, no CMS or database in v1.
- **Lucide React** icons; **next/font** for optimized typography (e.g. Geist Sans + Geist Mono, subject to license/availability).
- **Vercel** for initial deployment; DNS/custom domain configured later. GitHub API only for optional nonessential repo metadata; use server-side cached requests (`revalidate`), graceful fallback on rate limits. Never expose secrets to client.
- **Vitest + React Testing Library** for unit/component tests; **Playwright** for smoke and navigation tests; **ESLint**, TypeScript checks, Prettier. Accessibility checks with axe where practical.
- **No backend, database, auth, analytics tracker, paid inference API, or contact form in v1.** Contact via `mailto:` and external links. Demos should use honest, reproducible sample data, clearly labeled as simulation.

## 2. Anti-slop design rules (non-negotiable)

1. No stock AI brain art, generic neon-glow blobs, particle wallpaper, glassmorphism everywhere, fake terminals, random gradient text, or generic three-card grid on every section.
2. Use a **strong editorial grid**, deliberate negative space, clear typographic hierarchy, restrained palette (charcoal/near-black, warm off-white, **one** muted accent), subtle borders and generous rhythm.
3. Every animation must communicate state, causality, hierarchy, or navigation. No perpetual bouncing, excessive parallax, or animation just to look busy.
4. Use **one memorable hero interaction** plus project-specific micro-experiences. Distinct project layouts: don't repeat identical cards and templates everywhere.
5. Prefer actual diagrams, charts, verified project visuals, code excerpts, and technical explanations over decoration.
6. Use purposeful asymmetry and strong responsive composition; desktop and mobile must feel intentionally designed.
7. Make it **dynamic, not noisy**: cursor-responsive hero visualization, animated system flows, hover previews, scroll-linked reveals, interactive filters, charts with tooltips, and functional demos. Motion should be quick and responsive.
8. Provide a `prefers-reduced-motion` path, keyboard equivalents for hover-only effects, and readable content without JS/WebGL where feasible.
9. Don't put unverified achievements or decorative fake data into production copy. Label synthetic benchmark/demo values as samples.
10. Before implementing a component, write a one-sentence rationale explaining what interaction teaches or enables.

## 3. Information architecture

- `/` — Hero, concise positioning, featured work (3–4 curated projects), engineering focus, experience teaser, clear contact CTA.
- `/projects` — Filterable project index (LLM/RAG, Robotics/CV, Data Engineering, ML Foundations); filters update visible items and optionally URL query parameters.
- `/projects/[slug]` — Case studies: problem → constraints → architecture → engineering decisions → implementation → evidence/results → limitations → repository. Include a **project-specific interactive exhibit** if meaningful.
- `/playground` — Curated client-side demonstrations; only launch after core pages are complete.
- `/resume` — Readable, accessible experience, skills, education; download verified PDF.
- `/writing` — Optional MDX technical articles, deferred until content exists.
- `/contact` — Minimal email, GitHub, LinkedIn (only if URL confirmed).
- SEO: page metadata, OG images, canonical URLs, sitemap, robots, JSON-LD Person, meaningful image alt text.

## 4. Motion and interaction specification

**Hero:** prominent name and sharp engineering tagline. A lightweight interactive **system graph** responds to pointer/focus, with a few labeled nodes (e.g. Models → Retrieval → Agents → Systems). Nodes and edges convey information rather than random particles. Use SVG + Motion initially; only adopt R3F if it materially improves the result and meets performance budgets. Hero remains readable while graph animates. Provide keyboard and reduced-motion fallback.

**Project index:** responsive editorial cards, meaningful hover/focus preview (e.g. architecture snippet), animated filter transitions, accessible labels. No forced scroll hijacking.

**Case-study exhibits:**
- `astraRag`: switch retrieval strategies; show verified metrics if available; otherwise clearly labeled sample demo; explain hit@k and latency.
- `tiny-gpts`: inspect a tiny token-to-attention flow, with explanatory tooltips; **do not pretend to run a real GPT**.
- `Clearpath`: step-through state machine for natural-language request → perception → navigation → manipulation, with clear simulated state.
- `MarketStream`: play/pause event flow through ingestion → stream processing → storage → API, with backpressure/latency explanations; label synthetic events.
- `Financial AI Agent`: step-by-step ReAct trace from a documented example, redacting private data.

**Global:** animated active nav indicator, progress indicator on long case studies, tasteful reveal-on-scroll, smooth anchor links (respect reduced motion), visible hover/focus states, functional mobile menu. Prefer 150–350 ms interaction timings; avoid motion that delays access to content.

## 5. Content model and file layout

Suggested structure (adjust only with explanation):

```text
src/
  app/
    layout.tsx
    page.tsx
    projects/page.tsx
    projects/[slug]/page.tsx
    playground/page.tsx
    resume/page.tsx
    contact/page.tsx
    globals.css
  components/
    layout/{header,footer,mobile-nav}.tsx
    ui/{button,section-heading,project-card}.tsx
    motion/{reveal,system-graph}.tsx
    exhibits/{rag-benchmark,transformer-flow,robot-state-machine,stream-pipeline}.tsx
  content/projects/*.mdx
  data/{projects,experience,skills}.ts
  lib/{github,utils}.ts
  styles/tokens.css
public/
  projects/
  resume/
tests/
```

Typed project metadata: `slug`, `title`, `summary`, `categories`, `tech`, `githubUrl`, `featured`, `cover`, `evidenceLinks`, `verifiedMetrics`, `status`. Each project must link to its original evidence. For unverified claims, use drafts/TODO and keep them off published pages.

## 6. Implementation phases — **one at a time**

### Phase 0 — Discovery and content audit (NO site implementation)
- Inspect existing repo, package manager, GitHub project READMEs and supplied CV.
- Create `docs/content-audit.md` mapping project claims → evidence URLs, and `docs/design-brief.md` with audience, visual principles, layout references (described, not copied), typography, palette, motion plan, accessibility plan.
- List unknowns (LinkedIn URL, approved email, résumé PDF, domain, employment dates, performance metrics) without inventing answers.
- Produce page-by-page wireframe descriptions and an interaction inventory with rationale.
- **Gate:** show audit and brief; STOP for user approval.

### Phase 1 — Foundation and design system
- Bootstrap Next.js/TS/Tailwind, linting, formatting, testing, path aliases.
- Define tokens for color, typography, spacing, radii, shadows, motion duration; implement typography and grid.
- Build responsive header/footer, navigation, skip link, light semantic page shell, metadata defaults, custom 404.
- Verify responsive widths 360/768/1280/1440; keyboard navigation and reduced motion.
- **Gate:** screenshot/describe desktop + mobile shell; checks pass; STOP.

### Phase 2 — Homepage with signature interaction
- Build hero, animated **SVG system graph**, featured-project teasers, focus areas, experience teaser, CTA.
- Interaction must respond to mouse **and keyboard**, with no pointer dependence. No heavy WebGL yet.
- Use real verified copy only. Optimize above-the-fold performance and layout stability.
- **Gate:** provide screenshots and interaction notes, test results; STOP.

### Phase 3 — Projects index and content engine
- Create typed project registry + MDX case study pipeline.
- Build `/projects` filters, accessible transitions, responsive distinct project previews, valid GitHub links.
- Include only confirmed repository data; clearly mark draft case studies for later.
- **Gate:** show working filtering, tests, mobile checks; STOP.

### Phase 4 — First deep case study: astraRag
- Write evidence-backed case study and architecture diagram.
- Implement accessible interactive retrieval strategy explorer with metrics only if verified. Provide definitions and limitations.
- Add unit tests for chart/data transforms and keyboard interactions.
- **Gate:** user reviews factual accuracy and design; STOP.

### Phase 5 — Additional case studies, one per iteration
- Iteration 5a: `Clearpath` with interactive robot workflow.
- Iteration 5b: `tiny-gpts` with attention/token explainer.
- Iteration 5c: `MarketStream` with event pipeline playback.
- Iteration 5d: Financial AI Agent and other verified projects.
- For **each iteration**: research → content → interaction → tests → user approval → STOP. Do not batch.

### Phase 6 — Résumé and contact
- `/resume` with verified experience, education, grouped skills and clear PDF download (if supplied).
- `/contact` with approved contact details; optional copy-email interaction with accessible feedback.
- **Gate:** verify every date, role, URL and file; STOP.

### Phase 7 — Playground (optional, only after approval)
- Build an index of 2–3 lightweight educational demos based on existing exhibits.
- No fake live AI, no unnecessary backend or GPU bills. Each demo has explanatory text and a simulation disclosure.
- **Gate:** usability and performance review; STOP.

### Phase 8 — Polish, QA and launch
- Test mobile, tablet, desktop, Safari/Chrome/Firefox where possible; keyboard, screen reader basics, reduced motion, loading/empty/error states.
- Run `lint`, `typecheck`, unit tests, Playwright smoke tests, production build, and Lighthouse.
- Targets: Lighthouse Performance/Accessibility/Best Practices/SEO >= 90 where practical; CLS < 0.1; LCP < 2.5 s on a representative mobile test; keep JS small and avoid blocking WebGL.
- Add sitemap, robots, social previews, favicon, canonical metadata; verify all external links.
- Deploy preview first. Only connect production domain after user confirms registrar/DNS details and reviews preview.
- **Gate:** deployment checklist + remaining issues; STOP.

## 7. Codex operating rules

**Mandatory workflow for every phase:**
1. Read this `plan.md` and current repository state.
2. State phase objective, exact files expected to change, dependencies and acceptance criteria.
3. Implement **only that phase**, in small coherent commits if git is available.
4. Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` (or explain any command not yet configured). Run browser tests when relevant.
5. Inspect UI at mobile and desktop sizes; fix obvious visual or accessibility issues.
6. Report what changed, checks performed, unresolved issues, and suggested next phase.
7. **STOP. Do not continue until I explicitly say to proceed.**

Avoid installing dependencies unless they are needed for the current phase. No broad refactors, speculative abstractions, or premature backend work. Never overwrite existing work without inspecting it. Use semantic HTML and accessible components. Keep content and presentation separate. Never claim a feature works without testing it.

## 8. Definition of done

A successful portfolio is memorable **because visitors can explore actual engineering work**, not because the page is covered in animations. Visitors can identify the owner's specialization within seconds, inspect meaningful case studies, verify claims against GitHub, access the résumé, and contact the owner. Interactions remain smooth on mid-range mobile devices and do not obstruct reading or accessibility.

## 9. First prompt to give Codex

> Read `plan.md` in full. Start **Phase 0 only**. Audit my GitHub profile `https://github.com/cemalgurselkar` and the CV available in the workspace. Produce `docs/content-audit.md` and `docs/design-brief.md` with evidence-backed claims, missing information, design direction, wireframe descriptions and a concrete interaction inventory. Do not scaffold Next.js or write UI code yet. Show your findings and **STOP** for my approval before Phase 1.
