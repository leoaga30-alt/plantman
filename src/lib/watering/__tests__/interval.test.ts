import { describe, it, expect } from "vitest";
import { calculateInterval } from "../interval";

describe("watering interval", () => {
  it("should calculate Monstera interval in summer at 24°C with bright light", () => {
    // Monstera: base summer 7 days
    // At 24°C: fT = clamp(1 - 0.04 * (24 - 20), 0.7, 1.4) = 0.84
    // Bright light: 0.9
    // Plastic pot 25cm: 1.15
    // 7 * 0.84 * 0.9 * 1.15 ≈ 6.15 → 6 days
    const interval = calculateInterval({
      intervalSpring: 7,
      intervalSummer: 7,
      intervalAutumn: 7,
      intervalWinter: 14,
      temperature: 24,
      light: "BRIGHT",
      humidity: "NORMAL",
      nearHeater: false,
      potDiameterCm: 25,
      potMaterial: "PLASTIC",
      intervalAdjust: 1.0,
      date: new Date(2026, 6, 15), // July 15 = summer
      heatingSeasonStart: "10-15",
      heatingSeasonEnd: "04-15",
    });

    expect(interval).toBeGreaterThanOrEqual(5);
    expect(interval).toBeLessThanOrEqual(7);
  });

  it("should calculate Monstera interval in winter at 20°C with radiator", () => {
    // Monstera: base winter 14 days
    // At 20°C: fT = 1.0
    // Medium light: 1.0
    // Radiator nearby in heating season: 0.9
    // 14 * 1.0 * 1.0 * 0.9 = 12.6 → 13 days
    const interval = calculateInterval({
      intervalSpring: 7,
      intervalSummer: 7,
      intervalAutumn: 7,
      intervalWinter: 14,
      temperature: 20,
      light: "MEDIUM",
      humidity: "NORMAL",
      nearHeater: true,
      potDiameterCm: 25,
      potMaterial: "PLASTIC",
      intervalAdjust: 1.0,
      date: new Date(2026, 0, 15), // Jan 15 = winter, in heating season
      heatingSeasonStart: "10-15",
      heatingSeasonEnd: "04-15",
    });

    expect(interval).toBeGreaterThanOrEqual(11);
    expect(interval).toBeLessThanOrEqual(14);
  });

  it("should respect intervalOverride", () => {
    const interval = calculateInterval({
      intervalSpring: 7,
      intervalSummer: 7,
      intervalAutumn: 7,
      intervalWinter: 14,
      temperature: 20,
      light: "MEDIUM",
      humidity: "NORMAL",
      nearHeater: false,
      potMaterial: "PLASTIC",
      intervalAdjust: 1.0,
      intervalOverride: 21,
      date: new Date(2026, 6, 15),
      heatingSeasonStart: "10-15",
      heatingSeasonEnd: "04-15",
    });

    expect(interval).toBe(21);
  });

  it("should clamp interval to 1-60 days", () => {
    // Very dry, low light, large pot = very low interval
    const low = calculateInterval({
      intervalSpring: 1,
      intervalSummer: 1,
      intervalAutumn: 1,
      intervalWinter: 1,
      temperature: 10, // very cold
      light: "LOW",
      humidity: "DRY",
      nearHeater: false,
      potDiameterCm: 50, // large
      potMaterial: "PLASTIC",
      intervalAdjust: 0.5,
      date: new Date(2026, 6, 15),
      heatingSeasonStart: "10-15",
      heatingSeasonEnd: "04-15",
    });

    expect(low).toBeGreaterThanOrEqual(1);

    // Very warm, bright light, small pot = high interval
    const high = calculateInterval({
      intervalSpring: 60,
      intervalSummer: 60,
      intervalAutumn: 60,
      intervalWinter: 60,
      temperature: 35,
      light: "DIRECT_SUN",
      humidity: "HUMID",
      nearHeater: false,
      potDiameterCm: 10,
      potMaterial: "PLASTIC",
      intervalAdjust: 2.0,
      date: new Date(2026, 6, 15),
      heatingSeasonStart: "10-15",
      heatingSeasonEnd: "04-15",
    });

    expect(high).toBeLessThanOrEqual(60);
  });

  it("should account for terracotta pot material", () => {
    const plastic = calculateInterval({
      intervalSpring: 10,
      intervalSummer: 10,
      intervalAutumn: 10,
      intervalWinter: 10,
      temperature: 20,
      light: "MEDIUM",
      humidity: "NORMAL",
      nearHeater: false,
      potDiameterCm: 20,
      potMaterial: "PLASTIC",
      intervalAdjust: 1.0,
      date: new Date(2026, 6, 15),
      heatingSeasonStart: "10-15",
      heatingSeasonEnd: "04-15",
    });

    const terracotta = calculateInterval({
      intervalSpring: 10,
      intervalSummer: 10,
      intervalAutumn: 10,
      intervalWinter: 10,
      temperature: 20,
      light: "MEDIUM",
      humidity: "NORMAL",
      nearHeater: false,
      potDiameterCm: 20,
      potMaterial: "TERRACOTTA",
      intervalAdjust: 1.0,
      date: new Date(2026, 6, 15),
      heatingSeasonStart: "10-15",
      heatingSeasonEnd: "04-15",
    });

    expect(terracotta).toBeLessThan(plastic);
  });
});
