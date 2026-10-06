import { describe, expect, it } from "vitest";
import { contrastRatio, luminance, wcagLevel } from "../color";

describe("contrastRatio", () => {
  it("matches the WCAG reference values", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
    // #767676 on white is the classic AA threshold (4.54:1)
    expect(contrastRatio("#767676", "#ffffff")).toBeCloseTo(4.54, 1);
  });

  it("does not depend on argument order", () => {
    expect(contrastRatio("#2d6a4f", "#ffffff")).toBe(contrastRatio("#ffffff", "#2d6a4f"));
  });

  it("rejects malformed colors", () => {
    expect(() => luminance("red")).toThrow();
    expect(() => luminance("#fff")).toThrow();
  });
});

describe("wcagLevel", () => {
  it("maps ratios to levels", () => {
    expect(wcagLevel(7.2)).toBe("AAA");
    expect(wcagLevel(4.5)).toBe("AA");
    expect(wcagLevel(3.2)).toBe("AA large");
    expect(wcagLevel(2.1)).toBe("fail");
  });
});
