import { describe, expect, it } from "vitest";
import { NAV_ITEMS, isActive } from "./nav-items";

describe("isActive", () => {
  it("matches the home page only on /", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/plantes", "/")).toBe(false);
  });

  it("matches a section and its sub-pages", () => {
    expect(isActive("/plantes", "/plantes")).toBe(true);
    expect(isActive("/plantes/new", "/plantes")).toBe(true);
    expect(isActive("/plantes/cmuqrrwxd000e", "/plantes")).toBe(true);
  });

  it("does not confuse sections sharing a prefix", () => {
    expect(isActive("/planning", "/plantes")).toBe(false);
    expect(isActive("/plantes", "/planning")).toBe(false);
  });

  it("activates exactly one entry per page", () => {
    for (const path of ["/", "/planning", "/plantes/abc", "/pieces/new", "/especes", "/diagnostic"]) {
      expect(NAV_ITEMS.filter((i) => isActive(path, i.href))).toHaveLength(1);
    }
  });
});
