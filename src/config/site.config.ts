/**
 * Site-wide profile and settings. Only real values belong here:
 * leave an optional field `undefined` and the UI hides it instead of showing a fake link.
 */
export interface SiteConfig {
  name: string;
  /** Short header mark. */
  wordmark: string;
  role: string;
  tagline: string;
  bio: string;
  /** BCP 47 language tag used for <html lang>. */
  locale: string;
  githubUsername?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  email?: string;
  /** Path under public/, e.g. "/resume.pdf". Only set once the real file exists. */
  resumePath?: string;
  /** Topics shown as "Currently exploring". The first one is shown. */
  currentFocus: string[];
  /** GitHub repos ("owner/name") shown on the home page, in this order. */
  featuredRepos: string[];
  /** Medium RSS feed, e.g. "https://medium.com/feed/@username". Fetched at build time only. */
  mediumFeedUrl?: string;
  /** Public Medium profile, shown as a link on /blog when set. */
  mediumProfileUrl?: string;
  /** Extra HTTPS hosts allowed for article links (custom publication domains). medium.com is always allowed. */
  mediumAllowedHosts?: string[];
  /** Final public URL; also settable with the SITE_URL env var at build time. */
  siteUrl?: string;
}

export const siteConfig: SiteConfig = {
  name: "Cemal Gürsel Kar",
  wordmark: "Cemal Gürsel Kar",
  role: "Junior Ai/Data Engineer",
  tagline: "Exploring computation, intelligence and complex systems.",
  bio: "I build AI and data systems that can be opened up, measured, and questioned — retrieval pipelines with evaluation, streaming infrastructure with visible boundaries, and robot workflows that keep language grounded in state.",
  locale: "en",
  githubUsername: "cemalgurselkar",
  githubUrl: "https://github.com/cemalgurselkar",
  linkedinUrl: "https://www.linkedin.com/in/cemal-g%C3%BCrsel-85498425a/",
  email: "cemalgurselkar@gmail.com",
  // Files in public/ are served from the site root, so public/my_cv.pdf → "/my_cv.pdf".
  resumePath: "/my_cv.pdf",
  currentFocus: ["AI/ML and data systems"],
  featuredRepos: ["cemalgurselkar/astraRag", "cemalgurselkar/fast_orderbook"],
  // Not provided yet — fill in your real Medium addresses; nothing is shown or fetched until then.
  mediumFeedUrl: undefined,
  mediumProfileUrl: undefined,
  mediumAllowedHosts: [],
  siteUrl: undefined,
};

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const;
