/**
 * Eyepiece view: every object is painted in code, pixel by pixel, on a tiny 128×128 canvas
 * that CSS scales up with `image-rendering: pixelated` — the same chunky look as the artwork,
 * with no image files.
 *
 * - Planets and exoplanets are lit spheres with banded (quantised) shading and procedural
 *   surfaces (value noise), slowly rotating; Saturn has its rings, Jupiter its four moons.
 * - Stars are glowing discs with limb darkening and diffraction spikes.
 * - Constellations reuse src/lib/constellations.ts and draw their lines one by one.
 * - Andromeda is a pre-computed particle disc with dust lanes and its two companions.
 *
 * ~30 fps via requestAnimationFrame, paused while the tab is hidden, stopped on close.
 * With motion disabled a single finished frame is drawn.
 */
import { CONSTELLATIONS } from "../../lib/constellations";
import { seededRandom } from "../../lib/observatory-map";
import type { SkyObject } from "../../lib/sky-catalog";

export const RES = 128;
const FRAME_MS = 1000 / 30;
/** Time used for the single still frame (constellation lines fully drawn, etc.). */
const STILL_T = 60_000;

type RGB = readonly [number, number, number];
type Paint = (buf: PixelBuffer, t: number) => void;

export interface View {
  stop: () => void;
}

// ---- helpers -----------------------------------------------------------------------

const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
const TAU = Math.PI * 2;
/** Angle difference wrapped to [-π, π]. */
const wrap = (a: number) => a - TAU * Math.round(a / TAU);
const WHITE: RGB = [255, 255, 255];

const hashString = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

class PixelBuffer {
  readonly data: Uint8ClampedArray;
  constructor(image: ImageData) {
    this.data = image.data;
  }

  /** Paint over (alpha blend). */
  plot(x: number, y: number, c: RGB, a = 1): void {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= RES || y >= RES || a <= 0) return;
    const d = this.data;
    const i = (y * RES + x) * 4;
    if (a >= 1) {
      d[i] = c[0];
      d[i + 1] = c[1];
      d[i + 2] = c[2];
    } else {
      d[i] += (c[0] - d[i]) * a;
      d[i + 1] += (c[1] - d[i + 1]) * a;
      d[i + 2] += (c[2] - d[i + 2]) * a;
    }
    d[i + 3] = 255;
  }

  /** Add light (glows); the clamped array saturates at white. */
  add(x: number, y: number, c: RGB, a: number): void {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= RES || y >= RES || a <= 0) return;
    const d = this.data;
    const i = (y * RES + x) * 4;
    d[i] += c[0] * a;
    d[i + 1] += c[1] * a;
    d[i + 2] += c[2] * a;
    d[i + 3] = 255;
  }
}

/** Seeded 3-D value noise with octaves, in [0, 1]. */
function makeNoise(seed: number) {
  const rand = seededRandom(seed);
  const perm = new Uint8Array(512);
  const values = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    perm[i] = i;
    values[i] = rand();
  }
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];

  const at = (x: number, y: number, z: number) =>
    values[perm[perm[perm[x & 255] + (y & 255)] + (z & 255)]];
  const fade = (t: number) => t * t * (3 - 2 * t);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const noise = (x: number, y: number, z: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const zi = Math.floor(z);
    const u = fade(x - xi);
    const v = fade(y - yi);
    const w = fade(z - zi);
    return lerp(
      lerp(
        lerp(at(xi, yi, zi), at(xi + 1, yi, zi), u),
        lerp(at(xi, yi + 1, zi), at(xi + 1, yi + 1, zi), u),
        v,
      ),
      lerp(
        lerp(at(xi, yi, zi + 1), at(xi + 1, yi, zi + 1), u),
        lerp(at(xi, yi + 1, zi + 1), at(xi + 1, yi + 1, zi + 1), u),
        v,
      ),
      w,
    );
  };

  return (x: number, y: number, z: number, octaves = 3) => {
    let sum = 0;
    let amp = 0.5;
    let freq = 1;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += amp * noise(x * freq, y * freq, z * freq);
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return sum / norm;
  };
}

type Noise = ReturnType<typeof makeNoise>;
/** Noise sampled on the sphere so it wraps seamlessly in longitude. */
const surfaceNoise = (
  n: Noise,
  lat: number,
  lon: number,
  scale: number,
  octaves = 3,
) =>
  n(
    Math.cos(lon) * scale + 50,
    Math.sin(lon) * scale + 50,
    lat * scale + 50,
    octaves,
  );

// ---- sky background ------------------------------------------------------------------

function makeSky(seed: number) {
  const bg = new Uint8ClampedArray(RES * RES * 4);
  const inner = hex("#0b0d22");
  const outer = hex("#04050d");
  for (let y = 0; y < RES; y++) {
    for (let x = 0; x < RES; x++) {
      const d = Math.hypot(x - RES / 2, y - RES / 2) / (RES / 2);
      const c = mix(inner, outer, clamp(d));
      const i = (y * RES + x) * 4;
      bg[i] = c[0];
      bg[i + 1] = c[1];
      bg[i + 2] = c[2];
      bg[i + 3] = 255;
    }
  }
  const rand = seededRandom(seed);
  const tones = [
    hex("#f2f0fa"),
    hex("#cfd8ff"),
    hex("#b4a4de"),
    hex("#ffe2c0"),
  ];
  const stars = Array.from({ length: 70 }, () => ({
    x: rand() * RES,
    y: rand() * RES,
    b: 0.25 + rand() * 0.6,
    phase: rand() * TAU,
    speed: 400 + rand() * 900,
    c: tones[Math.floor(rand() * tones.length)],
  }));

  return (buf: PixelBuffer, t: number) => {
    buf.data.set(bg);
    for (const s of stars)
      buf.plot(
        s.x,
        s.y,
        s.c,
        s.b * (0.65 + 0.35 * Math.sin(t / s.speed + s.phase)),
      );
  };
}

// ---- shapes ------------------------------------------------------------------------

interface SphereOptions {
  cx: number;
  cy: number;
  r: number;
  /** Rotation (radians) added to longitude. */
  rot: number;
  /** Axial tilt on screen (radians). */
  tilt?: number;
  /** Direction towards the light. */
  light: readonly [number, number, number];
  /** Number of shading bands (pixel-art terminator). */
  levels?: number;
  ambient?: number;
  /** Colour of the light (e.g. a red dwarf), multiplied in. */
  tint?: RGB;
  /** Thin rim of atmosphere. */
  atmosphere?: RGB;
  surface: (lat: number, lon: number) => RGB;
}

function sphere(buf: PixelBuffer, o: SphereOptions): void {
  const len = Math.hypot(...o.light);
  const lx = o.light[0] / len;
  const ly = o.light[1] / len;
  const lz = o.light[2] / len;
  const cos = Math.cos(o.tilt ?? 0);
  const sin = Math.sin(o.tilt ?? 0);
  const levels = o.levels ?? 5;
  const ambient = o.ambient ?? 0.05;

  for (let py = Math.floor(o.cy - o.r); py <= Math.ceil(o.cy + o.r); py++) {
    for (let px = Math.floor(o.cx - o.r); px <= Math.ceil(o.cx + o.r); px++) {
      const sx = (px + 0.5 - o.cx) / o.r;
      const sy = (py + 0.5 - o.cy) / o.r;
      const d2 = sx * sx + sy * sy;
      if (d2 > 1) continue;
      const nz = Math.sqrt(1 - d2);
      const shade =
        Math.ceil(clamp(sx * lx + sy * ly + nz * lz) * levels) / levels;
      // Texture coordinates in the planet's own frame (undo the on-screen tilt).
      const tx = sx * cos + sy * sin;
      const ty = -sx * sin + sy * cos;
      const lat = Math.asin(clamp(-ty, -1, 1));
      const lon = Math.atan2(tx, nz) + o.rot;
      const base = o.surface(lat, lon);
      const k = ambient + (1 - ambient) * shade;
      let c: RGB = [base[0] * k, base[1] * k, base[2] * k];
      if (o.tint)
        c = [
          (c[0] * o.tint[0]) / 255,
          (c[1] * o.tint[1]) / 255,
          (c[2] * o.tint[2]) / 255,
        ];
      if (o.atmosphere && d2 > 0.8)
        c = mix(
          c,
          o.atmosphere,
          ((d2 - 0.8) / 0.2) * 0.55 * (0.25 + 0.75 * shade),
        );
      buf.plot(px, py, c);
    }
  }
}

interface StarOptions {
  spikes?: boolean;
  /** Boiling, mottled surface (supergiants). */
  mottle?: Noise;
  /** Horizontal stretch (fast rotators). */
  oblate?: number;
  glow?: number;
}

function star(
  buf: PixelBuffer,
  cx: number,
  cy: number,
  r: number,
  color: RGB,
  t: number,
  o: StarOptions = {},
): void {
  const oblate = o.oblate ?? 1;
  const pulse = 1 + 0.06 * Math.sin(t / 700);
  const glow = (o.glow ?? 0.55) * pulse;
  const reach = r * 3.2 + 3;
  for (let py = Math.floor(cy - reach); py <= Math.ceil(cy + reach); py++) {
    for (
      let px = Math.floor(cx - reach * oblate);
      px <= Math.ceil(cx + reach * oblate);
      px++
    ) {
      const dx = (px + 0.5 - cx) / (r * oblate);
      const dy = (py + 0.5 - cy) / r;
      const d = Math.hypot(dx, dy);
      if (d <= 1) {
        const limb = 1 - 0.5 * (1 - Math.sqrt(1 - d * d));
        let c = mix(color, WHITE, 0.5 * (1 - d * d));
        if (o.mottle) {
          const m = o.mottle(px * 0.16, py * 0.16, t * 0.00012, 3);
          c = mix(
            c,
            [c[0] * 0.55, c[1] * 0.45, c[2] * 0.4],
            clamp((0.55 - m) * 2.2),
          );
        }
        buf.plot(px, py, [c[0] * limb, c[1] * limb, c[2] * limb]);
      } else {
        buf.add(px, py, color, Math.exp(-(d - 1) * 1.7) * glow);
      }
    }
  }
  if (o.spikes) {
    const len = Math.round(r * 4 + 6);
    for (let i = 1; i <= len; i++) {
      const a = (1 - i / len) ** 2 * 0.9 * pulse;
      const e = r * oblate + i;
      buf.add(cx + e, cy, color, a);
      buf.add(cx - e, cy, color, a);
      buf.add(cx, cy + r + i, color, a);
      buf.add(cx, cy - r - i, color, a);
    }
  }
}

/** Large soft glow, for the host star of an exoplanet just off the edge of the view. */
function hostGlow(
  buf: PixelBuffer,
  cx: number,
  cy: number,
  r: number,
  color: RGB,
  t: number,
): void {
  star(buf, cx, cy, r, color, t, { glow: 0.85 });
}

// ---- painters --------------------------------------------------------------------------

const LIGHT = [-0.55, -0.35, 0.76] as const;
const toward = (fromX: number, fromY: number, toX: number, toY: number) =>
  [
    toX - fromX,
    toY - fromY,
    Math.hypot(toX - fromX, toY - fromY) * 0.6,
  ] as const;

function saturn(): Paint {
  const n = makeNoise(6);
  const cx = 64;
  const cy = 64;
  const r = 24;
  const tilt = -0.42;
  const open = 0.36;
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const pale = hex("#ecdcac");
  const tan = hex("#c9a86a");
  const cream = hex("#f3e7c2");
  const pole = hex("#9ba6a6");

  const ring = (buf: PixelBuffer, front: boolean) => {
    const reach = r * 2.35;
    for (let py = Math.floor(cy - reach); py <= Math.ceil(cy + reach); py++) {
      for (let px = Math.floor(cx - reach); px <= Math.ceil(cx + reach); px++) {
        const u = px + 0.5 - cx;
        const v = py + 0.5 - cy;
        const ru = u * cos + v * sin;
        const rv = -u * sin + v * cos;
        if (rv > 0 !== front) continue;
        const rho = Math.hypot(ru, rv / open) / r;
        let c: RGB;
        let a: number;
        if (rho < 1.25 || rho > 2.27) continue;
        if (rho < 1.52)
          [c, a] = [hex("#8f7f66"), 0.4]; // C ring
        else if (rho < 1.95)
          [c, a] = [mix(pale, cream, 0.5 + 0.5 * Math.sin(rho * 70)), 0.95]; // B ring
        else if (rho < 2.03)
          continue; // Cassini division
        else if (rho > 2.2 && rho < 2.215)
          continue; // Encke gap
        else [c, a] = [hex("#cdb98c"), 0.8]; // A ring
        // The far half of the ring is lit less (and partly in Saturn's shadow).
        const k = front ? 1 : 0.78;
        buf.plot(px, py, [c[0] * k, c[1] * k, c[2] * k], a);
      }
    }
  };

  return (buf, t) => {
    ring(buf, false);
    sphere(buf, {
      cx,
      cy,
      r,
      tilt,
      rot: t * 0.00012,
      light: LIGHT,
      surface: (lat, lon) => {
        if (Math.abs(lat) > 1.15) return pole;
        const b = Math.sin(lat * 7 + surfaceNoise(n, lat, lon, 1.5) * 1.6);
        return b > 0.4 ? cream : b < -0.5 ? tan : pale;
      },
    });
    ring(buf, true);
  };
}

function jupiter(): Paint {
  const n = makeNoise(11);
  const cx = 64;
  const cy = 64;
  const r = 32;
  const cream = hex("#eadbbd");
  const tan = hex("#c99e72");
  const brown = hex("#8f6248");
  const spot = hex("#c4613c");
  const spotRim = hex("#e0a27a");
  const moon = hex("#efe6d4");
  // Io, Europa, Ganymede, Callisto: orbit size (px), speed (rad/ms), phase, size (px).
  const moons = [
    [40, 0.0009, 0.4, 1],
    [47, 0.00045, 2.4, 1],
    [55, 0.00022, 4.1, 2],
    [62, 0.0001, 5.5, 2],
  ] as const;

  return (buf, t) => {
    const rot = t * 0.00016;
    const moonPos = moons.map(([a, w, phase, size]) => {
      const angle = phase + t * w;
      return {
        x: cx + a * Math.sin(angle),
        y: cy + a * Math.sin(angle) * 0.04,
        behind: Math.cos(angle) < 0,
        size,
      };
    });
    const drawMoons = (behind: boolean) => {
      for (const m of moonPos) {
        if (m.behind !== behind) continue;
        if (behind && Math.abs(m.x - cx) < r) continue; // hidden by the planet
        for (let i = 0; i < m.size; i++)
          for (let j = 0; j < m.size; j++) buf.plot(m.x + i, m.y + j, moon);
      }
    };
    drawMoons(true);
    sphere(buf, {
      cx,
      cy,
      r,
      rot,
      light: LIGHT,
      surface: (lat, lon) => {
        const dLon = wrap(lon - 0.35); // fixed on the surface: it turns with the planet
        const e = (dLon / 0.34) ** 2 + ((lat + 0.36) / 0.12) ** 2;
        if (e < 0.45) return spot;
        if (e < 1) return spotRim;
        const b = Math.sin(
          lat * 11 + (surfaceNoise(n, lat, lon, 2) - 0.5) * 3.2,
        );
        return b > 0.3 ? cream : b < -0.45 ? brown : tan;
      },
    });
    drawMoons(false);
  };
}

function mars(): Paint {
  const n = makeNoise(4);
  const rust = hex("#c4643c");
  const dark = hex("#7c3c28");
  const ochre = hex("#df9a64");
  const ice = hex("#f4f0ea");
  return (buf, t) =>
    sphere(buf, {
      cx: 64,
      cy: 64,
      r: 34,
      rot: t * 0.0002,
      light: LIGHT,
      atmosphere: hex("#f0b090"),
      surface: (lat, lon) => {
        const m = surfaceNoise(n, lat, lon, 2.2, 4);
        if (Math.abs(lat) > 1.2 - (m - 0.5) * 0.3) return ice;
        if (m > 0.56) return dark;
        if (m > 0.5) return mix(rust, dark, 0.45);
        if (m < 0.36) return ochre;
        return rust;
      },
    });
}

function neptune(): Paint {
  const n = makeNoise(21);
  const blue = hex("#3d63d6");
  const light = hex("#5c86ec");
  const deep = hex("#20337e");
  const cloud = hex("#dbe8ff");
  return (buf, t) => {
    const rot = t * 0.00018;
    sphere(buf, {
      cx: 64,
      cy: 64,
      r: 30,
      rot,
      light: LIGHT,
      atmosphere: hex("#a4c4ff"),
      surface: (lat, lon) => {
        const dLon = wrap(lon - 0.2);
        if ((dLon / 0.3) ** 2 + ((lat + 0.35) / 0.12) ** 2 < 1) return deep; // dark spot
        const streak = n(
          Math.cos(lon) * 3 + 9,
          Math.sin(lon) * 3 + 9,
          lat * 16,
          2,
        );
        if (streak > 0.72 && Math.abs(lat) > 0.2 && Math.abs(lat) < 0.7)
          return cloud;
        return Math.sin(lat * 5 + surfaceNoise(n, lat, lon, 1.2) * 1.2) > 0.3
          ? light
          : blue;
      },
    });
  };
}

interface ExoplanetSpec {
  seed: number;
  host: { x: number; y: number; r: number; color: string };
  planet: { x: number; y: number; r: number };
  tint: string;
  atmosphere?: string;
  spin: number;
  surface: (n: Noise, lat: number, lon: number, t: number) => RGB;
}

function exoplanet(spec: ExoplanetSpec): Paint {
  const n = makeNoise(spec.seed);
  const hostColor = hex(spec.host.color);
  const { x, y, r } = spec.planet;
  const light = toward(x, y, spec.host.x, spec.host.y);
  return (buf, t) => {
    hostGlow(buf, spec.host.x, spec.host.y, spec.host.r, hostColor, t);
    sphere(buf, {
      cx: x,
      cy: y,
      r,
      rot: t * spec.spin,
      light,
      ambient: 0.03,
      tint: hex(spec.tint),
      atmosphere: spec.atmosphere ? hex(spec.atmosphere) : undefined,
      surface: (lat, lon) => spec.surface(n, lat, lon, t),
    });
  };
}

const OCEAN = hex("#25486e");
const DEEP_OCEAN = hex("#1a3354");
const ICE = hex("#e4eaf0");
const CLOUD = hex("#f2f4f8");

const PAINTERS: Record<string, () => Paint> = {
  saturn,
  jupiter,
  mars,
  neptune,

  "trappist-1e": () =>
    exoplanet({
      seed: 17,
      host: { x: 112, y: 18, r: 8, color: "#ff6a3a" },
      planet: { x: 54, y: 72, r: 32 },
      tint: "#ffc0a4",
      atmosphere: "#ffb090",
      spin: 0.00015,
      surface: (n, lat, lon) => {
        if (Math.abs(lat) > 1.05) return ICE;
        const m = surfaceNoise(n, lat, lon, 1.8, 4);
        if (m > 0.58) return hex("#7c5c48");
        if (m > 0.53) return hex("#a07a5c");
        return m < 0.4 ? DEEP_OCEAN : OCEAN;
      },
    }),

  "kepler-186f": () =>
    exoplanet({
      seed: 29,
      host: { x: 16, y: 18, r: 9, color: "#ff8a4c" },
      planet: { x: 72, y: 72, r: 33 },
      tint: "#ffd4b4",
      atmosphere: "#ffc8a0",
      spin: 0.00014,
      surface: (n, lat, lon, t) => {
        const cloud = n(
          Math.cos(lon + t * 0.00008) * 2.6 + 3,
          Math.sin(lon + t * 0.00008) * 2.6 + 3,
          lat * 3,
          3,
        );
        if (cloud > 0.64) return CLOUD;
        if (Math.abs(lat) > 1.15) return ICE;
        const m = surfaceNoise(n, lat, lon, 1.6, 4);
        if (m > 0.6) return hex("#8a6a3e");
        if (m > 0.5) return hex("#5c7a3c");
        return OCEAN;
      },
    }),

  "51-pegasi-b": () =>
    exoplanet({
      seed: 51,
      host: { x: 118, y: 10, r: 18, color: "#fff0bc" },
      planet: { x: 50, y: 76, r: 28 },
      tint: "#fff2dc",
      spin: 0.0002,
      surface: (n, lat, lon) => {
        const b = Math.sin(lat * 9 + (surfaceNoise(n, lat, lon, 2) - 0.5) * 3);
        return b > 0.35
          ? hex("#f0a454")
          : b < -0.4
            ? hex("#7a2e1e")
            : hex("#c4582c");
      },
    }),

  "hd-189733-b": () =>
    exoplanet({
      seed: 89,
      host: { x: 14, y: 16, r: 10, color: "#ffb464" },
      planet: { x: 70, y: 72, r: 31 },
      tint: "#ffffff",
      atmosphere: "#9cb8ff",
      spin: 0.00022,
      surface: (n, lat, lon) => {
        const b = Math.sin(
          lat * 8 + (surfaceNoise(n, lat, lon, 2.4) - 0.5) * 3.4,
        );
        return b > 0.4
          ? hex("#5a86f0")
          : b < -0.4
            ? hex("#1f3a96")
            : hex("#3560d8");
      },
    }),

  sirius: () => {
    const blue = hex("#cfe0ff");
    return (buf, t) => {
      star(buf, 60, 66, 6, blue, t, { spikes: true });
      star(buf, 76, 54, 1, WHITE, t, { glow: 0.35 }); // Sirius B
    };
  },

  betelgeuse: () => {
    const mottle = makeNoise(7);
    const red = hex("#ff6a2c");
    return (buf, t) => star(buf, 64, 64, 34, red, t, { mottle, glow: 0.5 });
  },

  polaris: () => {
    const yellow = hex("#fff1c8");
    return (buf, t) => {
      star(buf, 66, 60, 8, yellow, t, { spikes: true });
      star(buf, 40, 78, 1, hex("#e4ecff"), t, { glow: 0.3 }); // Polaris B
    };
  },

  vega: () => {
    const white = hex("#dbe6ff");
    return (buf, t) =>
      star(buf, 64, 64, 9, white, t, { spikes: true, oblate: 1.15 });
  },

  andromeda,
};

/** Star colours worth showing in constellations; everything else is white. */
const STAR_TONES: Record<string, string> = {
  Betelgeuse: "#ffa070",
  Rigel: "#cfdcff",
  Albireo: "#ffd29a",
  Dubhe: "#ffe4b8",
  Schedar: "#ffd8a8",
};

function constellation(id: string): Paint {
  const c = CONSTELLATIONS.find((x) => x.id === id);
  if (!c) return () => {};
  const accent = hex("#b4a4de");
  const map = (v: number) => 20 + v * 88;
  return (buf, t) => {
    c.lines.forEach(([a, b], i) => {
      const progress = clamp((t - 500 - i * 260) / 380);
      if (progress <= 0) return;
      const x1 = map(c.stars[a].x);
      const y1 = map(c.stars[a].y);
      const x2 = map(c.stars[b].x);
      const y2 = map(c.stars[b].y);
      const steps = Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)));
      for (let k = 0; k <= steps * progress; k++) {
        buf.plot(
          x1 + ((x2 - x1) * k) / steps,
          y1 + ((y2 - y1) * k) / steps,
          accent,
          0.55,
        );
      }
    });
    c.stars.forEach((s, i) => {
      const appear = clamp((t - i * 90) / 300);
      if (appear <= 0) return;
      const tone = hex(STAR_TONES[s.name] ?? "#f4f0ff");
      const r = s.mag === 1 ? 2.2 : s.mag === 2 ? 1.6 : 1.1;
      const c2: RGB = [tone[0] * appear, tone[1] * appear, tone[2] * appear];
      star(buf, map(s.x), map(s.y), r, c2, t, {
        spikes: s.mag === 1,
        glow: 0.45,
      });
    });
  };
}

function andromeda(): Paint {
  const rand = seededRandom(31);
  const acc = new Float32Array(RES * RES);
  const cx = 64;
  const cy = 64;
  const scale = 54;
  const flat = 0.3;
  const angle = -0.62;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // Stars in two loose spiral arms plus a diffuse disc.
  for (let i = 0; i < 2600; i++) {
    const r = Math.min(1.08, -Math.log(1 - rand() * 0.97) * 0.3);
    let theta = (i % 2) * Math.PI + r * 5.5 + (rand() - 0.5) * 0.9;
    if (rand() < 0.35) theta = rand() * TAU;
    const x = Math.cos(theta) * r;
    const y = Math.sin(theta) * r * flat;
    const px = Math.floor(cx + (x * cos - y * sin) * scale);
    const py = Math.floor(cy + (x * sin + y * cos) * scale);
    if (px >= 0 && py >= 0 && px < RES && py < RES)
      acc[py * RES + px] += 0.35 + rand() * 0.65;
  }

  const gauss = (dx: number, dy: number, sx: number, sy: number) =>
    Math.exp(-(dx * dx) / (2 * sx * sx) - (dy * dy) / (2 * sy * sy));
  const cool = hex("#5a4f9a");
  const lilac = hex("#b4a4de");
  const warm = hex("#f2e4cc");
  const core = hex("#fff8ec");
  const layer = new Float32Array(RES * RES * 4); // rgb + alpha

  for (let py = 0; py < RES; py++) {
    for (let px = 0; px < RES; px++) {
      const dx = (px + 0.5 - cx) / scale;
      const dy = (py + 0.5 - cy) / scale;
      const x = dx * cos + dy * sin; // back into the galaxy's own frame
      const y = -dx * sin + dy * cos;
      const rho = Math.hypot(x, y / flat);
      let v = acc[py * RES + px];
      // Dust lanes on the near side.
      if (y > 0 && rho > 0.42 && rho < 0.56) v *= 0.4;
      if (y > 0 && rho > 0.7 && rho < 0.78) v *= 0.65;
      // Bulge and nucleus (in pixels, along the disc).
      const ux = x * scale;
      const uy = y * scale;
      v += gauss(ux, uy, 12, 6) * 2.2 + gauss(ux, uy, 3.5, 2.5) * 5;
      // M32 (small, round, close) and M110 (larger, elongated, further out).
      v += gauss(px - (cx + 9), py - (cy - 12), 2.2, 2.2) * 2.6;
      v += gauss(px - (cx - 24), py - (cy + 22), 4, 2.6) * 1.2;

      const c =
        v < 1
          ? mix(cool, lilac, v)
          : v < 3
            ? mix(lilac, warm, (v - 1) / 2)
            : mix(warm, core, clamp((v - 3) / 3));
      const i = (py * RES + px) * 4;
      layer[i] = c[0];
      layer[i + 1] = c[1];
      layer[i + 2] = c[2];
      layer[i + 3] = clamp(v / 2);
    }
  }

  return (buf) => {
    const d = buf.data;
    for (let i = 0; i < layer.length; i += 4) {
      const a = layer[i + 3];
      if (a <= 0.01) continue;
      d[i] += layer[i] * a;
      d[i + 1] += layer[i + 1] * a;
      d[i + 2] += layer[i + 2] * a;
    }
  };
}

function makePainter(obj: SkyObject): Paint {
  if (obj.kind === "constellation") return constellation(obj.id);
  return PAINTERS[obj.id]?.() ?? (() => {});
}

/** Every catalog object must be paintable (checked by tests). */
export function canPaint(obj: SkyObject): boolean {
  return obj.kind === "constellation"
    ? CONSTELLATIONS.some((c) => c.id === obj.id)
    : obj.id in PAINTERS;
}

// ---- view ------------------------------------------------------------------------

export function startView(
  canvas: HTMLCanvasElement,
  obj: SkyObject,
  { animate }: { animate: boolean },
): View {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { stop: () => {} };
  canvas.width = RES;
  canvas.height = RES;
  const image = ctx.createImageData(RES, RES);
  const buf = new PixelBuffer(image);
  const sky = makeSky(hashString(obj.id));
  const paint = makePainter(obj);

  const draw = (t: number) => {
    sky(buf, t);
    paint(buf, t);
    ctx.putImageData(image, 0, 0);
  };

  if (!animate) {
    draw(STILL_T);
    return { stop: () => {} };
  }

  let frame = 0;
  let elapsed = 0;
  let last = performance.now();
  let sinceDraw = FRAME_MS;
  let stopped = false;

  const loop = (now: number) => {
    const dt = Math.min(now - last, 100);
    last = now;
    elapsed += dt;
    sinceDraw += dt;
    if (sinceDraw >= FRAME_MS) {
      sinceDraw = 0;
      draw(elapsed);
    }
    frame = requestAnimationFrame(loop);
  };

  const onVisibility = () => {
    if (stopped) return;
    cancelAnimationFrame(frame);
    if (!document.hidden) {
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
  };

  document.addEventListener("visibilitychange", onVisibility);
  draw(0);
  frame = requestAnimationFrame(loop);

  return {
    stop: () => {
      stopped = true;
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}
