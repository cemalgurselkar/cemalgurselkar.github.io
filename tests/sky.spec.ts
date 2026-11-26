import { expect, test } from "@playwright/test";
import { pickObject, SKY_CATALOG } from "../src/lib/sky-catalog";
import { canPaint } from "../src/scripts/eyepiece/render";

// Unit tests (no browser): the telescope catalog and its picker.

test("every object is complete and paintable", () => {
  const ids = new Set<string>();
  for (const obj of SKY_CATALOG) {
    expect(ids.has(obj.id), `duplicate ${obj.id}`).toBe(false);
    ids.add(obj.id);
    expect(obj.name.length).toBeGreaterThan(0);
    expect(obj.description.length).toBeGreaterThan(20);
    expect(obj.facts.length).toBeGreaterThan(0);
    expect(obj.facts.length).toBeLessThanOrEqual(3);
    expect(obj.wiki).toMatch(/^https:\/\/en\.wikipedia\.org\/wiki\/\S+$/);
    expect(canPaint(obj), `no painter for ${obj.id}`).toBe(true);
  }
});

test("Andromeda is the only galaxy and comes from the painted galaxy", () => {
  expect(
    SKY_CATALOG.filter((o) => o.kind === "galaxy").map((o) => o.id),
  ).toEqual(["andromeda"]);
  expect(pickObject({ inGalaxy: true }).id).toBe("andromeda");
});

test("empty sky picks every other kind, never the galaxy, never the same twice", () => {
  const seen = new Set<string>();
  let previous: string | undefined;
  for (let i = 0; i < 400; i++) {
    const obj = pickObject({ exclude: previous });
    expect(obj.kind).not.toBe("galaxy");
    expect(obj.id).not.toBe(previous);
    seen.add(obj.kind);
    previous = obj.id;
  }
  expect([...seen].sort()).toEqual([
    "constellation",
    "exoplanet",
    "planet",
    "star",
  ]);
});

test("the keyboard path can find the galaxy too", () => {
  const kinds = new Set(
    Array.from({ length: 300 }, () => pickObject({ allowGalaxy: true }).kind),
  );
  expect(kinds.has("galaxy")).toBe(true);
});
