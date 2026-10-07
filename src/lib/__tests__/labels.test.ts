import { describe, expect, it } from "vitest";
import {
  HUMIDITY_LABEL,
  LEVEL_LABEL,
  LIGHT_LABEL,
  POT_MATERIAL_LABEL,
  WATER_NEED_LABEL,
  careSummary,
  formatNumberFr,
  label,
} from "../labels";

describe("labels", () => {
  it("covers every enum value of the Prisma schema", () => {
    expect(Object.keys(WATER_NEED_LABEL)).toEqual(["LOW", "MEDIUM", "HIGH"]);
    expect(Object.keys(LIGHT_LABEL)).toEqual(["LOW", "MEDIUM", "BRIGHT", "DIRECT_SUN"]);
    expect(Object.keys(HUMIDITY_LABEL)).toEqual(["DRY", "NORMAL", "HUMID"]);
    expect(Object.keys(POT_MATERIAL_LABEL)).toEqual([
      "PLASTIC",
      "TERRACOTTA",
      "GLAZED_CERAMIC",
      "OTHER",
    ]);
    expect(Object.keys(LEVEL_LABEL)).toEqual(["LOW", "MEDIUM", "HIGH"]);
  });

  it("never leaves a raw uppercase enum in a label", () => {
    for (const map of [WATER_NEED_LABEL, LIGHT_LABEL, HUMIDITY_LABEL, POT_MATERIAL_LABEL, LEVEL_LABEL]) {
      for (const text of Object.values(map)) expect(text).toBe(text.toLowerCase());
    }
  });

  it("falls back to the raw value for unknown keys", () => {
    expect(label(LIGHT_LABEL, "BRIGHT")).toBe("vive");
    expect(label(LIGHT_LABEL, "WHATEVER")).toBe("WHATEVER");
  });
});

describe("careSummary", () => {
  it("reads the summary of a care sheet", () => {
    expect(careSummary({ summary: "  Robuste.  " })).toBe("Robuste.");
  });

  it("returns null for anything else", () => {
    expect(careSummary(null)).toBeNull();
    expect(careSummary("texte")).toBeNull();
    expect(careSummary({ summary: "" })).toBeNull();
    expect(careSummary({ summary: 3 })).toBeNull();
  });
});

describe("formatNumberFr", () => {
  it("uses a decimal comma and drops useless zeros", () => {
    expect(formatNumberFr(22.586956521739133)).toBe("22,6");
    expect(formatNumberFr(20)).toBe("20");
    expect(formatNumberFr(0.9, 2)).toBe("0,9");
    expect(formatNumberFr(100, 0)).toBe("100");
  });

  it("keeps trailing zeros when asked", () => {
    expect(formatNumberFr(0.9, 2, true)).toBe("0,90");
    expect(formatNumberFr(1.1, 2, true)).toBe("1,10");
  });
});
