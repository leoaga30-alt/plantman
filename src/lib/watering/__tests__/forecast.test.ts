import { describe, expect, it } from "vitest";
import { forecastWaterings, intervalOn, nextDue, type ScheduledPlant } from "../forecast";

// Neutral plant: 20 °C all year, medium light, plastic pot → interval = seasonal base.
const plant = (overrides: Partial<ScheduledPlant> = {}): ScheduledPlant => ({
  lastWateredAt: null,
  lastSkipAt: null,
  winterRest: false,
  intervalSpring: 7,
  intervalSummer: 7,
  intervalAutumn: 7,
  intervalWinter: 7,
  room: { tempSummer: 20, tempWinter: 20, light: "MEDIUM", humidity: "NORMAL", nearHeater: false },
  potMaterial: "PLASTIC",
  intervalAdjust: 1,
  ...overrides,
});

const TODAY = "2026-10-06";

describe("nextDue", () => {
  it("never watered → to check today", () => {
    expect(nextDue(plant(), TODAY)).toEqual({ due: TODAY, overdueDays: 0 });
  });

  it("last watering + interval", () => {
    const p = plant({ lastWateredAt: new Date("2026-10-04T10:00:00Z") });
    expect(nextDue(p, TODAY)).toEqual({ due: "2026-10-11", overdueDays: 0 });
  });

  it("reports overdue days", () => {
    const p = plant({ lastWateredAt: new Date("2026-09-20T10:00:00Z") });
    expect(nextDue(p, TODAY)).toEqual({ due: "2026-09-27", overdueDays: 9 });
  });

  it("a SKIP after the last watering → SKIP date + 2 days", () => {
    const p = plant({
      lastWateredAt: new Date("2026-09-20T10:00:00Z"),
      lastSkipAt: new Date("2026-10-06T08:00:00Z"),
    });
    expect(nextDue(p, TODAY)).toEqual({ due: "2026-10-08", overdueDays: 0 });
  });

  it("a SKIP older than the last watering is ignored", () => {
    const p = plant({
      lastWateredAt: new Date("2026-10-05T10:00:00Z"),
      lastSkipAt: new Date("2026-09-30T10:00:00Z"),
    });
    expect(nextDue(p, TODAY).due).toBe("2026-10-12");
  });

  it("a SKIP on a plant never watered defers the first check", () => {
    const p = plant({ lastSkipAt: new Date("2026-10-06T08:00:00Z") });
    expect(nextDue(p, TODAY).due).toBe("2026-10-08");
  });

  it("counts a late-evening watering for its Belgian day", () => {
    // 21:30 UTC on 4 Oct = 23:30 in Brussels → still the 4th
    const p = plant({ lastWateredAt: new Date("2026-10-04T21:30:00Z") });
    expect(nextDue(p, TODAY).due).toBe("2026-10-11");
    // 22:30 UTC on 4 Oct = 00:30 on the 5th in Brussels
    const q = plant({ lastWateredAt: new Date("2026-10-04T22:30:00Z") });
    expect(nextDue(q, TODAY).due).toBe("2026-10-12");
  });
});

describe("winter rest", () => {
  it("pushes a due date inside the rest to 1 March", () => {
    const p = plant({ winterRest: true, lastWateredAt: new Date("2026-11-30T10:00:00Z") });
    expect(nextDue(p, "2026-12-10").due).toBe("2027-03-01");
  });

  it("pushes a January date to 1 March of the same year", () => {
    const p = plant({ winterRest: true, lastWateredAt: new Date("2027-01-10T10:00:00Z") });
    expect(nextDue(p, "2027-01-20").due).toBe("2027-03-01");
  });

  it("does nothing for plants without winter rest", () => {
    const p = plant({ winterRest: false, lastWateredAt: new Date("2026-11-30T10:00:00Z") });
    expect(nextDue(p, "2026-12-10").due).toBe("2026-12-07");
  });
});

describe("forecastWaterings", () => {
  it("projects recurring dates over a month, spaced by the interval", () => {
    const p = plant({ lastWateredAt: new Date("2026-10-04T10:00:00Z") });
    const days = forecastWaterings(p, "2026-10-01", "2026-10-31", TODAY).map((e) => e.date);
    expect(days).toEqual(["2026-10-11", "2026-10-18", "2026-10-25"]);
  });

  it("shows an overdue plant today, then continues on schedule", () => {
    const p = plant({ lastWateredAt: new Date("2026-09-20T10:00:00Z") });
    const entries = forecastWaterings(p, "2026-10-01", "2026-10-20", TODAY);
    expect(entries[0]).toEqual({ date: TODAY, overdueDays: 9 });
    expect(entries.slice(1).map((e) => e.date)).toEqual(["2026-10-13", "2026-10-20"]);
    expect(entries.slice(1).every((e) => e.overdueDays === 0)).toBe(true);
  });

  it("starts today for a never-watered plant", () => {
    const entries = forecastWaterings(plant(), "2026-10-01", "2026-10-21", TODAY);
    expect(entries.map((e) => e.date)).toEqual(["2026-10-06", "2026-10-13", "2026-10-20"]);
  });

  it("only returns days inside the requested window", () => {
    const p = plant({ lastWateredAt: new Date("2026-10-04T10:00:00Z") });
    const days = forecastWaterings(p, "2026-10-15", "2026-10-31", TODAY).map((e) => e.date);
    expect(days).toEqual(["2026-10-18", "2026-10-25"]);
  });

  it("has no due date during the winter rest and resumes on 1 March", () => {
    const p = plant({ winterRest: true, lastWateredAt: new Date("2026-11-10T10:00:00Z") });
    const days = forecastWaterings(p, "2026-11-01", "2027-03-10", "2026-11-12").map((e) => e.date);
    // Due on 17 Nov, inside the rest → first date is 1 March, nothing before.
    expect(days[0]).toBe("2027-03-01");
    expect(days.filter((d) => d < "2027-03-01")).toEqual([]);
  });

  it("uses the room temperature of each season", () => {
    const warm = plant({ room: { tempSummer: 28, tempWinter: 12, light: "MEDIUM", humidity: "NORMAL", nearHeater: false } });
    // Hot in July → shorter interval than cold in January
    expect(intervalOn(warm, "2026-07-15")).toBeLessThan(intervalOn(warm, "2026-01-15"));
  });

  it("returns nothing when the first date is after the window", () => {
    const p = plant({ lastWateredAt: new Date("2026-10-04T10:00:00Z") });
    expect(forecastWaterings(p, "2026-10-01", "2026-10-10", TODAY)).toEqual([]);
  });
});
