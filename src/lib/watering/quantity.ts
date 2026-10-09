import { formatNumberFr } from "../labels";

// How much water to give at each watering. The database stores no quantity, so it is estimated
// from the pot size and the species' water need. Pure: no Date, no I/O.

export type WaterNeed = "LOW" | "MEDIUM" | "HIGH";

/** Used when the pot diameter is unknown. */
export const DEFAULT_POT_DIAMETER_CM = 15;

// Share of the pot volume given at each watering: a succulent gets a sip, a thirsty plant a soak.
const SHARE_OF_POT: Record<WaterNeed, number> = {
  LOW: 0.12,
  MEDIUM: 0.2,
  HIGH: 0.28,
};

/** Rough volume (ml) of a standard tapered pot from its top diameter: 15 cm ≈ 1,5 L, 20 cm ≈ 3,6 L. */
export function potVolumeMl(diameterCm: number): number {
  return 0.45 * diameterCm ** 3;
}

/** Quantities are advice, not measurements: round to a value a person can pour. */
function roundForPouring(ml: number): number {
  if (ml < 100) return Math.max(20, Math.round(ml / 10) * 10);
  if (ml < 500) return Math.round(ml / 25) * 25;
  return Math.round(ml / 50) * 50;
}

export interface WaterQuantity {
  ml: number;
  /** True when the pot diameter was unknown and the default size was assumed. */
  estimated: boolean;
}

export function waterQuantity(input: {
  potDiameterCm?: number | null;
  waterNeed: WaterNeed;
}): WaterQuantity {
  const known = typeof input.potDiameterCm === "number" && input.potDiameterCm > 0;
  const diameter = known
    ? Math.min(40, Math.max(5, input.potDiameterCm as number))
    : DEFAULT_POT_DIAMETER_CM;

  return {
    ml: roundForPouring(potVolumeMl(diameter) * SHARE_OF_POT[input.waterNeed]),
    estimated: !known,
  };
}

/** "300 ml", "1,4 L" */
export function formatQuantity(ml: number): string {
  return ml >= 1000 ? `${formatNumberFr(ml / 1000, 2)} L` : `${ml} ml`;
}
