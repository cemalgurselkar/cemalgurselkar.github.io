import { expect, test } from "@playwright/test";

// These run against a production build made with CONTENT_FIXTURES=1 (see playwright.config.ts):
// Medium data comes from tests/fixtures/medium (feed.xml + archive.json), not the network.
// Expected merged list: Newest, Middle, Archived, Oldest (invalid/duplicate rows dropped).

const overflowX = () =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth;

test.describe("Medium articles", () => {
  test("/blog lists feed + archive, newest first, without invalid rows", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator(".articles .title")).toHaveText([
      /Fixture — Newest article/,
      /Fixture — Middle article/,
      /Fixture — Archived article/,
      /Fixture — Oldest article/,
    ]);
    for (const bad of ["Blocked host", "Bad date", "Insecure link", "archive copy"]) {
      await expect(page.getByText(bad)).toHaveCount(0);
    }
  });

  test("every article link goes straight to the original HTTPS source", async ({ page }) => {
    await page.goto("/blog");
    const hrefs = await page
      .locator(".articles .title")
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")!));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const url = new URL(href);
      expect(url.protocol).toBe("https:");
      expect(url.hostname).toMatch(/(^|\.)medium\.com$|^blog\.example-publication\.com$/);
      expect(url.search).toBe(""); // tracking query stripped
    }
  });

  test("feed text is shown as plain text only", async ({ page }) => {
    await page.goto("/blog");
    const first = page.locator(".articles > li").first();
    await expect(first.locator(".desc")).toHaveText("First paragraph with bold text & an entity.");
    await expect(first.locator("strong, script, h3")).toHaveCount(0);
    await expect(page.getByText("Second paragraph must not be copied")).toHaveCount(0);
  });

  test("there are no local article pages", async ({ page }) => {
    const response = await page.goto("/blog/fixture-newest-article-111");
    expect(response?.status()).toBe(404);
  });

  test("home shows the three most recent articles and links to /blog", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section", { has: page.locator("#articles-title") });
    await expect(section.locator(".articles .title")).toHaveCount(3);
    await expect(section.locator(".articles .title").first()).toHaveText(/Newest article/);
    await expect(section.getByRole("link", { name: /View all/ })).toHaveAttribute("href", /\/blog\/?$/);
  });
});

test.describe("projects", () => {
  test("list links to every detail page", async ({ page }) => {
    await page.goto("/projects");
    const hrefs = await page
      .locator(".card .title a")
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")!));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const response = await page.goto(href);
      expect(response?.status(), href).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
    }
  });

  test("home project title opens its detail page", async ({ page }) => {
    await page.goto("/");
    await page.locator(".card .title a").first().click();
    await expect(page).toHaveURL(/\/projects\/[^/]+\/?$/);
    await expect(page.getByRole("link", { name: /Repository/ })).toBeVisible();
  });
});

test.describe("other pages", () => {
  for (const path of ["/about", "/projects", "/blog"]) {
    test(`${path} has one h1 and no horizontal overflow at 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(await page.evaluate(overflowX)).toBeLessThanOrEqual(0);
    });
  }

  test("unknown URL shows the 404 page", async ({ page }) => {
    const response = await page.goto("/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("link", { name: "Go home" })).toBeVisible();
  });
});
