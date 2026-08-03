import type { CropSettings, CropResult } from "./types";

function mimeToExtension(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "gif",
  };
  return map[mime] ?? "jpg";
}

function outputMime(file: File): string {
  if (file.type === "image/gif") return "image/png";
  if (file.type === "image/avif") return "image/png";
  return file.type || "image/jpeg";
}

export async function cropImage(
  file: File,
  settings: CropSettings,
): Promise<CropResult> {
  const bitmap = await createImageBitmap(file);
  const { width: originalWidth, height: originalHeight } = bitmap;

  const { x, y, width, height } = settings.region;
  const sx = Math.round(Math.max(0, x));
  const sy = Math.round(Math.max(0, y));
  const sw = Math.round(Math.min(width, originalWidth - sx));
  const sh = Math.round(Math.min(height, originalHeight - sy));

  const mime = outputMime(file);
  const quality = mime === "image/png" ? undefined : settings.quality / 100;

  let blob: Blob;

  try {
    const canvas = new OffscreenCanvas(sw, sh);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);
    bitmap.close();
    blob = await canvas.convertToBlob({ type: mime, quality });
  } catch {
    const canvas = document.createElement("canvas");
    canvas.width = sw;
    canvas.height = sh;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);
    bitmap.close();
    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
        mime,
        quality,
      );
    });
  }

  return {
    blob,
    originalWidth,
    originalHeight,
    newWidth: sw,
    newHeight: sh,
    originalSize: file.size,
    newSize: blob.size,
    format: mimeToExtension(mime),
  };
}
