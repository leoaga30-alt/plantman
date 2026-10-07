// French labels for the enums stored in the database (UI is in French, data is not).

export const WATER_NEED_LABEL = {
  LOW: "faible",
  MEDIUM: "modéré",
  HIGH: "élevé",
} as const;

export const LIGHT_LABEL = {
  LOW: "faible",
  MEDIUM: "moyenne",
  BRIGHT: "vive",
  DIRECT_SUN: "soleil direct",
} as const;

export const HUMIDITY_LABEL = {
  DRY: "sèche",
  NORMAL: "normale",
  HUMID: "humide",
} as const;

export const POT_MATERIAL_LABEL = {
  PLASTIC: "plastique",
  TERRACOTTA: "terre cuite",
  GLAZED_CERAMIC: "céramique émaillée",
  OTHER: "autre",
} as const;

// Diagnostic confidence and urgency share the same three levels.
export const LEVEL_LABEL = {
  LOW: "faible",
  MEDIUM: "moyenne",
  HIGH: "élevée",
} as const;

/** Looks a value up in a label map; unknown values are returned as-is. */
export function label(map: Readonly<Record<string, string>>, value: string): string {
  return map[value] ?? value;
}

/** First sentence-ish excerpt of the care sheet summary, for list cards. */
export function careSummary(care: unknown): string | null {
  if (typeof care !== "object" || care === null) return null;
  const summary = (care as { summary?: unknown }).summary;
  return typeof summary === "string" && summary.trim() ? summary.trim() : null;
}

/** French decimal formatting: 22.586 → "22,6", 0.9 → "0,9" (trailing zeros dropped unless `fixed`). */
export function formatNumberFr(value: number, digits = 1, fixed = false): string {
  const text = value.toFixed(digits);
  const trimmed = fixed || !text.includes(".") ? text : text.replace(/\.?0+$/, "");
  return trimmed.replace(".", ",");
}
