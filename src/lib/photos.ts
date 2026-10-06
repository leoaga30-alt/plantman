// Pure helpers for plant photos (no Prisma, no Next, no browser APIs).

export const PHOTO_MAX_EDGE = 1600;
export const PHOTO_EXTENSIONS = ["webp", "jpg"] as const;
export type PhotoExtension = (typeof PHOTO_EXTENSIONS)[number];

/** Scales (width, height) down so the longest edge is at most `max`; never upscales. */
export function fitWithin(
  width: number,
  height: number,
  max: number = PHOTO_MAX_EDGE
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const ratio = max / longest;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

export function photoPath(plantId: string, fileId: string, ext: PhotoExtension): string {
  return `plants/${plantId}/${fileId}.${ext}`;
}

/** A path is only valid if it belongs to this plant and has the expected shape. */
export function isValidPhotoPath(plantId: string, path: string): boolean {
  const escaped = plantId.replace(/[^a-zA-Z0-9]/g, "");
  if (escaped !== plantId) return false;
  return new RegExp(
    `^plants/${plantId}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(webp|jpg)$`
  ).test(path);
}
