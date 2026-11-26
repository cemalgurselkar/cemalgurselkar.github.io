/**
 * Living observatory: controller for the hero's ambient layers.
 *
 * - Pauses every hero animation (CSS animation-play-state) when the hero is off-screen,
 *   the tab is hidden, or motion is disabled (OS setting or the footer toggle).
 * - Shooting stars at random 15–40 s intervals (Web Animations API, transform/opacity only).
 * - Pointer parallax (≤ 4 px) on decorative layers, fine pointers only, rAF-throttled.
 * All listeners, observers, timers and frames are released on `pagehide`.
 */
import { inRect, REGIONS } from "../lib/observatory-map";

const SHOOTING_MIN_MS = 15_000;
const SHOOTING_MAX_MS = 40_000;
const PARALLAX_PX = 4;

export function initObservatory(): void {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (!hero) return;
  const shootingStar = hero.querySelector<HTMLElement>("[data-shooting-star]");
  const root = document.documentElement;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  let inView = true;
  let active = false;
  let shootingTimer = 0;
  let parallaxFrame = 0;
  let pointer = { x: 0, y: 0 };
  const cleanups: (() => void)[] = [];

  const motionAllowed = () =>
    root.dataset.motion !== "off" && !reducedMotion.matches;

  // ---- shooting stars -------------------------------------------------------

  const scheduleShootingStar = () => {
    window.clearTimeout(shootingTimer);
    const delay =
      SHOOTING_MIN_MS + Math.random() * (SHOOTING_MAX_MS - SHOOTING_MIN_MS);
    shootingTimer = window.setTimeout(fireShootingStar, delay);
  };

  const fireShootingStar = () => {
    if (!active || !shootingStar) return;
    const stage = shootingStar.parentElement!.getBoundingClientRect();

    // Start somewhere in the upper sky, away from the painted shooting star.
    let x = 0;
    let y = 0;
    for (let i = 0; i < 20; i++) {
      x = 560 + Math.random() * 900; // source px
      y = 30 + Math.random() * 200;
      if (
        !inRect(x, y, REGIONS.paintedShootingStar, 80) &&
        !inRect(x, y, REGIONS.galaxy, 10)
      )
        break;
    }
    shootingStar.style.left = `${(x / 1672) * 100}%`;
    shootingStar.style.top = `${(y / 941) * 100}%`;

    // Travel down-left (like the painted one) or down-right, at a shallow angle.
    const leftward = Math.random() < 0.6;
    const angle = leftward
      ? 180 - (24 + Math.random() * 14)
      : 24 + Math.random() * 14;
    const distance = stage.width * (0.1 + Math.random() * 0.06);

    shootingStar.animate(
      [
        { opacity: 0, transform: `rotate(${angle}deg) translateX(0)` },
        { opacity: 1, offset: 0.15 },
        { opacity: 0.9, offset: 0.7 },
        {
          opacity: 0,
          transform: `rotate(${angle}deg) translateX(${distance.toFixed(0)}px)`,
        },
      ],
      {
        duration: 900 + Math.random() * 500,
        easing: "cubic-bezier(0.3, 0.6, 0.6, 1)",
      },
    );
    scheduleShootingStar();
  };

  // ---- parallax -------------------------------------------------------------

  const applyParallax = () => {
    parallaxFrame = 0;
    hero.style.setProperty(
      "--plx-x",
      `${(-pointer.x * PARALLAX_PX).toFixed(2)}px`,
    );
    hero.style.setProperty(
      "--plx-y",
      `${(-pointer.y * PARALLAX_PX * 0.6).toFixed(2)}px`,
    );
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!active || event.pointerType !== "mouse") return;
    const rect = hero.getBoundingClientRect();
    pointer = {
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
    };
    if (!parallaxFrame) parallaxFrame = requestAnimationFrame(applyParallax);
  };

  const resetParallax = () => {
    pointer = { x: 0, y: 0 };
    if (!parallaxFrame) parallaxFrame = requestAnimationFrame(applyParallax);
  };

  // ---- state ----------------------------------------------------------------

  const update = () => {
    const next = inView && !document.hidden && motionAllowed();
    hero.classList.toggle("is-idle", !next);
    if (next === active) return;
    active = next;

    if (active) {
      scheduleShootingStar();
      if (finePointer.matches) {
        hero.addEventListener("pointermove", onPointerMove, { passive: true });
        hero.addEventListener("pointerleave", resetParallax);
      }
    } else {
      window.clearTimeout(shootingTimer);
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", resetParallax);
      cancelAnimationFrame(parallaxFrame);
      parallaxFrame = 0;
      hero.style.removeProperty("--plx-x");
      hero.style.removeProperty("--plx-y");
    }
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      update();
    },
    { threshold: 0 },
  );
  observer.observe(hero);
  cleanups.push(() => observer.disconnect());

  // React to the footer motion toggle (it flips <html data-motion>).
  const motionObserver = new MutationObserver(update);
  motionObserver.observe(root, {
    attributes: true,
    attributeFilter: ["data-motion"],
  });
  cleanups.push(() => motionObserver.disconnect());

  document.addEventListener("visibilitychange", update);
  reducedMotion.addEventListener("change", update);
  finePointer.addEventListener("change", () => {
    active = false; // re-evaluate listeners
    update();
  });
  cleanups.push(() => {
    document.removeEventListener("visibilitychange", update);
    reducedMotion.removeEventListener("change", update);
  });

  // Leaving the page: pause; if the page is really unloading (not kept in the back/forward
  // cache), release everything. A bfcache restore resumes where it left off.
  window.addEventListener("pagehide", (event) => {
    inView = false;
    update();
    if (!event.persisted) for (const fn of cleanups) fn();
  });
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    inView = hero.getBoundingClientRect().bottom > 0;
    update();
  });

  update();
}
