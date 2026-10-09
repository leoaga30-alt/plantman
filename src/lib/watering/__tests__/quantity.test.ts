import { describe, expect, it } from "vitest";
import { DEFAULT_POT_DIAMETER_CM, formatQuantity, potVolumeMl, waterQuantity } from "../quantity";

describe("potVolumeMl", () => {
  it("matches the volume of usual pots", () => {
    expect(potVolumeMl(10) / 1000).toBeCloseTo(0.45, 1); // 10 cm ≈ 0,45 L
    expect(potVolumeMl(15) / 1000).toBeCloseTo(1.5, 1); //  15 cm ≈ 1,5 L
    expect(potVolumeMl(20) / 1000).toBeCloseTo(3.6, 1); //  20 cm ≈ 3,6 L
  });
});

describe("waterQuantity", () => {
  it("gives a sip to succulents and more to thirsty plants, in a 15 cm pot", () => {
    expect(waterQuantity({ potDiameterCm: 15, waterNeed: "LOW" }).ml).toBe(175);
    expect(waterQuantity({ potDiameterCm: 15, waterNeed: "MEDIUM" }).ml).toBe(300);
    expect(waterQuantity({ potDiameterCm: 15, waterNeed: "HIGH" }).ml).toBe(425);
  });

  it("grows with the pot", () => {
    const small = waterQuantity({ potDiameterCm: 10, waterNeed: "MEDIUM" }).ml;
    const large = waterQuantity({ potDiameterCm: 25, waterNeed: "MEDIUM" }).ml;
    expect(small).toBe(90);
    expect(large).toBe(1400);
    expect(large).toBeGreaterThan(small);
  });

  it("assumes a default pot, and says so, when the diameter is unknown", () => {
    const fallback = waterQuantity({ waterNeed: "MEDIUM" });
    expect(fallback).toEqual({ ml: 300, estimated: true });
    expect(waterQuantity({ potDiameterCm: null, waterNeed: "MEDIUM" }).estimated).toBe(true);
    expect(waterQuantity({ potDiameterCm: 0, waterNeed: "MEDIUM" }).estimated).toBe(true);
    expect(DEFAULT_POT_DIAMETER_CM).toBe(15);
  });

  it("does not flag a known pot as estimated", () => {
    expect(waterQuantity({ potDiameterCm: 15, waterNeed: "LOW" }).estimated).toBe(false);
  });

  it("stays sensible for absurd diameters", () => {
    expect(waterQuantity({ potDiameterCm: 1, waterNeed: "LOW" }).ml).toBeGreaterThanOrEqual(20);
    expect(waterQuantity({ potDiameterCm: 500, waterNeed: "HIGH" }).ml).toBeLessThan(10000);
  });

  it("rounds to pourable values", () => {
    for (const diameter of [9, 11, 13, 17, 19, 22, 27, 33]) {
      const { ml } = waterQuantity({ potDiameterCm: diameter, waterNeed: "MEDIUM" });
      expect(ml % (ml < 100 ? 10 : ml < 500 ? 25 : 50)).toBe(0);
    }
  });
});

describe("formatQuantity", () => {
  it("uses ml below one litre and litres above", () => {
    expect(formatQuantity(300)).toBe("300 ml");
    expect(formatQuantity(975)).toBe("975 ml");
    expect(formatQuantity(1000)).toBe("1 L");
    expect(formatQuantity(1400)).toBe("1,4 L");
    expect(formatQuantity(2250)).toBe("2,25 L");
  });
});
