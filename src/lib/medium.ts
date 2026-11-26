/**
 * Build-time Medium integration. Pure TypeScript (no Astro imports) so it can be unit-tested.
 *
 * Only metadata is kept: title, link, date, a short plain-text description and categories.
 * External HTML is never rendered: every string is reduced to plain text, and Astro escapes it.
 */
import { XMLParser } from "fast-xml-parser";

export interface MediumArticle {
  title: string;
  url: string;
  publishedAt: Date;
  description?: string;
  tags: string[];
}

export type MediumSource = "feed" | "archive" | "feed+archive" | "none";

export interface LoadResult {
  articles: MediumArticle[];
  source: MediumSource;
  /** Human-readable reason when the feed could not be used. Never contains secrets. */
  warning?: string;
}

const DESCRIPTION_MAX = 180;
const MAX_TAGS = 3;
const MAX_FEED_BYTES = 3_000_000;
const DEFAULT_TIMEOUT_MS = 8_000;

// ---------------------------------------------------------------------------
// URL validation
// ---------------------------------------------------------------------------

/** HTTPS only, and the host must be medium.com, *.medium.com, or a host the user approved. */
export function isAllowedUrl(raw: string, extraHosts: readonly string[] = []): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  if (host === "medium.com" || host.endsWith(".medium.com")) return true;
  return extraHosts.some((h) => host === h.toLowerCase());
}

/** Canonical form used for links and de-duplication: no query (Medium adds ?source=rss…) or hash. */
export function normalizeUrl(raw: string): string {
  const url = new URL(raw);
  url.search = "";
  url.hash = "";
  return url.href.replace(/\/+$/, "");
}

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1]?.toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : "";
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Reduce any HTML fragment to collapsed plain text. Scripts and styles are dropped with their content. */
export function toPlainText(html: string): string {
  const withoutBlocks = html
    .replace(/<(script|style|iframe|noscript)\b[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const withoutTags = withoutBlocks.replace(/<[^>]*>/g, " ");
  return decodeEntities(withoutTags).replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}

export function truncate(text: string, max = DESCRIPTION_MAX): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–—-]+$/, "")}…`;
}

/** First paragraph of an HTML body, as a short plain-text teaser (never the full article). */
function excerptFromContent(html: string): string | undefined {
  const firstParagraph = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1];
  const text = firstParagraph ? toPlainText(firstParagraph) : "";
  return text ? truncate(text) : undefined;
}

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function cleanTags(values: unknown[]): string[] {
  const tags = values.map((v) => toPlainText(asText(v))).filter((t) => t.length > 0 && t.length <= 40);
  return [...new Set(tags)].slice(0, MAX_TAGS);
}

// ---------------------------------------------------------------------------
// Normalisation (shared by feed and archive)
// ---------------------------------------------------------------------------

interface RawArticle {
  title?: unknown;
  url?: unknown;
  publishedAt?: unknown;
  description?: unknown;
  tags?: unknown;
}

function normalizeArticle(raw: RawArticle, allowedHosts: readonly string[]): MediumArticle | null {
  const title = toPlainText(asText(raw.title));
  const url = asText(raw.url).trim();
  const date = new Date(asText(raw.publishedAt));
  if (!title || !isAllowedUrl(url, allowedHosts) || Number.isNaN(date.valueOf())) return null;

  const description = raw.description ? truncate(toPlainText(asText(raw.description))) : undefined;
  return {
    title: truncate(title, 200),
    url: normalizeUrl(url),
    publishedAt: date,
    description: description || undefined,
    tags: Array.isArray(raw.tags) ? cleanTags(raw.tags) : [],
  };
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/** Parse a Medium RSS 2.0 feed. Throws on malformed XML so the caller can fall back. */
export function parseMediumFeed(xml: string, allowedHosts: readonly string[] = []): MediumArticle[] {
  if (xml.length > MAX_FEED_BYTES) throw new Error("Feed is too large");

  const parser = new XMLParser({
    ignoreAttributes: true,
    parseTagValue: false,
    trimValues: true,
    processEntities: true,
    htmlEntities: false,
    isArray: (name) => name === "item" || name === "category",
  });
  // `true` makes the parser validate well-formedness and throw on errors.
  const doc = parser.parse(xml, true) as {
    rss?: { channel?: { item?: Record<string, unknown>[] } };
  };
  const channel = doc.rss?.channel;
  if (!channel) throw new Error("Not an RSS 2.0 feed");

  const items = channel.item ?? [];
  const articles: MediumArticle[] = [];
  for (const item of items) {
    const content = asText(item["content:encoded"]);
    const description = asText(item.description) || (content ? excerptFromContent(content) : undefined);
    const article = normalizeArticle(
      {
        title: item.title,
        url: asText(item.link) || asText(item.guid),
        publishedAt: item.pubDate ?? item["atom:updated"],
        description,
        tags: Array.isArray(item.category) ? item.category : [],
      },
      allowedHosts,
    );
    if (article) articles.push(article);
  }
  return articles;
}

/** Validate the user-maintained archive (src/data/medium-articles.json). Invalid rows are skipped. */
export function parseArchive(data: unknown, allowedHosts: readonly string[] = []): MediumArticle[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((row) => (row && typeof row === "object" ? normalizeArticle(row as RawArticle, allowedHosts) : null))
    .filter((a): a is MediumArticle => a !== null);
}

/** De-duplicate by URL (first list wins, so feed data beats archive data) and sort newest first. */
export function mergeArticles(...lists: MediumArticle[][]): MediumArticle[] {
  const byUrl = new Map<string, MediumArticle>();
  for (const list of lists) {
    for (const article of list) {
      if (!byUrl.has(article.url)) byUrl.set(article.url, article);
    }
  }
  return [...byUrl.values()].sort((a, b) => b.publishedAt.valueOf() - a.publishedAt.valueOf());
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

export async function fetchFeed(
  feedUrl: string,
  { fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS }: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<string> {
  const response = await fetchImpl(feedUrl, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { Accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8" },
    redirect: "follow",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

export interface LoadOptions {
  /** Medium RSS URL, e.g. https://medium.com/feed/@username. Undefined → archive only. */
  feedUrl?: string;
  /** Raw XML to use instead of fetching (tests). */
  feedXml?: string;
  /** Contents of medium-articles.json. */
  archive?: unknown;
  /** Extra approved publication hosts (custom domains). */
  allowedHosts?: readonly string[];
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

/**
 * Never throws: any feed problem (timeout, HTTP error, bad XML, wrong host) falls back to the
 * local archive, and with no archive the result is an honest empty list.
 */
export async function loadMediumArticles(options: LoadOptions): Promise<LoadResult> {
  const allowedHosts = options.allowedHosts ?? [];
  const archived = parseArchive(options.archive, allowedHosts);

  let fromFeed: MediumArticle[] = [];
  let warning: string | undefined;

  if (options.feedXml !== undefined || options.feedUrl) {
    try {
      if (options.feedUrl && options.feedXml === undefined && !isAllowedUrl(options.feedUrl, allowedHosts)) {
        throw new Error("Feed URL must be HTTPS on medium.com or an approved host");
      }
      const xml =
        options.feedXml ??
        (await fetchFeed(options.feedUrl!, { fetchImpl: options.fetchImpl, timeoutMs: options.timeoutMs }));
      fromFeed = parseMediumFeed(xml, allowedHosts);
    } catch (error) {
      const reason =
        error instanceof Error ? (error.name === "TimeoutError" ? "timed out" : error.message) : "unknown error";
      warning = `Medium feed unavailable (${reason}); using the local archive.`;
    }
  }

  const articles = mergeArticles(fromFeed, archived);
  const source: MediumSource =
    fromFeed.length && archived.length
      ? "feed+archive"
      : fromFeed.length
        ? "feed"
        : archived.length
          ? "archive"
          : "none";

  return { articles, source, warning };
}
