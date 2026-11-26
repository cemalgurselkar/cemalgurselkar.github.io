/**
 * Telescope eyepiece: zoom into the clicked point of the sky, then look through the eyepiece.
 *
 * 1. The artwork stage zooms (WAAPI transform, ≈750 ms) so the clicked point lands in the
 *    middle of the hero; the pixel art is scaled with `image-rendering: pixelated`.
 * 2. A native modal <dialog> opens over it: a round lens with the object painted in code
 *    (./render.ts, loaded on first use), coming into focus, plus an info card.
 * 3. Escape, the close button or a click outside → the dialog fades and the zoom reverses.
 *
 * What you find (src/lib/sky-catalog.ts): the painted galaxy → Andromeda; any other part of
 * the sky → a random planet, exoplanet, star or constellation.
 *
 * Accessibility: modal semantics, focus trap and Escape from <dialog>; focus goes to the close
 * button and back to the opener; the lens canvas is role="img" with a label; "Point elsewhere"
 * changes are announced politely. Reduced motion / motion off: no zoom, no animation.
 */
import {
  ART,
  REGIONS,
  inRect,
  TELESCOPE_REST,
} from "../../lib/observatory-map";
import { ILLUSTRATION_NOTE, type SkyObject } from "../../lib/sky-catalog";
import { lockScroll, motionAllowed, unlockScroll } from "../scroll-lock";
import type { View } from "./render";

const ZOOM_MS = 750;
const ZOOM_OUT_MS = 520;
const ZOOM_SCALE = 3.2;
/** The dialog appears this far into the zoom, so the lens "arrives" with it. */
const DIALOG_AT = 0.6;
const ZOOM_EASE = "cubic-bezier(0.55, 0, 0.2, 1)";

export interface Point {
  x: number;
  y: number;
}

export interface EyepieceHooks {
  /** Where the telescope is about to look (source px) — the viewfinder parks there. */
  onAim: (point: Point) => void;
  /** Fully closed and zoomed back out. */
  onClose: () => void;
}

export interface Eyepiece {
  /** Look at a point of the sky (source px); without one, pick an object and aim at it. */
  open: (point?: Point, opener?: HTMLElement) => void;
  readonly busy: boolean;
}

type Modules = [
  typeof import("../../lib/sky-catalog"),
  typeof import("./render"),
];
let modules: Promise<Modules> | undefined;
const loadModules = () =>
  (modules ??= Promise.all([
    import("../../lib/sky-catalog"),
    import("./render"),
  ]).catch((error: unknown) => {
    modules = undefined; // allow a retry on the next click
    throw error;
  }));

const GALAXY_CENTER: Point = {
  x: REGIONS.galaxy.x + REGIONS.galaxy.w / 2,
  y: REGIONS.galaxy.y + REGIONS.galaxy.h / 2,
};

const delay = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

export function createEyepiece(
  hero: HTMLElement,
  stage: HTMLElement,
  hooks: EyepieceHooks,
): Eyepiece | undefined {
  const dialog = document.querySelector<HTMLDialogElement>("[data-eyepiece]");
  if (!dialog || typeof dialog.showModal !== "function") return undefined;

  const $ = <T extends Element>(selector: string) =>
    dialog.querySelector<T>(selector)!;
  const canvas = $<HTMLCanvasElement>("[data-eyepiece-canvas]");
  const lens = $<HTMLElement>("[data-eyepiece-lens]");
  const card = $<HTMLElement>("[data-eyepiece-card]");
  const kindEl = $<HTMLElement>("[data-eyepiece-kind]");
  const nameEl = $<HTMLElement>("[data-eyepiece-name]");
  const factsEl = $<HTMLElement>("[data-eyepiece-facts]");
  const descEl = $<HTMLElement>("[data-eyepiece-desc]");
  const noteEl = $<HTMLElement>("[data-eyepiece-note]");
  const linkEl = $<HTMLAnchorElement>("[data-eyepiece-link]");
  const nextButton = $<HTMLButtonElement>("[data-eyepiece-next]");
  const closeButton = $<HTMLButtonElement>("[data-eyepiece-close]");
  const liveEl = $<HTMLElement>("[data-eyepiece-live]");

  let state: "idle" | "opening" | "open" | "closing" = "idle";
  let view: View | undefined;
  let current: SkyObject | undefined;
  let zoom: Animation | undefined;
  let zoomTransform = "";
  let opener: HTMLElement | undefined;
  let locked = false;

  // ---- card + lens ------------------------------------------------------------------

  const fill = (obj: SkyObject) => {
    kindEl.textContent = obj.type;
    nameEl.textContent = obj.name;
    descEl.textContent = obj.description;
    factsEl.replaceChildren(
      ...obj.facts.flatMap(([label, value]) => {
        const dt = document.createElement("dt");
        dt.textContent = label;
        const dd = document.createElement("dd");
        dd.textContent = value;
        return [dt, dd];
      }),
    );
    noteEl.hidden = obj.kind !== "exoplanet";
    noteEl.textContent = obj.kind === "exoplanet" ? ILLUSTRATION_NOTE : "";
    // Catalog links are fixed Wikipedia URLs; still, only ever render https links.
    if (obj.wiki.startsWith("https://")) {
      linkEl.href = obj.wiki;
      linkEl.hidden = false;
    } else {
      linkEl.removeAttribute("href");
      linkEl.hidden = true;
    }
    canvas.setAttribute(
      "aria-label",
      `${obj.name} seen through the telescope (pixel-art illustration)`,
    );
  };

  const show = (obj: SkyObject, render: Modules[1], animate: boolean) => {
    view?.stop();
    current = obj;
    fill(obj);
    view = render.startView(canvas, obj, { animate });
    if (animate) {
      // "Focusing": blurred and dim → sharp.
      canvas.animate(
        [
          { filter: "blur(5px) brightness(0.6)", transform: "scale(1.06)" },
          { filter: "blur(0) brightness(1)", transform: "none" },
        ],
        { duration: 900, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
      );
    }
  };

  // ---- zoom ---------------------------------------------------------------------------

  /** Transform (origin 0 0) that scales the stage and brings `p` to the middle of the visible hero. */
  const zoomTo = (p: Point): string => {
    const heroRect = hero.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const localX = (p.x / ART.width) * stageRect.width;
    const localY = (p.y / ART.height) * stageRect.height;
    const offsetX = stageRect.left - heroRect.left;
    const offsetY = stageRect.top - heroRect.top;
    const visibleTop = Math.max(heroRect.top, 0);
    const visibleBottom = Math.min(heroRect.bottom, window.innerHeight);
    const centerX = heroRect.width / 2;
    const centerY = (visibleTop + visibleBottom) / 2 - heroRect.top;
    const tx = centerX - offsetX - localX * ZOOM_SCALE;
    const ty = centerY - offsetY - localY * ZOOM_SCALE;
    return `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${ZOOM_SCALE})`;
  };

  const zoomIn = (p: Point) => {
    zoomTransform = zoomTo(p);
    zoom = stage.animate(
      [{ transform: "none" }, { transform: zoomTransform }],
      {
        duration: ZOOM_MS,
        easing: ZOOM_EASE,
        fill: "forwards",
      },
    );
  };

  // ---- open / close ---------------------------------------------------------------------

  const begin = (from?: HTMLElement) => {
    state = "opening";
    opener = from;
    locked = true;
    lockScroll();
    hero.classList.add("is-observing");
  };

  /** Back to the scene (after the dialog closed, or if opening failed). */
  const finish = () => {
    zoom?.cancel();
    zoom = undefined;
    hero.classList.remove("is-observing");
    if (locked) {
      locked = false;
      unlockScroll();
    }
    state = "idle";
    const target = opener;
    opener = undefined;
    target?.focus({ preventScroll: true });
    hooks.onClose();
  };

  async function open(point?: Point, from?: HTMLElement) {
    if (state !== "idle") return;
    const motion = motionAllowed();
    begin(from);
    try {
      let catalog: Modules[0];
      let render: Modules[1];
      let obj: SkyObject;
      if (point) {
        // Aim and start zooming at once; the modules load during the zoom.
        hooks.onAim(point);
        if (motion) zoomIn(point);
        [[catalog, render]] = await Promise.all([
          loadModules(),
          motion ? delay(ZOOM_MS * DIALOG_AT) : null,
        ]);
        obj = catalog.pickObject({
          inGalaxy: inRect(point.x, point.y, REGIONS.galaxy, -30),
          exclude: current?.id,
        });
      } else {
        // Keyboard / telescope button: choose first, then look where that object is.
        [catalog, render] = await loadModules();
        obj = catalog.pickObject({ allowGalaxy: true, exclude: current?.id });
        const aim = obj.kind === "galaxy" ? GALAXY_CENTER : TELESCOPE_REST;
        hooks.onAim(aim);
        if (motion) {
          zoomIn(aim);
          await delay(ZOOM_MS * DIALOG_AT);
        }
      }
      if ((state as string) !== "opening") return; // left the page meanwhile

      dialog!.showModal();
      state = "open";
      show(obj, render, motion);
      closeButton.focus({ preventScroll: true });
      if (motion) {
        lens.animate(
          [
            { opacity: 0, transform: "scale(0.82)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 600, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
        );
        card.animate(
          [
            { opacity: 0, transform: "translateY(10px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 420, delay: 380, easing: "ease-out", fill: "backwards" },
        );
      }
    } catch {
      // Couldn't load the view (offline?): quietly return to the scene.
      if (dialog!.open) dialog!.close();
      finish();
    }
  }

  const close = () => {
    if (state !== "open") return;
    state = "closing";
    if (!motionAllowed()) {
      dialog.close();
      return;
    }
    const fade = dialog.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 200,
      easing: "ease-in",
      fill: "forwards",
    });
    fade.onfinish = () => {
      dialog.close();
      fade.cancel();
    };
  };

  dialog.addEventListener("close", () => {
    view?.stop();
    view = undefined;
    if (state === "idle") return;
    state = "closing";
    hero.classList.remove("is-observing"); // title and buttons come back while zooming out
    if (zoom && motionAllowed()) {
      const out = stage.animate(
        [{ transform: zoomTransform }, { transform: "none" }],
        {
          duration: ZOOM_OUT_MS,
          easing: ZOOM_EASE,
        },
      );
      zoom.cancel();
      zoom = undefined;
      out.onfinish = finish;
      out.oncancel = finish;
    } else {
      finish();
    }
  });

  // Escape → animated close instead of the instant default.
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });

  // Click on the dark area around the lens and card.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });

  closeButton.addEventListener("click", close);

  nextButton.addEventListener("click", async () => {
    if (state !== "open") return;
    const [catalog, render] = await loadModules();
    if (state !== "open") return;
    const obj = catalog.pickObject({ allowGalaxy: true, exclude: current?.id });
    show(obj, render, motionAllowed());
    liveEl.textContent = `Now showing ${obj.name}, ${obj.type}.`;
    if (motionAllowed()) {
      card.animate([{ opacity: 0.2 }, { opacity: 1 }], {
        duration: 350,
        easing: "ease-out",
      });
    }
  });

  // Leaving the page (bfcache / navigation): never leave it zoomed or locked.
  window.addEventListener("pagehide", () => {
    view?.stop();
    view = undefined;
    const wasActive = state !== "idle";
    state = "idle";
    if (dialog.open) dialog.close();
    if (wasActive) {
      opener = undefined;
      finish();
    }
  });

  return {
    open: (point, from) => void open(point, from),
    get busy() {
      return state !== "idle";
    },
  };
}
