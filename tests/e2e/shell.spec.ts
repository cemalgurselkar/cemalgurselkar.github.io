import { expect, test } from "@playwright/test";

test("renders the responsive homepage without horizontal overflow", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Cemal Gürsel Kar/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Cemal Gürsel Kar.",
    }),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("filters the verified project index", async ({ page }) => {
  await page.goto("/projects/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Work with the boundaries left in.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Data engineering" }).click();
  await expect(
    page.getByText("Showing 3 of 7 verified repositories"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "MarketStream" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "tiny-gpts" }),
  ).not.toBeVisible();
});

test("serves every concise case study and its source path", async ({
  page,
}) => {
  const cases = [
    ["astrarag", "AstraRAG"],
    ["marketstream", "MarketStream"],
    ["clearpath", "Clearpath with Language Models"],
    ["vectorch", "VecTorch"],
    ["financial-agent", "Financial AI Agent"],
  ] as const;

  for (const [slug, title] of cases) {
    await page.goto(`/projects/${slug}/`);
    await expect(
      page.getByRole("heading", { level: 1, name: title }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Open repository/ }),
    ).toBeVisible();
  }

  await page.goto("/projects/astrarag/");
  await page.getByRole("button", { name: /Dense/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("Hit@10 0.775")).toBeVisible();
});

test("keeps navigation and the skip link keyboard accessible", async ({
  page,
}) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  if ((page.viewportSize()?.width ?? 0) < 768) {
    const menu = page.getByRole("button", { name: "Menu" });
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
  } else {
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeVisible();
  }
});

test("honors the reduced-motion preference", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const behavior = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollBehavior,
  );
  expect(behavior).toBe("auto");
});
