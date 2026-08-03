import type { ResizeSettings, ResizeResult, FitMode } from "./types";

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

interface DrawLayout {
  canvasW: number;
  canvasH: number;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  dx: number;
  dy: number;
  dw: number;
  dh: number;
}

/**
 * Computes both the canvas size and the source/destination rectangles
 * for drawImage based on the fit mode.
 *
 * - stretch: force exact target size (distorts if aspect ratios differ)
 * - cover:   scale to fill target, crop overflow from center
 * - contain: scale to fit inside target, output matches the fitted area (no padding)
 */
function computeLayout(
  origW: number,
  origH: number,
  targetW: number,
  targetH: number,
  fitMode: FitMode,
): DrawLayout {
  if (fitMode === "stretch") {
    return {
      canvasW: targetW,
      canvasH: targetH,
      sx: 0,
      sy: 0,
      sw: origW,
      sh: origH,
      dx: 0,
      dy: 0,
      dw: targetW,
      dh: targetH,
    };
  }

  if (fitMode === "cover") {
    // Scale image so it completely covers the target area, then center-crop
    const scale = Math.max(targetW / origW, targetH / origH);
    const scaledW = origW * scale;
    const scaledH = origH * scale;
    // Source crop rectangle (in original image coordinates)
    const cropW = targetW / scale;
    const cropH = targetH / scale;
    const sx = (origW - cropW) / 2;
    const sy = (origH - cropH) / 2;
    return {
      canvasW: targetW,
      canvasH: targetH,
      sx: Math.round(sx),
      sy: Math.round(sy),
      sw: Math.round(cropW),
      sh: Math.round(cropH),
      dx: 0,
      dy: 0,
      dw: targetW,
      dh: targetH,
    };
  }

  // contain: fit image inside target dimensions, shrink canvas to fitted size
  const scale = Math.min(targetW / origW, targetH / origH);
  const fitW = Math.max(1, Math.round(origW * scale));
  const fitH = Math.max(1, Math.round(origH * scale));
  return {
    canvasW: fitW,
    canvasH: fitH,
    sx: 0,
    sy: 0,
    sw: origW,
    sh: origH,
    dx: 0,
    dy: 0,
    dw: fitW,
    dh: fitH,
  };
}

function computeTargetDimensions(
  originalWidth: number,
  originalHeight: number,
  settings: ResizeSettings,
): { width: number; height: number } {
  if (settings.mode === "percentage") {
    const scale = settings.percentage / 100;
    return {
      width: Math.max(1, Math.round(originalWidth * scale)),
      height: Math.max(1, Math.round(originalHeight * scale)),
    };
  }

  let targetW = settings.width || originalWidth;
  let targetH = settings.height || originalHeight;

  if (settings.maintainAspectRatio) {
    const aspectRatio = originalWidth / originalHeight;
    if (settings.width && !settings.height) {
      targetH = Math.round(targetW / aspectRatio);
    } else if (settings.height && !settings.width) {
      targetW = Math.round(targetH * aspectRatio);
    } else {
      const scaleW = targetW / originalWidth;
      const scaleH = targetH / originalHeight;
      const scale = Math.min(scaleW, scaleH);
      targetW = Math.round(originalWidth * scale);
      targetH = Math.round(originalHeight * scale);
    }
  }

  if (settings.doNotEnlarge) {
    targetW = Math.min(targetW, originalWidth);
    targetH = Math.min(targetH, originalHeight);
  }

  return { width: Math.max(1, targetW), height: Math.max(1, targetH) };
}

/**
 * Returns true when the fit mode actually matters — i.e., the source and
 * target aspect ratios differ and both width + height are specified.
 */
function needsFitLayout(settings: ResizeSettings): boolean {
  if (settings.mode === "percentage") return false;
  if (settings.maintainAspectRatio) return false;
  return (
    settings.fitMode !== "stretch" &&
    settings.width > 0 &&
    settings.height > 0
  );
}

async function loadImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  bitmap.close();
  return { width, height };
}

export async function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return loadImageDimensions(file);
}

export async function resizeImage(
  file: File,
  settings: ResizeSettings,
): Promise<ResizeResult> {
  const { width: originalWidth, height: originalHeight } =
    await loadImageDimensions(file);

  const target = computeTargetDimensions(
    originalWidth,
    originalHeight,
    settings,
  );

  const mime = outputMime(file);
  const quality = mime === "image/png" ? undefined : settings.quality / 100;

  const useFitLayout = needsFitLayout(settings);
  const layout = useFitLayout
    ? computeLayout(
        originalWidth,
        originalHeight,
        target.width,
        target.height,
        settings.fitMode,
      )
    : null;

  const canvasW = layout?.canvasW ?? target.width;
  const canvasH = layout?.canvasH ?? target.height;

  let blob: Blob;

  try {
    const bitmap = layout
      ? await createImageBitmap(file) // full bitmap for source-crop
      : await createImageBitmap(file, {
          resizeWidth: target.width,
          resizeHeight: target.height,
          resizeQuality: "high",
        });

    const canvas = new OffscreenCanvas(canvasW, canvasH);
    const ctx = canvas.getContext("2d")!;

    if (layout) {
      ctx.drawImage(
        bitmap,
        layout.sx,
        layout.sy,
        layout.sw,
        layout.sh,
        layout.dx,
        layout.dy,
        layout.dw,
        layout.dh,
      );
    } else {
      ctx.drawImage(bitmap, 0, 0);
    }
    bitmap.close();

    blob = await canvas.convertToBlob({ type: mime, quality });
  } catch {
    // Fallback: standard Canvas (Safari, older browsers)
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (layout) {
      ctx.drawImage(
        bitmap,
        layout.sx,
        layout.sy,
        layout.sw,
        layout.sh,
        layout.dx,
        layout.dy,
        layout.dw,
        layout.dh,
      );
    } else {
      ctx.drawImage(bitmap, 0, 0, canvasW, canvasH);
    }
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
    newWidth: canvasW,
    newHeight: canvasH,
    originalSize: file.size,
    newSize: blob.size,
    format: mimeToExtension(mime),
  };
}
