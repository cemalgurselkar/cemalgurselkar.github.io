import { expect, test } from "@playwright/test";
import {
  COMMAND_NAMES,
  History,
  isSafeHref,
  runCommand,
  type Line,
  type TerminalData,
} from "../src/scripts/terminal/commands";

// ---------------------------------------------------------------------------
// Unit tests: command registry (no browser)
// ---------------------------------------------------------------------------

const data: TerminalData = {
  name: "Test Person",
  role: "Engineer",
  tagline: "Tagline.",
  bio: "Bio.",
  interests: ["Graphs", "Compilers"],
  focus: ["Retrieval"],
  githubUrl: "https://github.com/test",
  linkedinUrl: undefined,
  resumeUrl: "/cv.pdf",
  projects: [
    { title: "Alpha", description: "First.", href: "/projects/alpha" },
  ],
  articles: [],
};

const text = (lines: Line[]) =>
  lines
    .map((l) =>
      l.segments.map((s) => (typeof s === "string" ? s : s.text)).join(""),
    )
    .join("\n");

test.describe("commands", () => {
  test("help lists every command", () => {
    const out = text(runCommand("help", { data }).lines);
    for (const name of COMMAND_NAMES) expect(out).toContain(name);
    for (const name of [
      "help",
      "whoami",
      "projects",
      "interests",
      "articles",
      "github",
      "linkedin",
      "resume",
      "date",
      "clear",
      "universe",
      "exit",
    ]) {
      expect(COMMAND_NAMES).toContain(name);
    }
  });

  test("commands are case-insensitive and trimmed", () => {
    expect(text(runCommand("  WhoAmI  ", { data }).lines)).toContain(
      "Test Person",
    );
  });

  test("unknown commands get a helpful message, never echo HTML as markup", () => {
    const result = runCommand("<img src=x onerror=alert(1)>", { data });
    expect(result.lines[0].tone).toBe("error");
    expect(text(result.lines)).toMatch(/command not found/);
    expect(text(result.lines)).toMatch(/help/);
  });

  test("missing profile links are reported, not invented", () => {
    expect(text(runCommand("linkedin", { data }).lines)).toMatch(
      /not configured/,
    );
    const gh = runCommand("github", { data }).lines[0].segments[1];
    expect(gh).toEqual({
      text: "https://github.com/test",
      href: "https://github.com/test",
      external: true,
    });
  });

  test("projects link to their detail pages; empty articles say so", () => {
    const seg = runCommand("projects", { data }).lines[1].segments[1];
    expect(seg).toMatchObject({ text: "Alpha", href: "/projects/alpha" });
    expect(text(runCommand("articles", { data }).lines)).toMatch(
      /No articles published yet/,
    );
  });

  test("actions: clear, universe, exit", () => {
    expect(runCommand("clear", { data }).action).toBe("clear");
    expect(runCommand("universe", { data }).action).toBe("universe");
    expect(runCommand("exit", { data }).action).toBe("exit");
  });

  test("date uses the visitor's locale and time", () => {
    const out = text(
      runCommand("date", {
        data,
        now: new Date("2026-04-13T15:52:00Z"),
        locale: "en-GB",
        timeZone: "UTC",
      }).lines,
    );
    expect(out).toMatch(/13 April 2026/);
  });

  test("only safe hrefs are allowed", () => {
    expect(isSafeHref("/projects/a")).toBe(true);
    expect(isSafeHref("https://medium.com/x")).toBe(true);
    expect(isSafeHref("mailto:a@b.c")).toBe(true);
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("//evil.com")).toBe(false);
    expect(isSafeHref("data:text/html,hi")).toBe(false);
  });

  test("history navigates with up/down and keeps the draft", () => {
    const h = new History();
    h.push("help");
    h.push("whoami");
    expect(h.previous("dra")).toBe("whoami");
    expect(h.previous("")).toBe("help");
    expect(h.previous("")).toBe("help");
    expect(h.next()).toBe("whoami");
    expect(h.next()).toBe("dra");
  });
});

// ---------------------------------------------------------------------------
// E2E: hotspot + modal (built site)
// ---------------------------------------------------------------------------

test.describe("terminal (desktop)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  const openTerminal = async (page: import("@playwright/test").Page) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open terminal" }).click();
    const dialog = page.getByRole("dialog", { name: /visitor@observatory/ });
    await expect(dialog).toBeVisible();
    return dialog;
  };

  test("hotspot sits on the monitor and shows the tooltip on hover", async ({
    page,
  }) => {
    await page.goto("/");
    const hotspot = page.getByRole("button", { name: "Open terminal" });
    await expect(hotspot).toBeVisible();
    // Monitor bezel in source px: x 547–888, y 561–737 of a 1672×941 image (see observatory-map.ts).
    const stage = (await page.locator(".stage-ui").boundingBox())!;
    const box = (await hotspot.boundingBox())!;
    expect(
      Math.abs(box.x - (stage.x + (547 / 1672) * stage.width)),
    ).toBeLessThan(2);
    expect(
      Math.abs(box.y - (stage.y + (561 / 941) * stage.height)),
    ).toBeLessThan(2);
    await hotspot.hover();
    await expect(hotspot.locator(".tooltip")).toHaveCSS("opacity", "1");
  });

  test("opens with the welcome text, focuses input and locks scroll", async ({
    page,
  }) => {
    const dialog = await openTerminal(page);
    await expect(dialog).toContainText("Welcome to my digital observatory.");
    await expect(dialog).toContainText("System: Cemal Gürsel Portfolio v1.0");
    await expect(dialog).toContainText("Status: Online");
    await expect(dialog.getByRole("textbox")).toBeFocused();
    await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  });

  test("runs commands, keeps history, clears", async ({ page }) => {
    const dialog = await openTerminal(page);
    const input = dialog.getByRole("textbox");
    await input.fill("HELP");
    await input.press("Enter");
    await expect(dialog).toContainText("Available commands:");
    await input.fill("projects");
    await input.press("Enter");
    await expect(
      dialog.locator(".output a[href*='/projects/']").first(),
    ).toBeVisible();
    await input.fill("nope");
    await input.press("Enter");
    await expect(dialog).toContainText("command not found: nope");

    await input.press("ArrowUp");
    await expect(input).toHaveValue("nope");
    await input.press("ArrowUp");
    await expect(input).toHaveValue("projects");

    await input.fill("clear");
    await input.press("Enter");
    await expect(dialog.locator(".output .term-row")).toHaveCount(0);
  });

  test("user input is shown as text, never as HTML", async ({ page }) => {
    const dialog = await openTerminal(page);
    const input = dialog.getByRole("textbox");
    await input.fill("<b id=injected>x</b>");
    await input.press("Enter");
    await expect(page.locator("#injected")).toHaveCount(0);
    await expect(dialog).toContainText("<b id=injected>x</b>");
  });

  test("universe draws a canvas", async ({ page }) => {
    const dialog = await openTerminal(page);
    const input = dialog.getByRole("textbox");
    await input.fill("universe");
    await input.press("Enter");
    await expect(dialog.locator("canvas.term-universe")).toBeVisible();
  });

  for (const how of ["Escape", "close button", "exit"] as const) {
    test(`closes with ${how} and returns focus to the monitor`, async ({
      page,
    }) => {
      const dialog = await openTerminal(page);
      if (how === "Escape") await page.keyboard.press("Escape");
      if (how === "close button")
        await dialog.getByRole("button", { name: "Close terminal" }).click();
      if (how === "exit") {
        await dialog.getByRole("textbox").fill("exit");
        await dialog.getByRole("textbox").press("Enter");
      }
      await expect(dialog).toBeHidden();
      await expect(
        page.getByRole("button", { name: "Open terminal" }),
      ).toBeFocused();
      await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
    });
  }

  test("keyboard: Tab to the monitor, Enter opens", async ({ page }) => {
    await page.goto("/");
    const hotspot = page.getByRole("button", { name: "Open terminal" });
    await hotspot.focus();
    await expect(hotspot.locator(".tooltip")).toHaveCSS("opacity", "1");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});

test.describe("terminal (mobile)", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });

  test("monitor is on screen, tappable, and the terminal fits", async ({
    page,
  }) => {
    await page.goto("/");
    const hotspot = page.getByRole("button", { name: "Open terminal" });
    await expect(hotspot).toBeInViewport({ ratio: 0.9 });
    await hotspot.tap();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const box = (await dialog.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("no dead hotspot button is shown", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Open terminal" }),
    ).toBeHidden();
  });
});
