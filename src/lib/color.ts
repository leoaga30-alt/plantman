// WCAG 2.x contrast helpers, used by the /design page to show real ratios instead of guesses.

function channel(value: number): number {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance of a "#rrggbb" color. */
export function luminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(clean)) throw new Error(`Invalid hex color: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(clean.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast ratio between two "#rrggbb" colors, from 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

export type WcagLevel = "AAA" | "AA" | "AA large" | "fail";

/** Level reached by normal-size text. */
export function wcagLevel(ratio: number): WcagLevel {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA large";
  return "fail";
}
