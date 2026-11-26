/**
 * Scroll reveal (once per element) and the motion toggle.
 *
 * The inline script in BaseLayout <head> decides before first paint whether motion is allowed
 * and, if so, adds `.motion-ready` to <html>. Only then does CSS hide `[data-reveal]` elements,
 * so without JS (or if this module never runs) all content stays visible.
 */

declare global {
  interface Window {
    __motionReady?: boolean;
  }
}

const root = document.documentElement;

function revealAll(): void {
  for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) el.classList.add("is-visible");
}

export function initReveal(): void {
  window.__motionReady = true;
  if (!root.classList.contains("motion-ready")) return;

  if (!("IntersectionObserver" in window)) {
    root.classList.remove("motion-ready");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // reveal runs once
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );

  for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) observer.observe(el);

  // Belt and braces: jumping to an anchor or printing must never leave content hidden.
  window.addEventListener("hashchange", revealAll);
  window.addEventListener("beforeprint", revealAll);
}

export function setMotion(enabled: boolean): void {
  if (enabled) {
    delete root.dataset.motion;
  } else {
    root.dataset.motion = "off";
    revealAll();
    root.classList.remove("motion-ready");
  }
  try {
    localStorage.setItem("motion", enabled ? "on" : "off");
  } catch {
    /* storage may be blocked; the setting then lasts for this page only */
  }
}

export function isMotionOn(): boolean {
  return root.dataset.motion !== "off";
}
