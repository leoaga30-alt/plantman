import { PHOTO_MAX_EDGE, fitWithin, type PhotoExtension } from "@/lib/photos";

// Browser only: shrinks a photo to 1600 px max and ~200-300 KB before upload.
// WebP first; Safari cannot encode WebP from a canvas, so it falls back to JPEG.
export async function compressImage(
  file: File
): Promise<{ blob: Blob; ext: PhotoExtension }> {
  const url = URL.createObjectURL(file);
  try {
    // <img> decoding applies the EXIF orientation (phone photos stay upright).
    const img = new Image();
    img.src = url;
    await img.decode();

    const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, PHOTO_MAX_EDGE);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Impossible de traiter l'image");
    ctx.drawImage(img, 0, 0, width, height);

    const toBlob = (type: string, quality: number) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

    const webp = await toBlob("image/webp", 0.82);
    if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" };

    const jpeg = await toBlob("image/jpeg", 0.85);
    if (!jpeg) throw new Error("Impossible de compresser l'image");
    return { blob: jpeg, ext: "jpg" };
  } finally {
    URL.revokeObjectURL(url);
  }
}
