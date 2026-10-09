// Calendar days are handled as "YYYY-MM-DD" keys in the app's timezone (Europe/Brussels),
// so a watering at 23:30 Belgian time counts for that day, not the next one in UTC.

export const APP_TIMEZONE = "Europe/Brussels";

export type DayKey = string;

const DAY_MS = 24 * 60 * 60 * 1000;

const keyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Calendar day of an instant, in Belgian time. */
export function toDayKey(date: Date): DayKey {
  return keyFormatter.format(date);
}

export function todayKey(now: Date = new Date()): DayKey {
  return toDayKey(now);
}

/** Noon UTC of a day key: the same calendar date in every timezone from UTC-11 to UTC+11. */
export function dayKeyToDate(key: DayKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function addDays(key: DayKey, days: number): DayKey {
  return new Date(dayKeyToDate(key).getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

/** Number of days from `from` to `to` (negative when `to` is earlier). */
export function diffDays(from: DayKey, to: DayKey): number {
  return Math.round((dayKeyToDate(to).getTime() - dayKeyToDate(from).getTime()) / DAY_MS);
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(key: DayKey): number {
  return (dayKeyToDate(key).getUTCDay() + 6) % 7;
}

export function monthOf(key: DayKey): { year: number; month: number } {
  const [y, m] = key.split("-").map(Number);
  return { year: y, month: m };
}

export function shiftMonth(year: number, month: number, delta: number) {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** Monday-first weeks covering the whole month, including the leading/trailing days of neighbours. */
export function monthGrid(year: number, month: number): { from: DayKey; to: DayKey; weeks: DayKey[][] } {
  const first: DayKey = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const last: DayKey = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const from = addDays(first, -weekdayIndex(first));
  const to = addDays(last, 6 - weekdayIndex(last));

  const weeks: DayKey[][] = [];
  for (let start = from; start <= to; start = addDays(start, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(start, i)));
  }
  return { from, to, weeks };
}

const longDayFormatter = new Intl.DateTimeFormat("fr-BE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const monthFormatter = new Intl.DateTimeFormat("fr-BE", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "mardi 7 octobre" */
export function formatDayLong(key: DayKey): string {
  return longDayFormatter.format(dayKeyToDate(key));
}

/** "octobre 2026" */
export function formatMonth(year: number, month: number): string {
  return monthFormatter.format(new Date(Date.UTC(year, month - 1, 1, 12)));
}

const hourFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: APP_TIMEZONE,
  hour: "2-digit",
  hourCycle: "h23",
});

/** Hour of the day (0-23) in Belgian time. */
export function brusselsHour(now: Date = new Date()): number {
  return Number(hourFormatter.format(now));
}
