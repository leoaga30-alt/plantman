// Seasonal curves of the watering engine (plan §6.1, §6.2, §6.8). Pure: months are 0-11, no Date, no I/O.

const DAYS_BEFORE_MONTH = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const YEAR_LENGTH = 365;

/** Day of the year in a 365-day year (leap days are ignored, the curves do not need them). */
export function dayOfYear(month: number, day: number): number {
  return DAYS_BEFORE_MONTH[month] + day;
}

// Anchors: winter = 15 Jan, spring = 15 Apr, summer = 15 Jul, autumn = 15 Oct.
const WINTER = dayOfYear(0, 15);
const SPRING = dayOfYear(3, 15);
const SUMMER = dayOfYear(6, 15);
const AUTUMN = dayOfYear(9, 15);

function lerp(from: number, to: number, ratio: number): number {
  return from + (to - from) * ratio;
}

/** Linear interpolation between consecutive anchors, wrapping around the new year. */
function interpolate(
  doy: number,
  points: readonly (readonly [number, number])[]
): number {
  // Dates before 15 Jan belong to the autumn → winter segment of the previous year.
  const x = doy < points[0][0] ? doy + YEAR_LENGTH : doy;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (x >= x0 && x <= x1) return lerp(y0, y1, (x - x0) / (x1 - x0));
  }
  return points[points.length - 1][1];
}

/** Base watering interval (days) for a date, interpolated between the four seasonal references. */
export function seasonalInterval(
  month: number,
  day: number,
  base: { spring: number; summer: number; autumn: number; winter: number }
): number {
  return interpolate(dayOfYear(month, day), [
    [WINTER, base.winter],
    [SPRING, base.spring],
    [SUMMER, base.summer],
    [AUTUMN, base.autumn],
    [WINTER + YEAR_LENGTH, base.winter],
  ]);
}

/** Room temperature (°C) for a date: tempWinter on 15 Jan, tempSummer on 15 Jul, linear in between. */
export function roomTemperature(
  month: number,
  day: number,
  tempWinter: number,
  tempSummer: number
): number {
  return interpolate(dayOfYear(month, day), [
    [WINTER, tempWinter],
    [SUMMER, tempSummer],
    [WINTER + YEAR_LENGTH, tempWinter],
  ]);
}

/** Winter rest: no watering from 15 November to the end of February; watering resumes on 1 March. */
export function isWinterRest(month: number, day: number): boolean {
  const NOVEMBER = 10;
  if (month === NOVEMBER) return day >= 15;
  return month === 11 || month === 0 || month === 1; // Dec, Jan, Feb
}

export type SeasonName = "hiver" | "printemps" | "été" | "automne";

/** Season whose anchor date (15 Jan / 15 Apr / 15 Jul / 15 Oct) is the closest to the given day. */
export function nearestSeason(month: number, day: number): SeasonName {
  const doy = dayOfYear(month, day);
  const anchors: [SeasonName, number][] = [
    ["hiver", WINTER],
    ["printemps", SPRING],
    ["été", SUMMER],
    ["automne", AUTUMN],
  ];

  let best = anchors[0];
  let bestDistance = Infinity;
  for (const anchor of anchors) {
    const gap = Math.abs(doy - anchor[1]);
    const distance = Math.min(gap, YEAR_LENGTH - gap); // winter wraps around the new year
    if (distance < bestDistance) {
      best = anchor;
      bestDistance = distance;
    }
  }
  return best[0];
}
