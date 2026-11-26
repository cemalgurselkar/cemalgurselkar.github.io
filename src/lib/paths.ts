const base = import.meta.env.BASE_URL.replace(/\/+$/, "");

/** Prefix an internal path with the configured base (needed for GitHub Pages project sites). */
export function withBase(path: string): string {
  if (/^[a-z]+:/i.test(path)) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}${clean}` || "/";
}

/** Path without the base prefix and trailing slash, for active-link checks. */
export function stripBase(pathname: string): string {
  const withoutBase =
    base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const trimmed = withoutBase.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function isActive(href: string, pathname: string): boolean {
  const current = stripBase(pathname);
  if (href === "/") return current === "/";
  return current === href || current.startsWith(`${href}/`);
}
