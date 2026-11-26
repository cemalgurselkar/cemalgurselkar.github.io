/**
 * Page scroll lock for modals (terminal, telescope eyepiece). Counts nested locks, and pads
 * the body by the scrollbar width so the page doesn't shift when the scrollbar disappears.
 */

let depth = 0;
let saved: { overflow: string; paddingRight: string } | undefined;

export function lockScroll(): void {
  if (depth++ > 0) return;
  const root = document.documentElement;
  const scrollbar = window.innerWidth - root.clientWidth;
  saved = {
    overflow: root.style.overflow,
    paddingRight: document.body.style.paddingRight,
  };
  root.style.overflow = "hidden";
  if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
}

export function unlockScroll(): void {
  if (depth === 0) return;
  if (--depth > 0 || !saved) return;
  document.documentElement.style.overflow = saved.overflow;
  document.body.style.paddingRight = saved.paddingRight;
  saved = undefined;
}

/** Motion is allowed unless the OS asks for less or the footer toggle turned it off. */
export function motionAllowed(): boolean {
  return (
    document.documentElement.dataset.motion !== "off" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
