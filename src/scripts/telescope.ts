/**
 * Telescope interaction.
 *
 * - Click / tap anywhere in the sky → zoom into that point and look through the eyepiece
 *   (./eyepiece/eyepiece.ts). The painted galaxy shows Andromeda; elsewhere a random planet,
 *   exoplanet, star or constellation.
 * - The telescope button (mouse, tap, Enter, Space) → the eyepiece picks an object itself.
 * - Mouse movement over the hero → a faint viewfinder glides after the pointer around the sky,
 *   joined to the painted lens by a dashed sight line, as if the telescope were looking around.
 *   (The painted tube itself can't turn: there's no separate sprite for it.)
 *
 * The viewfinder only runs for fine pointers with motion allowed and the hero on screen
 * (`.is-idle` from observatory.ts), uses transform only, and its rAF loop stops when settled.
 */
import { ART, isSky, REGIONS, TELESCOPE_REST } from "../lib/observatory-map";
import { createEyepiece, type Point } from "./eyepiece/eyepiece";

const FOLLOW = 0.075; // easing per frame: low = heavy, slow telescope
const VIEWFINDER_W = 0.052; // of stage width (matches CSS)
/** Clicks closer than this to the sky's edge (source px) don't count as sky. */
const SKY_MARGIN = 6;

export function initTelescope(): void {
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  const hotspot = hero?.querySelector<HTMLButtonElement>("[data-telescope]");
  const stage = hero?.querySelector<HTMLElement>(".stage-art");
  if (!hero || !hotspot || !stage) return;

  const viewfinder = hero.querySelector<HTMLElement>("[data-viewfinder]");
  const sightLine = hero.querySelector<SVGLineElement>("[data-sight-line]");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  /** Locked while the eyepiece is open: the viewfinder stays on the observed point. */
  let locked = false;

  const eyepiece = createEyepiece(hero, stage, {
    onAim: (point) => {
      locked = true;
      aimAt(point);
    },
    onClose: () => {
      locked = false;
      aimAt(pointerTarget ?? TELESCOPE_REST);
      if (!pointerInside) hero.classList.remove("is-watching");
    },
  });
  if (!eyepiece) return; // no <dialog> support: keep the button hidden

  /** Source-pixel position of a viewport point on the artwork. */
  const toSource = (clientX: number, clientY: number): Point => {
    const r = stage.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * ART.width,
      y: ((clientY - r.top) / r.height) * ART.height,
    };
  };

  // ---- sky clicks + button ---------------------------------------------------------------

  hero.addEventListener("click", (event) => {
    if (eyepiece.busy || event.defaultPrevented) return;
    // Text, links and buttons keep their own behaviour.
    const target = event.target as Element;
    if (target.closest("a, button, h1, p, input, label")) return;
    if (window.getSelection()?.toString()) return;
    const point = toSource(event.clientX, event.clientY);
    if (!isSky(point.x, point.y, SKY_MARGIN)) return;
    eyepiece.open(point);
  });

  hotspot.addEventListener("click", () => {
    if (!eyepiece.busy) eyepiece.open(undefined, hotspot);
  });

  // ---- viewfinder ---------------------------------------------------------------

  let stageW = 0;
  let stageH = 0;
  /**
   * On narrow/portrait screens the crop can push the telescope out of view; a focusable but
   * invisible button would be confusing, so it's only offered when ≥ half of it is on screen.
   * (Tapping the sky still works there.)
   */
  const updateAvailability = (stageRect: DOMRect) => {
    const heroRect = hero.getBoundingClientRect();
    const hit = REGIONS.telescopeHit;
    const left = stageRect.left + (hit.x / ART.width) * stageRect.width;
    const right =
      stageRect.left + ((hit.x + hit.w) / ART.width) * stageRect.width;
    const visible = Math.max(
      0,
      Math.min(right, heroRect.right) - Math.max(left, heroRect.left),
    );
    hotspot.hidden = visible / Math.max(1, right - left) < 0.5;
  };
  const measure = () => {
    if (eyepiece.busy) return; // the stage is zoomed: its box isn't the resting one
    const r = stage.getBoundingClientRect();
    stageW = r.width;
    stageH = r.height;
    updateAvailability(r);
  };
  measure();
  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(stage);
  // Portrait: the stage size depends only on height, so width changes need their own check.
  window.addEventListener("resize", measure, { passive: true });

  const position: Point = { ...TELESCOPE_REST };
  let target: Point = { ...TELESCOPE_REST };
  let pointerTarget: Point | undefined;
  let pointerInside = false;
  let frame = 0;

  const viewfinderAllowed = () =>
    Boolean(viewfinder && sightLine) &&
    finePointer.matches &&
    !hero.classList.contains("is-idle");

  const render = () => {
    if (!viewfinder || !sightLine) return;
    const size = stageW * VIEWFINDER_W;
    const x = (position.x / ART.width) * stageW - size / 2;
    const y = (position.y / ART.height) * stageH - size / 2;
    viewfinder.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    sightLine.setAttribute("x2", position.x.toFixed(1));
    sightLine.setAttribute("y2", position.y.toFixed(1));
  };

  const tick = () => {
    frame = 0;
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    if (Math.abs(dx) < 0.4 && Math.abs(dy) < 0.4) {
      position.x = target.x;
      position.y = target.y;
      render();
      return; // settled: stop the loop
    }
    position.x += dx * FOLLOW;
    position.y += dy * FOLLOW;
    render();
    frame = requestAnimationFrame(tick);
  };

  function aimAt(point: Point) {
    target = { ...point };
    if (locked) {
      // Snap: the zoom is about to start from exactly this point.
      position.x = point.x;
      position.y = point.y;
      render();
      return;
    }
    if (!frame) frame = requestAnimationFrame(tick);
  }

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") {
      hero.classList.remove("is-watching", "is-aiming");
      return;
    }
    const p = toSource(event.clientX, event.clientY);
    // Zoom-in cursor over clickable sky (also with motion off: clicking still works).
    hero.classList.toggle("is-aiming", isSky(p.x, p.y, SKY_MARGIN));
    if (!viewfinderAllowed()) {
      hero.classList.remove("is-watching");
      return;
    }
    pointerInside = true;
    // Only follow over the sky; elsewhere the telescope keeps its last heading.
    if (isSky(p.x, p.y, 40)) pointerTarget = p;
    hero.classList.add("is-watching");
    if (!locked && pointerTarget) aimAt(pointerTarget);
  };

  const onPointerLeave = () => {
    pointerInside = false;
    pointerTarget = undefined;
    hero.classList.remove("is-aiming");
    if (!locked) {
      hero.classList.remove("is-watching");
      aimAt(TELESCOPE_REST);
    }
  };

  hero.addEventListener("pointermove", onPointerMove, { passive: true });
  hero.addEventListener("pointerleave", onPointerLeave);

  // Hero went idle (scrolled away, tab hidden, motion off): drop the viewfinder.
  const idleObserver = new MutationObserver(() => {
    if (
      hero.classList.contains("is-idle") &&
      hero.classList.contains("is-watching")
    ) {
      hero.classList.remove("is-watching");
      cancelAnimationFrame(frame);
      frame = 0;
    }
  });
  idleObserver.observe(hero, { attributes: true, attributeFilter: ["class"] });

  window.addEventListener("pagehide", (event) => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (event.persisted) return;
    hero.removeEventListener("pointermove", onPointerMove);
    hero.removeEventListener("pointerleave", onPointerLeave);
    resizeObserver.disconnect();
    idleObserver.disconnect();
    window.removeEventListener("resize", measure);
  });

  render();
}
