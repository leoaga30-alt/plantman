import { describe, expect, it } from "vitest";
import { fitWithin, isValidPhotoPath, photoPath } from "../photos";

const ID = "cmuqrrwxd000eydwjy9kqyvno";
const UUID = "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b";

describe("fitWithin", () => {
  it("keeps small images untouched", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
    expect(fitWithin(1600, 1200)).toEqual({ width: 1600, height: 1200 });
  });

  it("scales landscape and portrait photos to 1600 on the longest edge", () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000)).toEqual({ width: 1200, height: 1600 });
  });

  it("keeps the aspect ratio and never returns 0", () => {
    expect(fitWithin(16000, 10)).toEqual({ width: 1600, height: 1 });
  });
});

describe("photo paths", () => {
  it("builds and accepts a path for the right plant", () => {
    const path = photoPath(ID, UUID, "webp");
    expect(path).toBe(`plants/${ID}/${UUID}.webp`);
    expect(isValidPhotoPath(ID, path)).toBe(true);
    expect(isValidPhotoPath(ID, photoPath(ID, UUID, "jpg"))).toBe(true);
  });

  it("rejects another plant's folder, traversal and odd extensions", () => {
    expect(isValidPhotoPath(ID, photoPath("autreplante", UUID, "webp"))).toBe(false);
    expect(isValidPhotoPath(ID, `plants/${ID}/../x/${UUID}.webp`)).toBe(false);
    expect(isValidPhotoPath(ID, `plants/${ID}/${UUID}.png`)).toBe(false);
    expect(isValidPhotoPath(ID, `plants/${ID}/nimporte-quoi.webp`)).toBe(false);
    expect(isValidPhotoPath("a/../b", `plants/a/../b/${UUID}.webp`)).toBe(false);
  });
});
