import { expect, test, type Page } from "@playwright/test";
import { isSky } from "../src/lib/observatory-map";

const overflowX = () =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth;

test.describe("living observatory", () => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 2560, height: 1080 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 320, height: 640 },
  ]) {
    test(`stage covers the hero with no gaps @ ${viewport.width}×${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      const hero = (await page.locator(".hero").boundingBox())!;
      const stage = (await page.locator(".stage-art").boundingBox())!;
      expect(stage.x).toBeLessThanOrEqual(hero.x + 0.5);
      expect(stage.y).toBeLessThanOrEqual(hero.y + 0.5);
      expect(stage.x + stage.width).toBeGreaterThanOrEqual(
        hero.x + hero.width - 0.5,
      );
      expect(stage.y + stage.height).toBeGreaterThanOrEqual(
        hero.y + hero.height - 0.5,
      );
      // Image ratio preserved (no stretching).
      expect(stage.width / stage.height).toBeCloseTo(1672 / 941, 2);
      expect(await page.evaluate(overflowX)).toBeLessThanOrEqual(0);
    });
  }

  test("stars sit inside the sky", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const stage = (await page.locator(".stage-art").boundingBox())!;
    const stars = await page.locator(".star").all();
    expect(stars.length).toBeGreaterThan(10);
    expect(stars.length).toBeLessThanOrEqual(40);
    for (const star of stars) {
      const b = (await star.boundingBox())!;
      const x = ((b.x - stage.x) / stage.width) * 1672;
      const y = ((b.y - stage.y) / stage.height) * 941;
      expect(isSky(x, y, 0), `star at ${x.toFixed(0)},${y.toFixed(0)}`).toBe(
        true,
      );
    }
  });

  test("ambient animations pause when the hero leaves the viewport", async ({
    page,
  }) => {
    await page.goto("/");
    const hero = page.locator(".hero");
    await expect(hero).not.toHaveClass(/is-idle/);
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(hero).toHaveClass(/is-idle/);
    await expect(page.locator(".star").first()).toHaveCSS(
      "animation-play-state",
      "paused",
    );
  });

  test("motion off: everything idles", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Reduce motion" }).click();
    await expect(page.locator(".hero")).toHaveClass(/is-idle/);
  });

  test("reduced motion: idle from the start", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".hero")).toHaveClass(/is-idle/);
  });

  test("pointer parallax moves decorative layers only a few px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.mouse.move(10, 300);
    await page.mouse.move(1430, 880, { steps: 5 });
    await expect
      .poll(async () =>
        page
          .locator(".hero")
          .evaluate((el) => el.style.getPropertyValue("--plx-x")),
      )
      .not.toBe("");
    const x = parseFloat(
      await page
        .locator(".hero")
        .evaluate((el) => el.style.getPropertyValue("--plx-x")),
    );
    expect(Math.abs(x)).toBeLessThanOrEqual(6);
  });
});

/** Viewport position of a source-pixel point of the artwork. */
const onArt = async (page: Page, x: number, y: number) => {
  const stage = (await page.locator(".stage-art").boundingBox())!;
  return {
    x: stage.x + (x / 1672) * stage.width,
    y: stage.y + (y / 941) * stage.height,
  };
};

const EMPTY_SKY = { x: 1250, y: 430 }; // below the galaxy, left of the telescope
const GALAXY = { x: 1275, y: 185 };

test.describe("telescope eyepiece", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("clicking empty sky zooms in and shows a random object with facts", async ({
    page,
  }) => {
    await page.goto("/");
    expect(isSky(EMPTY_SKY.x, EMPTY_SKY.y, 6)).toBe(true);
    const p = await onArt(page, EMPTY_SKY.x, EMPTY_SKY.y);
    await page.mouse.move(p.x, p.y);
    await expect(page.locator(".hero")).toHaveClass(/is-aiming/);
    await page.mouse.click(p.x, p.y);

    await expect(page.locator(".hero")).toHaveClass(/is-observing/);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { level: 2 })).not.toHaveText("");
    await expect(dialog.getByRole("heading", { level: 2 })).not.toHaveText(
      "Andromeda Galaxy",
    );
    await expect(dialog.locator("dd").first()).toBeVisible();
    await expect(
      dialog.getByRole("link", { name: /Wikipedia/ }),
    ).toHaveAttribute("href", /^https:\/\/en\.wikipedia\.org\//);
    await expect(
      dialog.getByRole("button", { name: "Close telescope view" }),
    ).toBeFocused();
    await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  });

  test("the painted galaxy is always Andromeda", async ({ page }) => {
    await page.goto("/");
    const p = await onArt(page, GALAXY.x, GALAXY.y);
    await page.mouse.click(p.x, p.y);
    await expect(
      page.getByRole("dialog").getByRole("heading", { level: 2 }),
    ).toHaveText("Andromeda Galaxy");
  });

  test("the lens is painted (canvas has pixels)", async ({ page }) => {
    await page.goto("/");
    const p = await onArt(page, EMPTY_SKY.x, EMPTY_SKY.y);
    await page.mouse.click(p.x, p.y);
    const canvas = page.locator("[data-eyepiece-canvas]");
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute(
      "aria-label",
      /seen through the telescope/,
    );
    const lit = await canvas.evaluate((el: HTMLCanvasElement) => {
      const d = el
        .getContext("2d")!
        .getImageData(0, 0, el.width, el.height).data;
      let bright = 0;
      for (let i = 0; i < d.length; i += 4)
        if (d[i] + d[i + 1] + d[i + 2] > 300) bright++;
      return bright;
    });
    expect(lit).toBeGreaterThan(10);
  });

  for (const how of ["Escape", "close button"] as const) {
    test(`closes with ${how} and zooms back out`, async ({ page }) => {
      await page.goto("/");
      const p = await onArt(page, EMPTY_SKY.x, EMPTY_SKY.y);
      await page.mouse.click(p.x, p.y);
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      if (how === "Escape") await page.keyboard.press("Escape");
      else
        await dialog
          .getByRole("button", { name: "Close telescope view" })
          .click();
      await expect(dialog).toBeHidden();
      await expect(page.locator(".hero")).not.toHaveClass(/is-observing/);
      await expect
        .poll(() =>
          page
            .locator(".stage-art")
            .evaluate((el) => el.getAnimations().length),
        )
        .toBe(0);
      await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    });
  }

  test("'Point elsewhere' shows a different object", async ({ page }) => {
    await page.goto("/");
    const p = await onArt(page, EMPTY_SKY.x, EMPTY_SKY.y);
    await page.mouse.click(p.x, p.y);
    const heading = page.getByRole("dialog").getByRole("heading", { level: 2 });
    await expect(heading).not.toHaveText("");
    const first = await heading.textContent();
    await page.getByRole("button", { name: "Point elsewhere" }).click();
    await expect(heading).not.toHaveText(first!);
  });

  test("clicks on the title or the monitor don't open the eyepiece", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator("#hero-title").click();
    await page.mouse.click(5, 890); // desk, not sky
    await expect(page.locator("[data-eyepiece]")).toBeHidden();
  });

  test("keyboard: the telescope button opens it, focus returns on close", async ({
    page,
  }) => {
    await page.goto("/");
    const telescope = page.getByRole("button", {
      name: "Look through the telescope",
    });
    await expect(telescope).toBeVisible();
    await telescope.focus();
    await expect(telescope.locator(".tooltip")).toHaveText("> Observe the sky");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(telescope).toBeFocused();
  });

  test("viewfinder follows the mouse over the sky", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator(".hero");
    const vf = page.locator("[data-viewfinder]");
    await page.mouse.move(900, 250);
    await expect(hero).toHaveClass(/is-watching/);
    const first = await vf.evaluate((el) => el.style.transform);
    await page.mouse.move(700, 350, { steps: 4 });
    await expect
      .poll(() => vf.evaluate((el) => el.style.transform))
      .not.toBe(first);
  });

  test("reduced motion: no viewfinder and no zoom, the eyepiece still opens", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.mouse.move(900, 250);
    await expect(page.locator(".hero")).not.toHaveClass(/is-watching/);
    const p = await onArt(page, EMPTY_SKY.x, EMPTY_SKY.y);
    await page.mouse.click(p.x, p.y);
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(
      await page
        .locator(".stage-art")
        .evaluate((el) => el.getAnimations().length),
    ).toBe(0);
  });
});

test.describe("telescope on a phone", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test("the telescope button is hidden (cropped), but tapping the sky still works", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Open terminal" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Look through the telescope" }),
    ).toBeHidden();
    const p = await onArt(page, 800, 470); // sky below the title
    await page.touchscreen.tap(p.x, p.y);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const lens = (await page.locator("[data-eyepiece-lens]").boundingBox())!;
    expect(lens.x).toBeGreaterThanOrEqual(0);
    expect(lens.x + lens.width).toBeLessThanOrEqual(390);
  });
});
