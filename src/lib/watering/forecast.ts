import { addDays, dayKeyToDate, diffDays, toDayKey, type DayKey } from "../dates";
import {
  calculateInterval,
  type Humidity,
  type LightLevel,
  type PotMaterial,
} from "./interval";
import { isWinterRest, roomTemperature } from "./season";

// Schedule of one plant (plan §6.4, §6.8). Pure: days are "YYYY-MM-DD" keys in Belgian time.

export const SKIP_DELAY_DAYS = 2;

export interface ScheduledPlant {
  lastWateredAt: Date | null;
  /** Latest SKIP event ("sol encore humide"), if any. */
  lastSkipAt: Date | null;
  winterRest: boolean;
  intervalSpring: number;
  intervalSummer: number;
  intervalAutumn: number;
  intervalWinter: number;
  room: {
    tempSummer: number;
    tempWinter: number;
    light: LightLevel;
    humidity: Humidity;
    nearHeater: boolean;
  };
  potDiameterCm?: number;
  potMaterial: PotMaterial;
  intervalAdjust: number;
  intervalOverride?: number;
}

export interface HeatingSeason {
  start: string; // "MM-DD"
  end: string;
}

const DEFAULT_HEATING: HeatingSeason = { start: "10-15", end: "04-15" };

function monthAndDay(day: DayKey) {
  const [, month, date] = day.split("-").map(Number);
  return { month: month - 1, date };
}

/** Interval (days) the plant gets when watered on `day`, with the room temperature of that day. */
export function intervalOn(
  plant: ScheduledPlant,
  day: DayKey,
  heating: HeatingSeason = DEFAULT_HEATING
): number {
  const { month, date } = monthAndDay(day);
  return calculateInterval({
    intervalSpring: plant.intervalSpring,
    intervalSummer: plant.intervalSummer,
    intervalAutumn: plant.intervalAutumn,
    intervalWinter: plant.intervalWinter,
    temperature: roomTemperature(month, date, plant.room.tempWinter, plant.room.tempSummer),
    light: plant.room.light,
    humidity: plant.room.humidity,
    nearHeater: plant.room.nearHeater,
    potDiameterCm: plant.potDiameterCm,
    potMaterial: plant.potMaterial,
    intervalAdjust: plant.intervalAdjust,
    intervalOverride: plant.intervalOverride,
    date: dayKeyToDate(day),
    heatingSeasonStart: heating.start,
    heatingSeasonEnd: heating.end,
  });
}

/** A day inside the winter rest is pushed to 1 March ("à vérifier" that day). */
function afterWinterRest(plant: ScheduledPlant, day: DayKey): DayKey {
  if (!plant.winterRest) return day;
  const { month, date } = monthAndDay(day);
  if (!isWinterRest(month, date)) return day;

  const year = Number(day.slice(0, 4));
  // November and December rest ends next year; January and February this year.
  return `${month >= 10 ? year + 1 : year}-03-01`;
}

export interface NextDue {
  /** Day the plant is (or was) due. May be before today when overdue. */
  due: DayKey;
  overdueDays: number;
}

export function nextDue(
  plant: ScheduledPlant,
  today: DayKey,
  heating: HeatingSeason = DEFAULT_HEATING
): NextDue {
  const watered = plant.lastWateredAt ? toDayKey(plant.lastWateredAt) : null;
  const skipped = plant.lastSkipAt ? toDayKey(plant.lastSkipAt) : null;

  let due: DayKey;
  if (skipped && (!watered || skipped >= watered)) {
    due = addDays(skipped, SKIP_DELAY_DAYS);
  } else if (watered) {
    due = addDays(watered, intervalOn(plant, watered, heating));
  } else {
    due = today; // never watered: to check today
  }

  due = afterWinterRest(plant, due);
  return { due, overdueDays: Math.max(0, diffDays(due, today)) };
}

export interface ForecastEntry {
  date: DayKey;
  overdueDays: number;
}

/**
 * Watering days of a plant between `from` and `to` (inclusive).
 * An overdue plant is shown today; later days assume it is watered on schedule.
 */
export function forecastWaterings(
  plant: ScheduledPlant,
  from: DayKey,
  to: DayKey,
  today: DayKey,
  heating: HeatingSeason = DEFAULT_HEATING
): ForecastEntry[] {
  const first = nextDue(plant, today, heating);
  const entries: ForecastEntry[] = [];

  let date = first.due < today ? today : first.due;
  let overdueDays = first.overdueDays;

  // Hard cap: a 1-day interval over a 6-week grid is far below it.
  for (let guard = 0; date <= to && guard < 400; guard++) {
    if (date >= from) entries.push({ date, overdueDays });
    overdueDays = 0;
    date = afterWinterRest(plant, addDays(date, intervalOn(plant, date, heating)));
  }

  return entries;
}
