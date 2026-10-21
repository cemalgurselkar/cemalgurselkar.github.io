# Portfolio Design Brief

Status: Phase 0 discovery artifact  
Date: 2026-10-21  
Implementation language: English  
Deployment constraint: static-export-compatible Next.js for user-managed GitHub Pages deployment

## Objective

Build a restrained, technically credible portfolio that lets a recruiter understand Cemal’s focus in seconds and lets an engineer inspect evidence in minutes. The memorable element should be the clarity of the systems and trade-offs—not decorative animation.

Primary visitor path:

1. Understand the specialization: AI/ML systems, retrieval/agents, and data infrastructure.
2. Open one strong project.
3. Inspect architecture, decisions, evidence, and limitations.
4. Continue to GitHub, résumé, or an approved contact channel.

## Audience

### Technical recruiter

Needs immediate role fit, a concise skills signal, clear project titles, education/resume access, and working links. The interface should not require technical interaction to reveal the core story.

### AI/LLM engineering hiring manager

Needs proof that model integration is supported by retrieval design, evaluation, failure analysis, and practical constraints—not just API calls.

### Data/platform engineering peer

Needs inspectable system boundaries, storage and reliability choices, benchmark methodology, reproducibility, and honest limitations.

## Positioning

Provisional positioning statement, pending user approval:

> I build inspectable AI and data systems—from retrieval and local models to streaming pipelines and robot workflows.

This is deliberately broader than “AI developer” but narrower than claiming production-scale ML engineering. The supporting proof comes from AstraRAG, MarketStream, Clearpath, and Vectorch.

## Visual direction

### Concept: engineered editorial notebook

The site combines the calm hierarchy of a high-end product page with the evidence density of a well-edited engineering notebook. Large type and negative space establish confidence; fine rules, annotations, diagrams, and compact measurements reward deeper inspection.

Reference qualities, described rather than copied:

- Linear-like precision: compact navigation, disciplined spacing, quiet borders, fast state changes.
- Apple-like restraint: few simultaneous messages, strong typographic scale, motion that explains spatial relationships.
- Technical paper/lab notebook: numbered figures, captions, source links, methods, assumptions, and limitations beside results.
- Systems console without fake terminal styling: live-looking behavior comes from meaningful diagrams and state changes, not green monospace decoration.

Avoid generic feature-card grids, neon gradients, particle fields, glass panels, fake prompts, and repeated identical project cards.

## Design tokens for Phase 1

These values are a starting contract and should be checked for contrast in implementation.

| Role                | Proposed token | Intent                                              |
| ------------------- | -------------- | --------------------------------------------------- |
| Canvas              | `#0B0D0E`      | Near-black with less glare than pure black          |
| Raised surface      | `#121516`      | Quiet grouping, used sparingly                      |
| Primary text        | `#F1EEE8`      | Warm off-white                                      |
| Secondary text      | `#A6ADAA`      | Cool neutral; verify WCAG contrast at final sizes   |
| Hairline            | `#293031`      | Structure without heavy boxes                       |
| Accent              | `#83B5A5`      | One muted mineral green for state, links, and focus |
| Critical/held claim | `#D69A82`      | Limited use in evidence/limitation labels           |

Typography:

- Sans: Geist Sans through `next/font`, subject to availability at implementation time.
- Mono: Geist Mono for measurements, labels, and code—not body paragraphs.
- Hero display should use the same sans family with careful size, tracking, and wrapping rather than a decorative display font.
- Body measure: approximately 62–72 characters on long-form pages.

Layout:

- Twelve-column desktop grid with deliberately uneven spans; four-column mobile grid.
- Content maximum around 1280 px, with a narrower reading column inside case studies.
- Spacing follows a small token scale; sections gain hierarchy through rhythm rather than containers around everything.
- Project previews alternate composition according to their evidence: chart, pipeline, state machine, or annotated code—not a repeated three-card template.

## Motion principles

- Motion communicates traversal, selection, causality, or data change.
- Default timings: 150–220 ms for control feedback; 240–350 ms for content transitions.
- Entrance sequences are short and stop after establishing hierarchy.
- Scroll reveals must not hide readable content when JavaScript is absent.
- `prefers-reduced-motion` removes transforms and animated paths while preserving state through color, labels, and immediate updates.
- No motion may delay navigation, reading, or keyboard operation.

## Accessibility plan

- Semantic landmarks, one logical `h1`, sequential headings, skip link, and descriptive page titles.
- Full keyboard support for navigation, filters, diagrams, and exhibits.
- Hover-only details receive focus/click equivalents and persistent text alternatives.
- Visible focus ring using the accent plus adequate offset.
- Charts include a text summary/table; diagrams include ordered text descriptions.
- Do not encode project category, metric direction, or state with color alone.
- Minimum 44×44 px touch targets for primary mobile controls where practical.
- Respect zoom, reflow at 320–360 px, reduced motion, and forced-colors/high-contrast behavior where possible.
- Images receive meaningful alt text; decorative lines and textures are hidden from assistive technology.
- Automated axe checks supplement, but do not replace, keyboard and manual reading-order checks.

## Static hosting constraints

The user will deploy to GitHub Pages. Phase 1 should therefore plan for:

- `output: "export"` and fully static routes.
- Static generation of every project slug; no runtime route handlers or server actions.
- No essential runtime GitHub API request. Repository facts should live in audited local content; optional metadata can be refreshed during development/build only.
- Asset paths that work both on a custom domain and, if needed, a repository subpath. Final domain/repository topology must be confirmed before configuration.
- Image handling compatible with static export; do not depend on Vercel image optimization.
- A GitHub Actions deployment workflow may be added only in the launch phase if the user wants it; deployment remains user-owned.

## Information architecture and page wireframes

### `/` — homepage

1. **Header:** name mark on the left; Work, About/Resume, Contact on the right; active route indicator. Mobile uses an accessible menu button and a simple full-width panel.
2. **Hero split:** left contains name, one sharp positioning line, and two actions (“Explore selected work”, “View GitHub”). Right contains the interactive system graph. The graph never competes with the `h1`.
3. **Evidence rail:** a compact row naming four domains—retrieval, streaming, robotics, vector systems—without unverifiable totals.
4. **Selected work:** four editorial project stories. AstraRAG leads with a retrieval comparison; MarketStream uses a horizontal event path; Clearpath uses staged robot states; Vectorch uses a scale/latency curve. Each preview has different geometry.
5. **Engineering focus:** three short principles—evaluate retrieval, expose system boundaries, document limitations—with links to supporting evidence.
6. **Background teaser:** verified education/resume excerpt only after CV review.
7. **Contact close:** one sentence and approved email/LinkedIn/GitHub links.

Rationale: the homepage moves from identity to proof to working style to contact without repeating the same pitch.

### `/projects` — project index

1. Intro with project count derived from the typed registry and a short note that claims link to evidence.
2. Accessible category filters: LLM/RAG, Robotics/CV, Data Engineering, ML Foundations.
3. Asymmetric project list with evidence status, key technologies, one architecture cue, and repository link.
4. Draft/held projects remain absent from production or clearly labeled in development—not presented as incomplete public work.

Rationale: filtering helps role-specific visitors narrow the portfolio while the varied previews reveal what is technically distinctive about each project.

### `/projects/[slug]` — case-study shell

1. Breadcrumb, project title, one verified sentence, repository link, and status.
2. Sticky desktop chapter index / compact mobile progress control.
3. Problem and constraints.
4. Architecture figure with text equivalent.
5. Engineering decisions and alternatives.
6. Project-specific exhibit.
7. Evidence/results with methodology adjacent to every metric.
8. Limitations and next steps.
9. Source links and next-project navigation.

Rationale: every case study follows a stable reasoning sequence while its central exhibit and evidence layout remain project-specific.

### `/projects/astrarag`

- Hero visual: query splitting into sparse, dense, hybrid, and routed paths.
- Interactive comparison: choose retrieval strategy; see Hit@K/MRR/nDCG/latency definitions and audited values.
- Context panel names 40 queries, five PDFs, 314 chunks, warm local measurements.
- Limitation callout covers hardware dependence, OCR/layout gaps, and the placeholder evaluation command.

Rationale: strategy switching teaches why retrieval quality and latency must be evaluated together.

### `/projects/marketstream`

- Event pipeline arranged left-to-right on desktop and top-to-bottom on mobile.
- Play/pause advances a labeled synthetic event through ingestion, Kafka, processing, storage, and serving.
- Backpressure view distinguishes target, produced, written, queued, and latency values.
- Evidence links open the exact report rather than presenting target EPS as achieved throughput.

Rationale: the animation makes asynchronous flow and backlog causality understandable without pretending to stream live market data.

### `/projects/clearpath`

- State sequence: command → parsed task → scan → detect → navigate → align → grasp.
- Visitors can step forward/backward; the diagram names the ROS topic emitted at each transition.
- Persistent “Simulation” label and text transcript.

Rationale: stepping through the workflow teaches how a language instruction becomes bounded robot states and messages.

### `/projects/vectorch`

- Durability diagram: in-memory mutation → new generation → atomic publish → reopen.
- Scale chart shows exact-search p50/QPS from 10K to 1M with hardware/method note always visible.
- Toggle between cosine, dot, and squared L2 explanations; do not imply ANN support.

Rationale: the exhibit connects storage correctness and exact-search scaling to explicit engineering trade-offs.

### `/projects/tiny-gpts`

- Token path: embedding → normalized attention block → residual → MLP → logits.
- Focus or click reveals tensor-role explanations, not fabricated activations.
- Clearly state that this is an explainer based on code structure, not a model running in-browser.

Rationale: the interaction turns implementation structure into an inspectable mental model.

### `/projects/financial-agent`

- A pre-reviewed trace steps through question, tool selection, observation, and final synthesis.
- Private values are removed; external-data timestamps are explicit.
- No chain-of-thought claim, investment recommendation, or accuracy score is shown.

Rationale: the trace demonstrates orchestration and tool boundaries without exposing sensitive reasoning or presenting financial advice.

### `/resume`

- Accessible HTML résumé first; grouped experience, education, skills, and selected projects.
- PDF download appears only when a verified user-supplied file exists.
- Print stylesheet provides a clean fallback.

Rationale: recruiters can scan, copy, print, and download the same verified facts without relying on an embedded PDF viewer.

### `/contact`

- One short invitation plus GitHub, approved email, and confirmed LinkedIn.
- Optional copy-email button with visible and screen-reader feedback.
- No form, tracking, backend, phone number, or availability promise.

Rationale: the page creates a low-friction next step without introducing a backend or collecting visitor data.

### `/playground` — deferred

- Launch only after core pages are approved.
- Reuse two or three educational exhibits; every simulation carries a persistent disclosure.

### `/writing` — deferred

- Do not expose an empty route. Add it when at least one reviewed MDX article exists.

### `404`

- Short plain-language message, route back to work, and the same navigation shell.

## Interaction inventory

| Interaction                 | Input and fallback                                               | What it teaches or enables                                                   |
| --------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Active navigation indicator | Route state; static underline with reduced motion                | Shows location without adding navigation delay                               |
| Mobile navigation           | Button, Escape, focus return                                     | Makes every primary route reachable on small screens and by keyboard         |
| Hero system graph           | Pointer, focus, arrow/tab selection; static labeled SVG fallback | Communicates the relationship between models, retrieval, agents, and systems |
| Project filters             | Click/keyboard; optional query string; unfiltered no-JS list     | Lets hiring visitors narrow work by discipline without hiding evidence       |
| Project preview focus       | Hover and focus reveal; summary always visible                   | Offers an architecture clue before navigation                                |
| Case-study progress         | Scroll-derived with semantic chapter links                       | Helps readers orient within long technical narratives                        |
| AstraRAG strategy selector  | Tabs/radio group; metric table fallback                          | Demonstrates retrieval quality/latency trade-offs                            |
| MarketStream playback       | Play, pause, step, reset; ordered-list fallback                  | Explains event flow, buffering, and backpressure causality                   |
| Clearpath state machine     | Previous/next/direct step; full transcript fallback              | Maps language input to ROS state transitions                                 |
| Vectorch scale chart        | Focusable points plus data table                                 | Shows why exact search slows as the corpus grows                             |
| Tiny GPT token flow         | Focus/click nodes; static ordered explanation                    | Explains the role of attention and residual blocks without fake inference    |
| Financial agent trace       | Step controls; redacted full transcript                          | Shows tool choice and observations without claiming live advice              |
| Copy email                  | Click/keyboard; visible text remains selectable                  | Reduces contact friction while retaining a standard mail link                |
| Reduced-motion mode         | OS preference                                                    | Preserves meaning and access without animated paths or transforms            |

## Content presentation rules

- Every component begins implementation with a one-sentence rationale tied to visitor understanding or task completion.
- Every project claim links to a repository, file, report, or user-confirmed CV fact.
- Metrics use tabular numerals and carry dataset/workload, hardware, date, and limitation context.
- “Built,” “implemented,” and “measured” are preferred over inflated adjectives.
- Use “simulation,” “prototype,” “local benchmark,” “exact baseline,” and “external data” wherever those distinctions matter.
- Repository naming may be normalized for display (`AstraRAG`, `MarketStream`, `Vectorch`) while URLs retain their actual names.

## Performance plan

- Start the hero with SVG and Motion; do not add WebGL unless measured value justifies it later.
- Server components/static content by default; client components only around genuine interactions.
- Lazy-load below-the-fold exhibits and charts.
- Avoid autoplay loops and large background media.
- Pre-size images and diagrams to prevent layout shifts.
- Keep font families and weights limited.
- Design first for static HTML readability, then layer animation.

## Phase 1 acceptance direction

Phase 1 may begin only after this brief and the content audit are approved. Its foundation should demonstrate:

- The token palette, typography, grid, header/footer, skip link, metadata defaults, and custom 404.
- Intentional layouts at 360, 768, 1280, and 1440 px.
- Keyboard-operable navigation and a reduced-motion baseline.
- Static-export compatibility for GitHub Pages.
- No unverified résumé or project claims and no future-phase exhibits.
