/**
 * Unit tests for src/lib/medium.ts (no browser needed; Playwright is only the runner).
 */
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import {
  isAllowedUrl,
  loadMediumArticles,
  mergeArticles,
  parseArchive,
  parseMediumFeed,
  toPlainText,
} from "../src/lib/medium";

const feedXml = readFileSync("tests/fixtures/medium/feed.xml", "utf8");
const archive = JSON.parse(readFileSync("tests/fixtures/medium/archive.json", "utf8"));
const EXTRA_HOSTS = ["blog.example-publication.com"];

test.describe("url validation", () => {
  test("accepts HTTPS Medium hosts only, plus approved hosts", () => {
    expect(isAllowedUrl("https://medium.com/@a/post-1")).toBe(true);
    expect(isAllowedUrl("https://someone.medium.com/post-1")).toBe(true);
    expect(isAllowedUrl("http://medium.com/@a/post-1")).toBe(false);
    expect(isAllowedUrl("https://medium.com.evil.com/x")).toBe(false);
    expect(isAllowedUrl("https://evilmedium.com/x")).toBe(false);
    expect(isAllowedUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedUrl("https://user:pw@medium.com/x")).toBe(false);
    expect(isAllowedUrl("https://blog.example-publication.com/x")).toBe(false);
    expect(isAllowedUrl("https://blog.example-publication.com/x", EXTRA_HOSTS)).toBe(true);
  });
});

test.describe("feed parsing", () => {
  test("keeps only metadata from valid items", () => {
    const articles = parseMediumFeed(feedXml);
    expect(articles.map((a) => a.title)).toEqual(["Fixture — Newest article", "Fixture — Middle article"]);

    const [newest] = articles;
    // Tracking query removed from the link.
    expect(newest.url).toBe("https://medium.com/@test-author/fixture-newest-article-111");
    expect(newest.publishedAt.toISOString()).toBe("2026-03-02T10:00:00.000Z");
    expect(newest.tags).toEqual(["machine-learning", "rag"]);
    // Short plain-text teaser from the first paragraph only; no HTML, no script, no full copy.
    expect(newest.description).toBe("First paragraph with bold text & an entity.");
  });

  test("never lets HTML or scripts through", () => {
    expect(toPlainText("<p>Hi <script>alert(1)</script><b>there</b></p>")).toBe("Hi there");
    expect(toPlainText("&lt;img src=x onerror=alert(1)&gt;")).toBe("img src=x onerror=alert(1)");
  });

  test("throws on malformed XML so the caller can fall back", () => {
    expect(() => parseMediumFeed("<rss><channel><item></channel>")).toThrow();
    expect(() => parseMediumFeed("<html><body>Not a feed</body></html>")).toThrow();
  });
});

test.describe("archive and merging", () => {
  test("validates archive rows", () => {
    const rows = parseArchive(archive, EXTRA_HOSTS);
    expect(rows.map((a) => a.title)).not.toContain("Fixture — Insecure link");
    expect(rows).toHaveLength(3);
    expect(parseArchive({ not: "an array" })).toEqual([]);
  });

  test("de-duplicates by URL (feed wins) and sorts newest first", () => {
    const merged = mergeArticles(parseMediumFeed(feedXml), parseArchive(archive, EXTRA_HOSTS));
    expect(merged.map((a) => a.title)).toEqual([
      "Fixture — Newest article",
      "Fixture — Middle article",
      "Fixture — Archived article",
      "Fixture — Oldest article",
    ]);
  });
});

test.describe("loading with fallback", () => {
  test("uses feed + archive when the feed works", async () => {
    const fetchImpl = (async () => new Response(feedXml, { status: 200 })) as typeof fetch;
    const result = await loadMediumArticles({
      feedUrl: "https://medium.com/feed/@test-author",
      archive,
      allowedHosts: EXTRA_HOSTS,
      fetchImpl,
    });
    expect(result.source).toBe("feed+archive");
    expect(result.warning).toBeUndefined();
    expect(result.articles).toHaveLength(4);
  });

  for (const [name, fetchImpl] of [
    ["HTTP 429", async () => new Response("rate limited", { status: 429 })],
    ["HTTP 404", async () => new Response("not found", { status: 404 })],
    ["network error", async () => { throw new TypeError("fetch failed"); }],
    ["invalid XML", async () => new Response("<rss><oops", { status: 200 })],
  ] as const) {
    test(`falls back to the archive on ${name}`, async () => {
      const result = await loadMediumArticles({
        feedUrl: "https://medium.com/feed/@test-author",
        archive,
        allowedHosts: EXTRA_HOSTS,
        fetchImpl: fetchImpl as unknown as typeof fetch,
      });
      expect(result.source).toBe("archive");
      expect(result.warning).toMatch(/Medium feed unavailable/);
      expect(result.articles.map((a) => a.title)).toContain("Fixture — Archived article");
    });
  }

  test("falls back on timeout", async () => {
    const hanging = ((_url: string, init?: RequestInit) =>
      new Promise((_, reject) =>
        init?.signal?.addEventListener("abort", () => reject(init.signal!.reason)),
      )) as typeof fetch;
    const result = await loadMediumArticles({
      feedUrl: "https://medium.com/feed/@test-author",
      archive: [],
      fetchImpl: hanging,
      timeoutMs: 50,
    });
    expect(result.source).toBe("none");
    expect(result.articles).toEqual([]);
    expect(result.warning).toMatch(/timed out/);
  });

  test("refuses a non-Medium feed URL without fetching", async () => {
    let called = false;
    const result = await loadMediumArticles({
      feedUrl: "https://evil.example.com/feed",
      archive: [],
      fetchImpl: (async () => {
        called = true;
        return new Response(feedXml);
      }) as typeof fetch,
    });
    expect(called).toBe(false);
    expect(result.source).toBe("none");
  });

  test("no feed and no archive gives an honest empty list", async () => {
    const result = await loadMediumArticles({ archive: [] });
    expect(result).toEqual({ articles: [], source: "none", warning: undefined });
  });
});
