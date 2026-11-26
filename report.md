# E2E Test Failure Report

## Objective

Fix the application regressions and outdated test expectations identified by the local Playwright run. Preserve the current intended portfolio design, animations, accessibility, and functionality. This task is application/test maintenance, not CI/CD configuration.

## Test environment and results

- Node.js: v24.22.3; pnpm: 10.34.9.
- Command: `pnpm test:e2e`.
- Chromium, 4 workers, 109 tests: **91 passed, 18 failed**, exit code 1, approximately 1.2 minutes.
- Playwright builds with `CONTENT_FIXTURES=1 pnpm build` and starts preview on port 4322.
- Previous lint and Astro type checks passed; Astro reported one deprecated parser signature hint, unrelated to these failures.
- Browser installation and test execution succeeded. The DBus/sandbox warnings in the log do not establish a browser infrastructure failure.

## Failure inventory

### 1. Hero stage geometry — 5 failures (high priority)

File: `tests/observatory.spec.ts:15`, failing assertion at line 27.

```ts
expect(stage.y + stage.height).toBeGreaterThanOrEqual(
  hero.y + hero.height - 0.5,
);
```

| Viewport  | Expected minimum bottom edge | Actual bottom edge |
| --------- | ---------------------------: | -----------------: |
| 1440×900  |                        899.5 |             486.25 |
| 2560×1080 |                       1079.5 |         864.453125 |
| 768×1024  |                       1023.5 |         216.109375 |
| 390×844   |                        843.5 |             109.75 |
| 320×640   |                        639.5 |          90.046875 |

Investigate `.hero`, `.hero-stage`, `.stage-art`, `.stage-ui`, image aspect ratio, cover/crop calculations, positioning and transforms. Verify whether the test measures the correct layer under the current intended design. The measured bottom edges are consistent with a width-dependent stage geometry, but the actual cause is unverified. Preserve aspect ratio and full-screen hero coverage; do not stretch the artwork or revert intentional design changes merely to satisfy an obsolete assertion.

### 2. Telescope and sky interactions — 10 failures (high priority)

File: `tests/observatory.spec.ts`.

| Test declaration line | Failure                                                                                           |
| --------------------: | ------------------------------------------------------------------------------------------------- |
|                   117 | Empty sky hover never adds `is-aiming` to `.hero` (assertion line 124).                           |
|                   144 | Clicking painted galaxy does not produce dialog heading `Andromeda Galaxy` (150).                 |
|                   153 | `[data-eyepiece-canvas]` remains hidden (158).                                                    |
|                   176 | Escape-close variant: dialog never opens (181).                                                   |
|                   176 | Close-button variant: dialog never opens (181).                                                   |
|                   200 | Point elsewhere: initial dialog heading not found (205).                                          |
|                   211 | Clicking `#hero-title` times out; terminal `.scene-hotspot` intercepts pointer events (215).      |
|                   237 | Viewfinder transform does not change from `translate(1030.5px, 265.7px)` (247).                   |
|                   250 | Reduced-motion sky click does not open dialog (259).                                              |
|                   275 | Mobile telescope button expected hidden but is visible (284); subsequent sky tap was not reached. |

Investigate `onArt()` test helper, artwork-to-viewport coordinate mapping, crop offsets, sky hit regions, hotspot geometry, stacking contexts, pointer events and initialization timing. Compare test coordinates with actual rendered artwork. A shared geometry regression may explain multiple failures, but this is a hypothesis, not a confirmed root cause.

Keyboard telescope opening/focus restoration, sky data tests, ambient animation and parallax tests passed. Use these as regression safeguards. Do not rewrite the telescope subsystem unnecessarily.

### 3. Mobile terminal hotspot — 1 failure (high priority)

File: `tests/terminal.spec.ts:256`, failing action at line 262.

`hotspot.tap()` times out after 30 seconds. The hotspot is visible, enabled and stable, but the header `.wordmark` intercepts pointer events. The preceding viewport assertion passes.

Investigate mobile artwork cropping, hotspot position/size, header overlap, stacking and hit testing. The monitor must be genuinely tappable and the terminal must fit the viewport. Preserve header navigation and keyboard accessibility. Do not use forced clicks or globally disable header pointer events to hide the issue.

### 4. Home project navigation — 1 failure

File: `tests/content.spec.ts:97`, failing assertion at line 100.

```ts
await page.goto("/");
await page.locator(".card .title a").first().click();
await expect(page).toHaveURL(/\/projects\/[^/]+\/?$/);
```

Expected: project detail URL. Actual: `http://localhost:4322/` after 5 seconds.

Inspect the selected anchor, its href, whether the selector still targets the intended project card, scroll/reveal behavior, overlays and event handlers. The project listing links test passed. Fix actual navigation if broken; update the selector only if the current markup intentionally changed.

### 5. Terminal welcome text — 1 failure (likely stale test)

File: `tests/terminal.spec.ts:166`, assertion line 171.

- Expected: `System: Cemal Gürsel Kar v1.0`
- Actual: `System: Cemal Gürsel Portfolio v1.0`

If the current portfolio wording is intentional, update the assertion to match it. Otherwise restore the intended wording. Keep the welcome, status, input focus and scroll-lock assertions intact; assertions after the failing text check were not reached in this run.

## Implementation approach

1. Inspect the current implementation, tests, git diff and existing failure traces before editing.
2. Identify shared geometry/hit-testing issues first; then address navigation and terminal wording.
3. Distinguish application bugs from stale tests caused by intentional design changes. Document the reason for every test expectation change.
4. Make minimal, targeted edits. Preserve existing passing behavior and accessibility.
5. Do not skip/delete tests, weaken assertions without justification, add arbitrary sleeps, increase timeouts to conceal failures, use forced interactions to bypass hit testing, or suppress errors.

## Existing diagnostic artifacts

Playwright generated `test-results/**/error-context.md` and `trace.zip` for failed tests. Inspect these if still present. Example trace viewer command for the developer:

```bash
pnpm exec playwright show-trace 'test-results/observatory-living-observa-b8646--hero-with-no-gaps-1440×900-chromium/trace.zip'
```

## Scope and execution constraints

- Modify relevant application and test source files only. Do not modify CI/CD workflows, deployment settings, dependencies or lockfiles unless separately authorized.
- Do not install packages, run builds/tests, start servers, commit, push or deploy. The developer will perform verification manually as part of learning CI/CD.
- Do not overwrite unrelated user changes.
- Return a concise summary of confirmed root causes, changed files, test changes and remaining uncertainties. Do not claim tests pass without execution.

## Manual verification / acceptance criteria

The developer will run:

```bash
pnpm format:check
pnpm lint
pnpm check
pnpm test:e2e --last-failed
pnpm test:e2e
pnpm build
```

Acceptance: all 109 existing test cases pass (or any intentionally revised expectations are explicitly justified), with no regressions or suppressed failures. The final non-fixture production build must succeed. Note that E2E tests overwrite `dist/` with fixture content; rebuild normally before deployment.

## Evidence and limitations

Source: supplied local Playwright terminal log, 769 lines. Navigation failure: lines 122–153; geometry: 155–283; telescope: 285–640; terminal text: 642–686; mobile terminal: 688–745; summary: 747–767. This report is based on the log, not direct inspection of the repository or trace files. Root causes beyond explicit assertion mismatches and pointer interception remain to be verified in source.
