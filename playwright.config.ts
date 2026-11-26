import { defineConfig, devices } from "@playwright/test";

// Own port so a running `pnpm dev` (real content) is never reused for fixture-based tests.
const PORT = 4322;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Tests run against the production build, not the dev server.
  webServer: {
    // CONTENT_FIXTURES swaps the blog collection for tests/fixtures/blog (never used for real builds).
    command: `CONTENT_FIXTURES=1 pnpm build && pnpm preview --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
