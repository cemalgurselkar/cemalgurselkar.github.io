/**
 * Landmark map of src/assets/observatory-night.png (1672×941), measured in source pixels.
 *
 * Every hero overlay (stars, steam, monitor effects, hotspot) is positioned from this file,
 * inside a "stage" box that has exactly the image's size and crop (see ObservatoryHero.astro),
 * so overlays stay glued to the artwork at every viewport size. If the artwork ever changes,
 * re-measure here and nothing else needs to move.
 */

export const ART = { width: 1672, height: 941 } as const;

export interface PxRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Source-pixel rectangles (left, top, width, height). */
export const REGIONS = {
  /** Outer monitor bezel — the clickable hotspot. */
  monitor: { x: 547, y: 561, w: 341, h: 176 },
  /** Inner screen — monitor effects are clipped to this. */
  screen: { x: 560, y: 571, w: 316, h: 153 },
  /** Small chart panel on the right of the screen. */
  chart: { x: 780, y: 607, w: 85, h: 58 },
  /** Right after the last code line: blinking cursor. */
  cursor: { x: 662, y: 695, w: 7, h: 9 },
  /** Above the mug rim, around the painted (static) steam. */
  steam: { x: 928, y: 606, w: 54, h: 108 },
  /** Warm light pool under the desk lamp (bulb ≈ 1170, 607). */
  lampLight: { x: 1000, y: 560, w: 360, h: 260 },
  /** Galaxy, axis-aligned bounds (the galaxy itself is tilted ≈ −25°). */
  galaxy: { x: 1075, y: 55, w: 400, h: 260 },
  /** Sleeping cat (static — no separate sprite layer exists). */
  cat: { x: 1030, y: 710, w: 200, h: 70 },
  /** The painted shooting star; animated ones avoid this box. */
  paintedShootingStar: { x: 690, y: 150, w: 170, h: 95 },
  /** Telescope; no stars are placed over it. */
  telescope: { x: 1400, y: 410, w: 215, h: 320 },
  /** Clickable telescope: tube, mount and tripod. */
  telescopeHit: { x: 1405, y: 415, w: 205, h: 310 },
} as const satisfies Record<string, PxRect>;

/** Centre of the telescope's objective lens; the tube points up-left from the eyepiece (≈1602, 525). */
export const TELESCOPE_LENS = { x: 1425, y: 440 } as const;
/** Where the telescope "looks" when nobody is steering it (along the painted tube's axis). */
export const TELESCOPE_REST = { x: 1240, y: 352 } as const;

export type RegionName = keyof typeof REGIONS;

/** Inner edge of the round window frame: [y, leftX, rightX] in source px, top to bottom. */
const WINDOW_EDGE: readonly [number, number, number][] = [
  [0, 610, 1495],
  [100, 525, 1555],
  [200, 465, 1598],
  [300, 430, 1622],
  [400, 410, 1636],
  [520, 402, 1642],
];

/** Visible sky: inside the window, above the mountains, not over the telescope. */
export function isSky(x: number, y: number, margin = 14): boolean {
  if (y < 8 || y > 525) return false;
  const found = WINDOW_EDGE.findIndex(([edgeY]) => edgeY >= y);
  const i = found === -1 ? WINDOW_EDGE.length - 1 : found;
  const [y1, l1, r1] = WINDOW_EDGE[Math.max(0, i - 1)];
  const [y2, l2, r2] = WINDOW_EDGE[i];
  const t = y2 === y1 ? 0 : (y - y1) / (y2 - y1);
  const left = l1 + (l2 - l1) * t;
  const right = r1 + (r2 - r1) * t;
  if (x < left + margin || x > right - margin) return false;
  const tel = REGIONS.telescope;
  if (x > tel.x - margin && x < tel.x + tel.w + margin && y > tel.y - margin)
    return false;
  return true;
}

export function inRect(x: number, y: number, r: PxRect, pad = 0): boolean {
  return (
    x >= r.x - pad &&
    x <= r.x + r.w + pad &&
    y >= r.y - pad &&
    y <= r.y + r.h + pad
  );
}

/** Percent of the stage, as CSS. */
export const px = (x: number) => `${((x / ART.width) * 100).toFixed(3)}%`;
export const py = (y: number) => `${((y / ART.height) * 100).toFixed(3)}%`;

/** Inline style that places an element over a region of the artwork. */
export function regionStyle(name: RegionName): string {
  const r = REGIONS[name];
  return `left:${px(r.x)};top:${py(r.y)};width:${px(r.w)};height:${py(r.h)}`;
}

/** Small deterministic PRNG (mulberry32) so builds are stable while positions still look random. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
