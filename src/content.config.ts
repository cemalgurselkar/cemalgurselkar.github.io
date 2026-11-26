import { readFile } from "node:fs/promises";
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { siteConfig } from "./config/site.config";
import { loadMediumArticles } from "./lib/medium";
import archive from "./data/medium-articles.json";

// Files starting with "_" are ignored (templates, notes).
const PATTERN = "**/[^_]*.{md,mdx}";

// E2E tests build with CONTENT_FIXTURES=1: Medium data then comes from tests/fixtures/medium,
// never from the network, and never reaches a real build.
const useFixtures = Boolean(process.env.CONTENT_FIXTURES);

/**
 * Medium articles: metadata only, loaded at build time.
 * RSS feed (if configured) + the local archive in src/data/medium-articles.json, de-duplicated by URL.
 * A feed failure never fails the build; it falls back to the archive or an empty list.
 */
const articles = defineCollection({
  loader: async () => {
    const result = useFixtures
      ? await loadMediumArticles({
          feedXml: await readFile("tests/fixtures/medium/feed.xml", "utf8"),
          archive: JSON.parse(await readFile("tests/fixtures/medium/archive.json", "utf8")),
          allowedHosts: ["blog.example-publication.com"],
        })
      : await loadMediumArticles({
          feedUrl: siteConfig.mediumFeedUrl,
          archive,
          allowedHosts: siteConfig.mediumAllowedHosts,
        });

    if (result.warning) console.warn(`[medium] ${result.warning}`);
    console.info(`[medium] ${result.articles.length} article(s), source: ${result.source}`);

    return result.articles.map((article) => ({
      id: article.url,
      ...article,
      publishedAt: article.publishedAt.toISOString(),
    }));
  },
  schema: z.object({
    title: z.string().min(1),
    url: z.url({ protocol: /^https$/ }),
    publishedAt: z.coerce.date(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: PATTERN }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    /** GitHub repository as "owner/name". */
    repo: z
      .string()
      .regex(/^[\w.-]+\/[\w.-]+$/, { error: 'Use the "owner/name" form' })
      .optional(),
    technologies: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    order: z.number().int().optional(),
    status: z.enum(["active", "complete", "archived"]).optional(),
    draft: z.boolean().default(false),
    /** Extra links shown on the detail page (README, benchmarks, demo, ...). */
    links: z.array(z.object({ label: z.string().min(1), url: z.url() })).default([]),
  }),
});

export const collections = { articles, projects };
