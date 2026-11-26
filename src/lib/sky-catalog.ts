/**
 * What the telescope can find. Plain data, shown in the eyepiece card (src/scripts/eyepiece/).
 *
 * - Clicking the painted galaxy always shows Andromeda (the only galaxy).
 * - Clicking anywhere else in the sky shows a random planet, exoplanet, star or constellation.
 * Facts are well-established, rounded values; each entry links to its Wikipedia article.
 * Every object here also needs a painter in src/scripts/eyepiece/render.ts (checked by tests).
 */

export type SkyKind =
  "galaxy" | "planet" | "exoplanet" | "star" | "constellation";

export interface SkyObject {
  id: string;
  kind: SkyKind;
  name: string;
  /** Short type shown above the name, e.g. "Gas giant". */
  type: string;
  /** Up to three label/value pairs. */
  facts: [string, string][];
  description: string;
  wiki: string;
}

/** Shown for objects no telescope can actually resolve (all exoplanets). */
export const ILLUSTRATION_NOTE =
  "Artist's impression: no telescope can show this planet's surface yet.";

const wiki = (page: string) => `https://en.wikipedia.org/wiki/${page}`;

export const SKY_CATALOG: SkyObject[] = [
  // ---- galaxy (only via the painted galaxy, or the keyboard "look" button) -------------
  {
    id: "andromeda",
    kind: "galaxy",
    name: "Andromeda Galaxy",
    type: "Spiral galaxy · M31",
    facts: [
      ["Distance", "≈ 2.5 million light-years"],
      ["Stars", "≈ 1 trillion"],
      ["Companions", "M32 and M110"],
    ],
    description:
      "The nearest large galaxy to our own Milky Way, and the most distant thing most people can see with the naked eye. The light reaching you tonight left it about 2.5 million years ago.",
    wiki: wiki("Andromeda_Galaxy"),
  },

  // ---- planets -------------------------------------------------------------------------
  {
    id: "saturn",
    kind: "planet",
    name: "Saturn",
    type: "Gas giant",
    facts: [
      ["From the Sun", "≈ 1.4 billion km (9.5 AU)"],
      ["Day", "≈ 10.7 hours"],
      ["Moons", "more than 270 known"],
    ],
    description:
      "Its rings are mostly water ice, in pieces from dust grains to boulders metres across. Saturn is so light for its size that it is less dense than water.",
    wiki: wiki("Saturn"),
  },
  {
    id: "jupiter",
    kind: "planet",
    name: "Jupiter",
    type: "Gas giant",
    facts: [
      ["From the Sun", "≈ 778 million km (5.2 AU)"],
      ["Day", "≈ 10 hours"],
      ["Mass", "2.5× all other planets combined"],
    ],
    description:
      "The Great Red Spot is a storm wider than Earth, watched since at least the 1830s. The four dots beside the planet are the moons Galileo discovered in 1610: Io, Europa, Ganymede and Callisto.",
    wiki: wiki("Jupiter"),
  },
  {
    id: "mars",
    kind: "planet",
    name: "Mars",
    type: "Rocky planet",
    facts: [
      ["From the Sun", "≈ 228 million km (1.5 AU)"],
      ["Day", "24 h 37 min"],
      ["Moons", "Phobos and Deimos"],
    ],
    description:
      "Its red colour comes from iron-oxide (rust) dust, and its white polar caps are water and carbon-dioxide ice. Mars has the tallest volcano in the Solar System, Olympus Mons.",
    wiki: wiki("Mars"),
  },
  {
    id: "neptune",
    kind: "planet",
    name: "Neptune",
    type: "Ice giant",
    facts: [
      ["From the Sun", "≈ 4.5 billion km (30 AU)"],
      ["Year", "≈ 165 Earth years"],
      ["Winds", "over 2,000 km/h"],
    ],
    description:
      "The windiest planet in the Solar System. It was the first planet found by mathematics: its position was predicted from Uranus's wobbles before it was seen in 1846.",
    wiki: wiki("Neptune"),
  },

  // ---- exoplanets ----------------------------------------------------------------------
  {
    id: "trappist-1e",
    kind: "exoplanet",
    name: "TRAPPIST-1e",
    type: "Rocky exoplanet",
    facts: [
      ["Distance", "≈ 40 light-years"],
      ["Year", "≈ 6.1 days"],
      ["Star", "TRAPPIST-1, a cool red dwarf"],
    ],
    description:
      "One of seven Earth-sized planets circling a tiny red star, and one of the best places to look for liquid water beyond the Solar System.",
    wiki: wiki("TRAPPIST-1e"),
  },
  {
    id: "kepler-186f",
    kind: "exoplanet",
    name: "Kepler-186f",
    type: "Rocky exoplanet",
    facts: [
      ["Distance", "≈ 580 light-years"],
      ["Year", "≈ 130 days"],
      ["Announced", "2014"],
    ],
    description:
      "The first Earth-sized planet found in the habitable zone of another star, the region where liquid water could exist on its surface.",
    wiki: wiki("Kepler-186f"),
  },
  {
    id: "51-pegasi-b",
    kind: "exoplanet",
    name: "51 Pegasi b",
    type: "Hot Jupiter",
    facts: [
      ["Distance", "≈ 50 light-years"],
      ["Year", "≈ 4.2 days"],
      ["Discovered", "1995"],
    ],
    description:
      "The first planet found orbiting a Sun-like star. Its discovery earned Michel Mayor and Didier Queloz the 2019 Nobel Prize in Physics.",
    wiki: wiki("51_Pegasi_b"),
  },
  {
    id: "hd-189733-b",
    kind: "exoplanet",
    name: "HD 189733 b",
    type: "Hot Jupiter",
    facts: [
      ["Distance", "≈ 64 light-years"],
      ["Year", "≈ 2.2 days"],
      ["Colour", "deep blue (measured by Hubble)"],
    ],
    description:
      "A scorching gas giant whose winds of about 8,700 km/h may whip molten glass sideways through its sky.",
    wiki: wiki("HD_189733_b"),
  },

  // ---- stars ---------------------------------------------------------------------------
  {
    id: "sirius",
    kind: "star",
    name: "Sirius",
    type: "Binary star",
    facts: [
      ["Distance", "≈ 8.6 light-years"],
      ["Constellation", "Canis Major"],
    ],
    description:
      "The brightest star in the night sky. Its faint companion, Sirius B, is a white dwarf about the size of Earth.",
    wiki: wiki("Sirius"),
  },
  {
    id: "betelgeuse",
    kind: "star",
    name: "Betelgeuse",
    type: "Red supergiant",
    facts: [
      ["Distance", "≈ 550 light-years"],
      ["Constellation", "Orion"],
    ],
    description:
      'So large that, in place of the Sun, it would reach past the orbit of Mars. In 2019–2020 it dimmed dramatically, the "Great Dimming", after throwing off a cloud of dust.',
    wiki: wiki("Betelgeuse"),
  },
  {
    id: "polaris",
    kind: "star",
    name: "Polaris",
    type: "Yellow supergiant",
    facts: [
      ["Distance", "≈ 430 light-years"],
      ["Constellation", "Ursa Minor"],
    ],
    description:
      "The North Star sits almost exactly above Earth's north pole, so the whole night sky seems to turn around it. It is really a triple star system.",
    wiki: wiki("Polaris"),
  },
  {
    id: "vega",
    kind: "star",
    name: "Vega",
    type: "Blue-white star",
    facts: [
      ["Distance", "≈ 25 light-years"],
      ["Constellation", "Lyra"],
    ],
    description:
      "Vega spins so fast that it bulges at its equator. As Earth's axis slowly wobbles, Vega will become the North Star in about 12,000 years.",
    wiki: wiki("Vega"),
  },

  // ---- constellations (shapes from src/lib/constellations.ts) -------------------------
  {
    id: "ursa-major",
    kind: "constellation",
    name: "Ursa Major",
    type: "Constellation · the Great Bear",
    facts: [
      ["Brightest star", "Alioth"],
      ["Best seen", "all year from the north"],
    ],
    description:
      "Seven of its stars form the Big Dipper. Follow the two stars at the end of the bowl, Merak and Dubhe, and they point to Polaris.",
    wiki: wiki("Ursa_Major"),
  },
  {
    id: "cassiopeia",
    kind: "constellation",
    name: "Cassiopeia",
    type: "Constellation · the Queen",
    facts: [
      ["Brightest star", "Schedar"],
      ["Best seen", "autumn evenings"],
    ],
    description:
      "A bright W of five stars, named after a vain queen of Greek myth. It sits across Polaris from the Big Dipper.",
    wiki: wiki("Cassiopeia_(constellation)"),
  },
  {
    id: "orion",
    kind: "constellation",
    name: "Orion",
    type: "Constellation · the Hunter",
    facts: [
      ["Brightest star", "Rigel"],
      ["Best seen", "winter evenings"],
    ],
    description:
      "Look for the three stars of his belt. Below them hangs his sword, home of the Orion Nebula, a nursery of new stars about 1,300 light-years away.",
    wiki: wiki("Orion_(constellation)"),
  },
  {
    id: "cygnus",
    kind: "constellation",
    name: "Cygnus",
    type: "Constellation · the Swan",
    facts: [
      ["Brightest star", "Deneb"],
      ["Best seen", "summer evenings"],
    ],
    description:
      "Also called the Northern Cross, it flies along the Milky Way. Deneb is one corner of the Summer Triangle, with Vega and Altair.",
    wiki: wiki("Cygnus_(constellation)"),
  },
];

export function getSkyObject(id: string): SkyObject | undefined {
  return SKY_CATALOG.find((o) => o.id === id);
}

export interface PickOptions {
  /** The click landed on the painted galaxy → Andromeda. */
  inGalaxy?: boolean;
  /** Let the galaxy be picked at random too (keyboard / "Point elsewhere"). */
  allowGalaxy?: boolean;
  /** Don't show the same object twice in a row. */
  exclude?: string;
  random?: () => number;
}

/**
 * Random pick: first a kind (so the 4 stars don't crowd out the 1 galaxy), then an object of
 * that kind. Never returns `exclude` unless nothing else is left.
 */
export function pickObject({
  inGalaxy = false,
  allowGalaxy = false,
  exclude,
  random = Math.random,
}: PickOptions = {}): SkyObject {
  if (inGalaxy) return getSkyObject("andromeda")!;
  const candidates = SKY_CATALOG.filter(
    (o) => o.id !== exclude && (allowGalaxy || o.kind !== "galaxy"),
  );
  const kinds = [...new Set(candidates.map((o) => o.kind))];
  const kind = kinds[Math.floor(random() * kinds.length)];
  const pool = candidates.filter((o) => o.kind === kind);
  return pool[Math.floor(random() * pool.length)] ?? SKY_CATALOG[0];
}
