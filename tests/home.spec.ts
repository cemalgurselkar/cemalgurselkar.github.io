import { expect, test } from "@playwright/test";

// Viewports from plan.md, phase B.
const viewports = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 640 },
];

const overflowX = () =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth;

for (const viewport of viewports) {
  test.describe(`home @ ${viewport.width}px`, () => {
    test.use({ viewport });

    test("has no horizontal overflow", async ({ page }) => {
      await page.goto("/");
      expect(await page.evaluate(overflowX)).toBeLessThanOrEqual(0);
    });

    test("hero fills the first screen edge to edge", async ({ page }) => {
      await page.goto("/");
      const box = (await page.locator(".hero").boundingBox())!;
      expect(Math.round(box.x)).toBe(0);
      expect(Math.round(box.width)).toBe(viewport.width);
      expect(box.height).toBeGreaterThanOrEqual(viewport.height - 1);
      await expect(page.locator(".hero-img")).toBeVisible();
    });

    test("has exactly one h1 — the pixel hero title", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(/Hi! I'm Cemal Gürsel Kar/);
      const font = await page
        .locator("h1")
        .evaluate((el) => getComputedStyle(el).fontFamily);
      expect(font).toMatch(/Pixelify Sans/);
    });

    test("content below the hero shares one container edge", async ({
      page,
    }) => {
      await page.goto("/");
      const left = async (selector: string) =>
        Math.round((await page.locator(selector).first().boundingBox())!.x);
      const headerLeft = await left("header");
      expect(await left("#about")).toBe(headerLeft);
      expect(await left("#projects-title")).toBe(headerLeft);
    });

    test("main navigation is reachable", async ({ page }) => {
      await page.goto("/");
      if (viewport.width < 560) {
        await page.locator(".nav-mobile summary").click();
        await expect(
          page.getByRole("navigation", { name: "Main (mobile)" }),
        ).toBeVisible();
      } else {
        await expect(
          page.getByRole("navigation", { name: "Main", exact: true }),
        ).toBeVisible();
      }
      await expect(page.locator('a[aria-current="page"]').first()).toHaveText(
        "Home",
      );
    });

    test("screenshot for manual review", async ({ page }, testInfo) => {
      await page.goto("/");
      // Reveal everything so the full-page screenshot shows final content.
      await page.evaluate(() =>
        document
          .querySelectorAll("[data-reveal]")
          .forEach((el) => el.classList.add("is-visible")),
      );
      await page.screenshot({
        path: testInfo.outputPath(`home-${viewport.width}.png`),
        fullPage: true,
      });
    });
  });
}

test.describe("header", () => {
  test("is transparent over the hero on home and solid elsewhere", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("header.overlay")).toHaveCSS(
      "position",
      "absolute",
    );
    await page.goto("/projects");
    await expect(page.locator("header.overlay")).toHaveCount(0);
  });
});

test.describe("scroll and motion", () => {
  test("hero arrow is an accessible anchor to #about", async ({ page }) => {
    await page.goto("/");
    const cue = page.getByRole("link", { name: "Scroll to About me" });
    await expect(cue).toHaveAttribute("href", "#about");
    await cue.click();
    await expect(page).toHaveURL(/#about$/);
    await expect(page.locator("#about")).toBeInViewport();
  });

  test("sections reveal once when scrolled into view", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/motion-ready/);
    const about = page.locator("#about");
    await about.scrollIntoViewIfNeeded();
    await expect(about).toHaveClass(/is-visible/);
    await expect(about).toHaveCSS("opacity", "1");
  });

  test("focused content is visible immediately", async ({ page }) => {
    await page.goto("/");
    const link = page.locator(".card .title a").first();
    await link.focus();
    await expect(link).toBeVisible();
    const opacity = await link.evaluate(
      (el) => getComputedStyle(el.closest("[data-reveal]")!).opacity,
    );
    expect(opacity).toBe("1");
  });

  test("reduced motion disables reveal and smooth scroll", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/motion-ready/);
    await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
    await expect(page.locator("#about")).toHaveCSS("opacity", "1");
  });

  test("motion toggle turns motion off and remembers it", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Reduce motion" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    await expect(page.locator("html")).not.toHaveClass(/motion-ready/);

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "off");
    await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("all content is visible and the toggle is hidden", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    for (const el of await page.locator("[data-reveal]").all()) {
      await expect(el).toHaveCSS("opacity", "1");
    }
    await expect(
      page.getByRole("button", { name: "Reduce motion" }),
    ).toBeHidden();
  });
});

test("skip link moves focus to main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
});

test("CV link points at the real PDF", async ({ request, page }) => {
  await page.goto("/");
  const cv = page.locator("#about").getByRole("link", { name: /^CV/ });
  if ((await cv.count()) === 0) test.skip(true, "No resumePath configured");
  const href = (await cv.getAttribute("href"))!;
  const response = await request.get(href);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("pdf");
});
