// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified, rehypeHeadingIds } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// The public URL is not decided yet. Set these at build time, e.g.
//   SITE_URL=https://<user>.github.io BASE_PATH=/ pnpm build          (user site)
//   SITE_URL=https://<user>.github.io BASE_PATH=/<repo> pnpm build    (project site)
// The sitemap is only produced once SITE_URL is set (no fake domain); it lists local pages only.
const site = process.env.SITE_URL || undefined;
const base = process.env.BASE_PATH || "/";

export default defineConfig({
  site,
  base,
  output: "static",
  trailingSlash: "ignore",
  // Astro 7 defaults to JSX-style whitespace; keep classic HTML whitespace.
  compressHTML: true,
  integrations: [
    mdx(), // inherits the markdown config below
    ...(site ? [sitemap({ filter: (page) => !page.endsWith("/404/") })] : []),
  ],
  markdown: {
    // Astro 7 uses Sätteri by default; remark/rehype plugins need the unified processor.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        // Heading ids must exist before anchors are added.
        rehypeHeadingIds,
        rehypeKatex,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "append",
            properties: { className: ["heading-anchor"] },
            content: [
              {
                type: "element",
                tagName: "span",
                properties: { ariaHidden: "true" },
                children: [{ type: "text", value: "#" }],
              },
              {
                type: "element",
                tagName: "span",
                properties: { className: ["sr-only"] },
                children: [{ type: "text", value: "Link to this section" }],
              },
            ],
          },
        ],
      ],
    }),
    shikiConfig: {
      theme: "github-dark-dimmed",
      wrap: false, // long lines scroll horizontally inside the code block
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
