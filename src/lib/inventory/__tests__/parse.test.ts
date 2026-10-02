import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { InventoryError, parseInventory } from "../parse";

const ROOMS = `## Pièces
Salon | moyenne | 23 | 20 | normale | oui |
Véranda | soleil direct | 28 | 12 | sèche | non | semi-chauffée
`;

describe("parseInventory", () => {
  it("parses the real data/inventaire.md", () => {
    const inventory = parseInventory(
      readFileSync(join(process.cwd(), "data", "inventaire.md"), "utf8")
    );

    expect(inventory.rooms).toHaveLength(5);
    expect(inventory.plants).toHaveLength(8);
    // The two Monstera share a single species
    expect(inventory.species).toHaveLength(7);
    expect(inventory.species.filter((s) => s === "Monstera deliciosa")).toHaveLength(1);

    expect(inventory.rooms.find((r) => r.name === "Véranda")).toEqual({
      name: "Véranda",
      light: "DIRECT_SUN",
      humidity: "NORMAL",
      tempSummer: 28,
      tempWinter: 12,
      nearHeater: false,
      notes: "semi-chauffée",
    });
    expect(inventory.plants.find((p) => p.name === "Sansevieria")?.description).toBe(
      "espèce supposée"
    );
  });

  it("ignores comments, quotes and blank lines", () => {
    const inventory = parseInventory(`# Titre
> note
<!-- commentaire
sur plusieurs lignes -->
${ROOMS}
## Plantes
<!-- surnom | espèce -->
Ficus | Ficus elastica | Salon | |
`);
    expect(inventory.rooms).toHaveLength(2);
    expect(inventory.plants).toHaveLength(1);
  });

  it("reports an unknown room instead of inventing it", () => {
    const md = `${ROOMS}\n## Plantes\nFicus | Ficus elastica | Garage | |\n`;
    expect(() => parseInventory(md)).toThrow(InventoryError);
    expect(() => parseInventory(md)).toThrow(/pièce inconnue « Garage »/);
  });

  it("reports invalid values with their line number", () => {
    const md = `## Pièces\nSalon | éblouissante | 23 | 20 | normale | oui |\n`;
    expect(() => parseInventory(md)).toThrow(/ligne 2 : lumière inconnu\(e\) « éblouissante »/);
  });

  it("collects every problem in one error", () => {
    const md = `## Pièces\nSalon | x | 23 | 20 | normale | oui |\nCave | faible | 12 | 10 | y | non |\n`;
    try {
      parseInventory(md);
      expect.unreachable();
    } catch (err) {
      expect((err as InventoryError).problems).toHaveLength(2);
    }
  });

  it("parses the optional pot column", () => {
    const md = `${ROOMS}\n## Plantes
A | Espèce a | Salon | 20 cm terre cuite |
B | Espèce b | Salon | 15 |
C | Espèce c | Salon | |
`;
    const [a, b, c] = parseInventory(md).plants;
    expect(a).toMatchObject({ potDiameterCm: 20, potMaterial: "TERRACOTTA" });
    expect(b).toMatchObject({ potDiameterCm: 15 });
    expect(b.potMaterial).toBeUndefined();
    expect(c.potDiameterCm).toBeUndefined();
  });

  it("rejects duplicates and unknown pot materials", () => {
    expect(() => parseInventory(`${ROOMS}\n## Plantes\nA | X y | Salon | |\nA | X y | Salon | |\n`)).toThrow(
      /plante en double/
    );
    expect(() => parseInventory(`${ROOMS}\n## Plantes\nA | X y | Salon | 20 bois |\n`)).toThrow(
      /matière de pot inconnue/
    );
  });
});
