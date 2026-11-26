/**
 * Real constellations, simplified to their well-known asterisms.
 * Coordinates are normalised (0–1, y grows downward) and roughly follow the true star layout
 * as seen in the night sky; `mag` is only used for the drawn size (brighter → bigger).
 */

export interface ConstellationStar {
  name: string;
  x: number;
  y: number;
  /** 1 = brightest, 3 = faint. */
  mag: 1 | 2 | 3;
}

export interface Constellation {
  id: string;
  name: string;
  /** Short plain-English note shown under the drawing and announced to screen readers. */
  note: string;
  stars: ConstellationStar[];
  /** Pairs of star indexes. */
  lines: [number, number][];
}

export const CONSTELLATIONS: Constellation[] = [
  {
    id: "ursa-major",
    name: "Ursa Major",
    note: "The Great Bear — its Big Dipper points to Polaris.",
    stars: [
      { name: "Alkaid", x: 0.0, y: 0.32, mag: 2 },
      { name: "Mizar", x: 0.18, y: 0.14, mag: 2 },
      { name: "Alioth", x: 0.34, y: 0.16, mag: 1 },
      { name: "Megrez", x: 0.49, y: 0.24, mag: 3 },
      { name: "Phecda", x: 0.53, y: 0.5, mag: 2 },
      { name: "Merak", x: 0.82, y: 0.58, mag: 2 },
      { name: "Dubhe", x: 0.8, y: 0.27, mag: 1 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 3],
    ],
  },
  {
    id: "cassiopeia",
    name: "Cassiopeia",
    note: "The Queen — a bright W opposite the Big Dipper.",
    stars: [
      { name: "Caph", x: 0.02, y: 0.34, mag: 2 },
      { name: "Schedar", x: 0.26, y: 0.68, mag: 1 },
      { name: "Navi", x: 0.48, y: 0.42, mag: 2 },
      { name: "Ruchbah", x: 0.72, y: 0.66, mag: 2 },
      { name: "Segin", x: 0.98, y: 0.3, mag: 3 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  {
    id: "orion",
    name: "Orion",
    note: "The Hunter — find the three stars of his belt.",
    stars: [
      { name: "Meissa", x: 0.47, y: 0.0, mag: 3 },
      { name: "Betelgeuse", x: 0.22, y: 0.12, mag: 1 },
      { name: "Bellatrix", x: 0.71, y: 0.17, mag: 2 },
      { name: "Alnitak", x: 0.39, y: 0.52, mag: 2 },
      { name: "Alnilam", x: 0.48, y: 0.49, mag: 2 },
      { name: "Mintaka", x: 0.57, y: 0.46, mag: 2 },
      { name: "Saiph", x: 0.31, y: 0.94, mag: 2 },
      { name: "Rigel", x: 0.79, y: 0.88, mag: 1 },
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 5],
      [3, 4],
      [4, 5],
      [3, 6],
      [5, 7],
    ],
  },
  {
    id: "cygnus",
    name: "Cygnus",
    note: "The Swan — the Northern Cross, flying along the Milky Way.",
    stars: [
      { name: "Deneb", x: 0.5, y: 0.02, mag: 1 },
      { name: "Sadr", x: 0.5, y: 0.38, mag: 2 },
      { name: "Eta Cygni", x: 0.5, y: 0.66, mag: 3 },
      { name: "Albireo", x: 0.5, y: 0.98, mag: 2 },
      { name: "Gienah", x: 0.1, y: 0.3, mag: 2 },
      { name: "Fawaris", x: 0.88, y: 0.5, mag: 2 },
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [4, 1],
      [1, 5],
    ],
  },
];
