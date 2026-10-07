import { describe, expect, it } from "vitest";
import { explainInterval, type IntervalInput } from "../interval";
import { nearestSeason } from "../season";

const NEUTRAL: IntervalInput = {
  intervalSpring: 10,
  intervalSummer: 7,
  intervalAutumn: 14,
  intervalWinter: 21,
  temperature: 20,
  light: "MEDIUM",
  humidity: "NORMAL",
  nearHeater: false,
  potMaterial: "PLASTIC",
  intervalAdjust: 1,
  date: new Date("2026-10-15T12:00:00Z"),
  heatingSeasonStart: "10-15",
  heatingSeasonEnd: "04-15",
};

describe("explainInterval", () => {
  it("explains a real case in plain French (hot room, direct sun, humid air)", () => {
    const e = explainInterval({
      ...NEUTRAL,
      temperature: 22.586956521739133,
      light: "DIRECT_SUN",
      humidity: "HUMID",
      date: new Date("2026-10-06T12:00:00Z"),
    });

    expect(e.factors.map((f) => f.label)).toEqual([
      "Pièce à 22,6 °C",
      "Soleil direct",
      "Air humide",
    ]);
    // ×0,90 and ×0,80 water more often, ×1,10 less often
    expect(e.factors.map((f) => [f.effect, f.percent])).toEqual([
      ["faster", 10],
      ["faster", 20],
      ["slower", 10],
    ]);
    expect(e.factors.every((f) => f.detail.length > 10)).toBe(true);
    expect(e.baseLabel).toContain("(automne)");
    expect(e.summary).toBe(`Arroser environ tous les ${e.final} jours`);
    expect(e.exact).toBeCloseTo(e.base * 0.9 * 0.8 * 1.1, 0);
  });

  it("never prints a raw float in a label", () => {
    const e = explainInterval({ ...NEUTRAL, temperature: 24.123456789 });
    expect(e.factors[0].label).toBe("Pièce à 24,1 °C");
  });

  it("lists nothing when every factor is neutral", () => {
    const e = explainInterval(NEUTRAL);
    expect(e.factors).toEqual([]);
    expect(e.final).toBe(14);
    expect(e.summary).toBe("Arroser environ tous les 14 jours");
  });

  it("describes pot, heater and manual adjustment", () => {
    const e = explainInterval({
      ...NEUTRAL,
      potMaterial: "TERRACOTTA",
      potDiameterCm: 10,
      nearHeater: true,
      intervalAdjust: 1.15,
    });
    expect(e.factors.map((f) => f.label)).toEqual([
      "Radiateur proche",
      "Pot en terre cuite",
      "Petit pot",
      "Ajustement de la plante",
    ]);
  });

  it("handles a manual override and singular days", () => {
    expect(explainInterval({ ...NEUTRAL, intervalOverride: 1 }).summary).toBe(
      "Arroser tous les jours"
    );
    expect(explainInterval({ ...NEUTRAL, intervalOverride: 9 }).baseLabel).toContain("manuellement");
  });
});

describe("nearestSeason", () => {
  it("names the closest seasonal anchor", () => {
    expect(nearestSeason(9, 6)).toBe("automne"); // 6 Oct
    expect(nearestSeason(6, 20)).toBe("été");
    expect(nearestSeason(0, 2)).toBe("hiver");
    expect(nearestSeason(11, 28)).toBe("hiver");
    expect(nearestSeason(3, 1)).toBe("printemps");
  });

  it("switches between two anchors at their midpoint", () => {
    expect(nearestSeason(10, 25)).toBe("automne"); // 25 Nov is closer to 15 Oct than 15 Jan
    expect(nearestSeason(11, 5)).toBe("hiver");
  });
});
