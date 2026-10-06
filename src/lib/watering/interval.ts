import { seasonalInterval } from "./season";

export type LightLevel = "LOW" | "MEDIUM" | "BRIGHT" | "DIRECT_SUN";
export type Humidity = "DRY" | "NORMAL" | "HUMID";
export type PotMaterial = "PLASTIC" | "TERRACOTTA" | "GLAZED_CERAMIC" | "OTHER";

export interface IntervalInput {
  // Base intervals by season (days)
  intervalSpring: number;
  intervalSummer: number;
  intervalAutumn: number;
  intervalWinter: number;

  // Room conditions
  temperature: number; // °C
  light: LightLevel;
  humidity: Humidity;
  nearHeater: boolean;

  // Pot
  potDiameterCm?: number;
  potMaterial: PotMaterial;

  // Plant adjustment
  intervalAdjust: number; // 0.5-2, default 1.0

  // Manual override
  intervalOverride?: number;

  // Current date
  date: Date;

  // Heating season
  heatingSeasonStart: string; // "MM-DD"
  heatingSeasonEnd: string; // "MM-DD"
}

export interface IntervalExplanation {
  base: number;
  baseLabel: string;
  factors: {
    label: string;
    factor: number;
  }[];
  final: number;
}

function getSeasonalInterval(
  date: Date,
  spring: number,
  summer: number,
  autumn: number,
  winter: number
): number {
  return seasonalInterval(date.getMonth(), date.getDate(), {
    spring,
    summer,
    autumn,
    winter,
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isInHeatingseason(
  date: Date,
  heatingStart: string,
  heatingEnd: string
): boolean {
  const month = date.getMonth();
  const day = date.getDate();
  const currentDate = `${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const [startMonth, startDay] = heatingStart.split("-").map(Number);
  const [endMonth, endDay] = heatingEnd.split("-").map(Number);

  const startDateStr = `${String(startMonth).padStart(2, "0")}-${String(startDay).padStart(2, "0")}`;
  const endDateStr = `${String(endMonth).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

  if (startDateStr <= endDateStr) {
    return currentDate >= startDateStr && currentDate <= endDateStr;
  } else {
    return currentDate >= startDateStr || currentDate <= endDateStr;
  }
}

export function calculateInterval(input: IntervalInput): number {
  if (input.intervalOverride !== undefined) {
    return input.intervalOverride;
  }

  const baseInterval = getSeasonalInterval(
    input.date,
    input.intervalSpring,
    input.intervalSummer,
    input.intervalAutumn,
    input.intervalWinter
  );

  // Temperature factor: fT = clamp(1 - 0.04 * (T - 20), 0.7, 1.4)
  const tempFactor = clamp(1 - 0.04 * (input.temperature - 20), 0.7, 1.4);

  // Light factor
  const lightFactor =
    input.light === "LOW"
      ? 1.25
      : input.light === "MEDIUM"
        ? 1.0
        : input.light === "BRIGHT"
          ? 0.9
          : 0.8; // DIRECT_SUN

  // Humidity factor
  const humidityFactor =
    input.humidity === "DRY" ? 0.9 : input.humidity === "HUMID" ? 1.1 : 1.0;

  // Heater factor
  const heaterFactor =
    input.nearHeater && isInHeatingseason(input.date, input.heatingSeasonStart, input.heatingSeasonEnd)
      ? 0.9
      : 1.0;

  // Pot material factor
  const materialFactor =
    input.potMaterial === "TERRACOTTA" ? 0.85 : 1.0;

  // Pot size factor
  let sizeFactor = 1.0;
  if (input.potDiameterCm) {
    if (input.potDiameterCm < 12) sizeFactor = 0.85;
    else if (input.potDiameterCm > 25) sizeFactor = 1.15;
  }

  const product =
    tempFactor *
    lightFactor *
    humidityFactor *
    heaterFactor *
    materialFactor *
    sizeFactor *
    input.intervalAdjust;

  const final = Math.round(baseInterval * product);
  return clamp(final, 1, 60);
}

export function explainInterval(input: IntervalInput): IntervalExplanation {
  if (input.intervalOverride !== undefined) {
    return {
      base: input.intervalOverride,
      baseLabel: "Forçage manuel",
      factors: [],
      final: input.intervalOverride,
    };
  }

  const baseInterval = getSeasonalInterval(
    input.date,
    input.intervalSpring,
    input.intervalSummer,
    input.intervalAutumn,
    input.intervalWinter
  );

  const seasonName =
    input.date.getMonth() >= 2 && input.date.getMonth() < 5
      ? "printemps"
      : input.date.getMonth() >= 5 && input.date.getMonth() < 8
        ? "été"
        : input.date.getMonth() >= 8 && input.date.getMonth() < 11
          ? "automne"
          : "hiver";

  const tempFactor = clamp(1 - 0.04 * (input.temperature - 20), 0.7, 1.4);
  const lightFactor =
    input.light === "LOW"
      ? 1.25
      : input.light === "MEDIUM"
        ? 1.0
        : input.light === "BRIGHT"
          ? 0.9
          : 0.8;
  const humidityFactor =
    input.humidity === "DRY" ? 0.9 : input.humidity === "HUMID" ? 1.1 : 1.0;
  const heaterFactor =
    input.nearHeater && isInHeatingseason(input.date, input.heatingSeasonStart, input.heatingSeasonEnd)
      ? 0.9
      : 1.0;
  const materialFactor =
    input.potMaterial === "TERRACOTTA" ? 0.85 : 1.0;

  let sizeFactor = 1.0;
  if (input.potDiameterCm) {
    if (input.potDiameterCm < 12) sizeFactor = 0.85;
    else if (input.potDiameterCm > 25) sizeFactor = 1.15;
  }

  const factors = [];

  if (Math.abs(tempFactor - 1.0) > 0.01) {
    factors.push({
      label: `pièce à ${input.temperature}°C`,
      factor: tempFactor,
    });
  }

  if (Math.abs(lightFactor - 1.0) > 0.01) {
    const lightName =
      input.light === "LOW"
        ? "basse"
        : input.light === "BRIGHT"
          ? "vive"
          : input.light === "DIRECT_SUN"
            ? "soleil direct"
            : "moyenne";
    factors.push({ label: `lumière ${lightName}`, factor: lightFactor });
  }

  if (Math.abs(humidityFactor - 1.0) > 0.01) {
    const humidityName =
      input.humidity === "DRY"
        ? "sèche"
        : input.humidity === "HUMID"
          ? "humide"
          : "normale";
    factors.push({ label: `air ${humidityName}`, factor: humidityFactor });
  }

  if (heaterFactor < 1.0) {
    factors.push({ label: "radiateur proche", factor: heaterFactor });
  }

  if (Math.abs(materialFactor - 1.0) > 0.01) {
    factors.push({ label: "terre cuite", factor: materialFactor });
  }

  if (Math.abs(sizeFactor - 1.0) > 0.01) {
    const sizeDesc =
      input.potDiameterCm && input.potDiameterCm < 12
        ? "petit pot"
        : input.potDiameterCm && input.potDiameterCm > 25
          ? "grand pot"
          : "";
    if (sizeDesc) {
      factors.push({ label: sizeDesc, factor: sizeFactor });
    }
  }

  if (Math.abs(input.intervalAdjust - 1.0) > 0.01) {
    factors.push({ label: "ajustement", factor: input.intervalAdjust });
  }

  const final = calculateInterval(input);

  return {
    base: Math.round(baseInterval),
    baseLabel: `Base ${seasonName} ${Math.round(baseInterval)} j`,
    factors,
    final,
  };
}
