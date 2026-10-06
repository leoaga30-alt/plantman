import { describe, expect, it } from "vitest";
import {
  addDays,
  dayKeyToDate,
  diffDays,
  formatDayLong,
  formatMonth,
  monthGrid,
  shiftMonth,
  toDayKey,
  weekdayIndex,
} from "../dates";

describe("toDayKey (Europe/Brussels)", () => {
  it("counts 23:30 Belgian time for that day, not the next one in UTC", () => {
    // 2026-07-14 21:30 UTC = 23:30 in Brussels (UTC+2 in summer)
    expect(toDayKey(new Date("2026-07-14T21:30:00Z"))).toBe("2026-07-14");
    // 2026-07-14 22:30 UTC = 00:30 on the 15th in Brussels
    expect(toDayKey(new Date("2026-07-14T22:30:00Z"))).toBe("2026-07-15");
  });

  it("handles winter time (UTC+1)", () => {
    expect(toDayKey(new Date("2026-01-14T22:30:00Z"))).toBe("2026-01-14");
    expect(toDayKey(new Date("2026-01-14T23:30:00Z"))).toBe("2026-01-15");
  });
});

describe("day arithmetic", () => {
  it("adds days across month, year and leap boundaries", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("is not thrown off by daylight saving changes", () => {
    expect(addDays("2026-03-28", 1)).toBe("2026-03-29");
    expect(addDays("2026-03-29", 1)).toBe("2026-03-30");
    expect(diffDays("2026-03-28", "2026-03-30")).toBe(2);
    expect(diffDays("2026-10-24", "2026-10-26")).toBe(2);
  });

  it("diffs both ways", () => {
    expect(diffDays("2026-10-06", "2026-10-13")).toBe(7);
    expect(diffDays("2026-10-13", "2026-10-06")).toBe(-7);
  });

  it("numbers weekdays from Monday", () => {
    expect(weekdayIndex("2026-10-05")).toBe(0); // Monday
    expect(weekdayIndex("2026-10-11")).toBe(6); // Sunday
  });

  it("keeps the calendar date at noon UTC", () => {
    expect(dayKeyToDate("2026-10-06").toISOString()).toBe("2026-10-06T12:00:00.000Z");
  });
});

describe("monthGrid", () => {
  it("covers October 2026 with Monday-first full weeks", () => {
    const { from, to, weeks } = monthGrid(2026, 10);
    expect(from).toBe("2026-09-28"); // Oct 1st 2026 is a Thursday
    expect(to).toBe("2026-11-01");
    expect(weeks).toHaveLength(5);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    expect(weeks[0][0]).toBe("2026-09-28");
    expect(weeks[4][6]).toBe("2026-11-01");
  });

  it("needs 6 rows when the month starts late in the week", () => {
    expect(monthGrid(2026, 8).weeks).toHaveLength(6); // Aug 1st 2026 is a Saturday
  });

  it("does not add a leading week when the month starts on a Monday", () => {
    const { from, weeks } = monthGrid(2025, 9); // Sep 1st 2025 is a Monday
    expect(from).toBe("2025-09-01");
    expect(weeks[0][0]).toBe("2025-09-01");
  });

  it("handles February in a leap year", () => {
    const { weeks } = monthGrid(2028, 2);
    expect(weeks.flat()).toContain("2028-02-29");
  });
});

describe("shiftMonth", () => {
  it("rolls over years in both directions", () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth(2026, 10, 0)).toEqual({ year: 2026, month: 10 });
  });
});

describe("French formatting", () => {
  it("formats days and months", () => {
    expect(formatDayLong("2026-10-06")).toBe("mardi 6 octobre");
    expect(formatMonth(2026, 10)).toBe("octobre 2026");
  });
});
