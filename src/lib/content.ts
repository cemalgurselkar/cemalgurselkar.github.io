import { getCollection, type CollectionEntry } from "astro:content";

/** Drafts are visible in `astro dev`, never in production builds (no list entry, no route). */
const isPublic = ({ data }: { data: { draft: boolean } }) =>
  import.meta.env.DEV || !data.draft;

/** Medium articles, newest first. Links always point at the original article. */
export async function getArticles(): Promise<CollectionEntry<"articles">[]> {
  return (await getCollection("articles")).sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
  );
}

export async function getProjects(): Promise<CollectionEntry<"projects">[]> {
  return (await getCollection("projects", isPublic)).sort(
    (a, b) =>
      (a.data.order ?? Infinity) - (b.data.order ?? Infinity) ||
      a.data.title.localeCompare(b.data.title),
  );
}

export const dateFormat = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  timeZone: "UTC",
});
