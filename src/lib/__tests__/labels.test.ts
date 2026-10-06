import { describe, expect, it } from "vitest";
import {
  HUMIDITY_LABEL,
  LEVEL_LABEL,
  LIGHT_LABEL,
  POT_MATERIAL_LABEL,
  WATER_NEED_LABEL,
  careSummary,
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
