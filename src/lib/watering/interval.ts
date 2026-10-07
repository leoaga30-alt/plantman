import { nearestSeason, seasonalInterval } from "./season";
import { formatNumberFr } from "../labels";

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

export interface IntervalFactorExplanation {
  /** Short name: "Pièce à 22,6 °C" */
  label: string;
  /** Plain-French reason: "plus chaud que 20 °C : la terre sèche plus vite" */
  detail: string;
  factor: number;
  /** "faster" = the plant is watered more often because of this factor. */
  effect: "faster" | "slower";
  /** Size of the effect on the interval, in percent (10 for ×0,90 or ×1,10). */
  percent: number;
}

export interface IntervalExplanation {
  base: number;
  baseLabel: string;
  factors: IntervalFactorExplanation[];
  /** base × all factors, before rounding. */
  exact: number;
  final: number;
  /** "Arroser environ tous les 11 jours" */
  summary: string;
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

function factorExplanation(
  label: string,
  detail: string,
  factor: number
): IntervalFactorExplanation {
  return {
    label,
    detail,
    factor,
    effect: factor < 1 ? "faster" : "slower",
    percent: Math.round(Math.abs(1 - factor) * 100),
  };
}

function everyDays(days: number): string {
  return days === 1 ? "tous les jours" : `tous les ${days} jours`;
}

export function explainInterval(input: IntervalInput): IntervalExplanation {
  if (input.intervalOverride !== undefined) {
    return {
      base: input.intervalOverride,
      baseLabel: "Fréquence fixée manuellement pour cette plante",
      factors: [],
      exact: input.intervalOverride,
      final: input.intervalOverride,
      summary: `Arroser ${everyDays(input.intervalOverride)}`,
    };
  }

  const baseInterval = getSeasonalInterval(
    input.date,
    input.intervalSpring,
    input.intervalSummer,
    input.intervalAutumn,
    input.intervalWinter
  );
  const season = nearestSeason(input.date.getMonth(), input.date.getDate());

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

  const factors: IntervalFactorExplanation[] = [];
  const differs = (factor: number) => Math.abs(factor - 1.0) > 0.01;

  if (differs(tempFactor)) {
    factors.push(
      factorExplanation(
        `Pièce à ${formatNumberFr(input.temperature)} °C`,
        input.temperature > 20
          ? "plus chaud que 20 °C : la terre sèche plus vite"
          : "plus frais que 20 °C : la terre sèche plus lentement",
        tempFactor
      )
    );
  }

  if (differs(lightFactor)) {
    factors.push(
      factorExplanation(
        input.light === "LOW"
          ? "Lumière faible"
          : input.light === "BRIGHT"
            ? "Lumière vive"
            : "Soleil direct",
        input.light === "LOW"
          ? "peu de lumière : la plante boit moins"
          : input.light === "BRIGHT"
            ? "beaucoup de lumière : la terre sèche plus vite"
            : "plein soleil : la terre sèche beaucoup plus vite",
        lightFactor
      )
    );
  }

  if (differs(humidityFactor)) {
    factors.push(
      factorExplanation(
        input.humidity === "DRY" ? "Air sec" : "Air humide",
        input.humidity === "DRY"
          ? "air sec : la terre sèche plus vite"
          : "air humide : la terre sèche plus lentement",
        humidityFactor
      )
    );
  }

  if (heaterFactor < 1.0) {
    factors.push(
      factorExplanation(
        "Radiateur proche",
        "pendant la saison de chauffe, l'air est plus sec",
        heaterFactor
      )
    );
  }

  if (differs(materialFactor)) {
    factors.push(
      factorExplanation(
        "Pot en terre cuite",
        "la terre cuite laisse l'eau s'évaporer par les parois",
        materialFactor
      )
    );
  }

  if (differs(sizeFactor)) {
    const small = sizeFactor < 1;
    factors.push(
      factorExplanation(
        small ? "Petit pot" : "Grand pot",
        small
          ? "peu de terre : le pot se vide vite"
          : "beaucoup de terre : le pot garde l'eau plus longtemps",
        sizeFactor
      )
    );
  }

  if (differs(input.intervalAdjust)) {
    factors.push(
      factorExplanation(
        "Ajustement de la plante",
        "réglage propre à cette plante (par exemple après un diagnostic)",
        input.intervalAdjust
      )
    );
  }

  const final = calculateInterval(input);
  const exact = baseInterval * factors.reduce((product, f) => product * f.factor, 1);
  const base = Math.round(baseInterval);

  return {
    base,
    baseLabel: `Intervalle de référence de l'espèce en ce moment (${season}) : ${base} jours`,
    factors,
    exact,
    final,
    summary: `Arroser environ ${everyDays(final)}`,
  };
}
