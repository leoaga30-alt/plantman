import { describe, expect, it } from "vitest";
import { calculateInterval } from "../interval";
import { isWinterRest, roomTemperature, seasonalInterval } from "../season";

const BASE = { spring: 10, summer: 6, autumn: 12, winter: 20 };

describe("seasonalInterval (anchors: 15 Jan, 15 Apr, 15 Jul, 15 Oct)", () => {
  it("returns the reference interval exactly on each anchor date", () => {
    expect(seasonalInterval(0, 15, BASE)).toBe(20); // 15 Jan = winter
    expect(seasonalInterval(3, 15, BASE)).toBe(10); // 15 Apr = spring
    expect(seasonalInterval(6, 15, BASE)).toBe(6); //  15 Jul = summer
    expect(seasonalInterval(9, 15, BASE)).toBe(12); // 15 Oct = autumn
  });

  it("interpolates linearly between anchors", () => {
    // 15 Apr (day 105) → 15 Jul (day 196): halfway is around 30 May
    const mid = seasonalInterval(4, 30, BASE);
    expect(mid).toBeGreaterThan(7.9);
    expect(mid).toBeLessThan(8.1);
  });

  it("wraps from autumn to winter around the new year without a jump", () => {
    const dec31 = seasonalInterval(11, 31, BASE);
    const jan1 = seasonalInterval(0, 1, BASE);
    expect(Math.abs(dec31 - jan1)).toBeLessThan(0.6);
    expect(dec31).toBeGreaterThan(12);
    expect(dec31).toBeLessThan(20);
  });

  it("flows through calculateInterval at the plan's reference cases", () => {
    const input = {
      intervalSpring: 10, intervalSummer: 7, intervalAutumn: 10, intervalWinter: 14,
      temperature: 20, light: "MEDIUM" as const, humidity: "NORMAL" as const,
      nearHeater: false, potMaterial: "PLASTIC" as const, intervalAdjust: 1,
      heatingSeasonStart: "10-15", heatingSeasonEnd: "04-15",
    };
    expect(calculateInterval({ ...input, date: new Date("2026-07-15T12:00:00Z") })).toBe(7);
    expect(calculateInterval({ ...input, date: new Date("2026-01-15T12:00:00Z") })).toBe(14);
  });
});

describe("roomTemperature", () => {
  it("is tempWinter on 15 Jan and tempSummer on 15 Jul", () => {
    expect(roomTemperature(0, 15, 12, 28)).toBe(12);
    expect(roomTemperature(6, 15, 12, 28)).toBe(28);
  });

  it("is in between on other days, and wraps over the new year", () => {
    const apr = roomTemperature(3, 15, 12, 28);
    expect(apr).toBeGreaterThan(12);
    expect(apr).toBeLessThan(28);
    const dec31 = roomTemperature(11, 31, 12, 28);
    const jan1 = roomTemperature(0, 1, 12, 28);
    expect(Math.abs(dec31 - jan1)).toBeLessThan(0.2);
  });
});

describe("isWinterRest (15 Nov → end of Feb)", () => {
  it("starts on 15 November", () => {
    expect(isWinterRest(10, 14)).toBe(false);
    expect(isWinterRest(10, 15)).toBe(true);
  });

  it("covers December, January and February, including 29 February", () => {
    expect(isWinterRest(11, 1)).toBe(true);
    expect(isWinterRest(0, 31)).toBe(true);
    expect(isWinterRest(1, 28)).toBe(true);
    expect(isWinterRest(1, 29)).toBe(true);
  });

  it("resumes on 1 March", () => {
    expect(isWinterRest(2, 1)).toBe(false);
    expect(isWinterRest(9, 31)).toBe(false);
  });
});
