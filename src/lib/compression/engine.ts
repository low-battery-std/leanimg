import type { CompressionSettings, CompressionResult } from "./types";
import { detectImageFormat } from "@/lib/utils/file-helpers";

const IJG_LUMA_BASE_SUM = 3688; // sum of IJG standard luminance quantization table

const SMART_QUALITY: Record<string, number> = {
  jpeg: 80,
  png: 100,
  "png-lossy": 80,
  webp: 80,
  avif: 63,
};

function smartQuality(format: string): number {
  return SMART_QUALITY[format] ?? 80;
}

async function estimateJpegQuality(file: File): Promise<number | null> {
  if (!file.type.includes("jpeg")) return null;

  const buf = await file.slice(0, 65536).arrayBuffer();
  const d = new Uint8Array(buf);
  if (d.length < 2 || d[0] !== 0xff || d[1] !== 0xd8) return null;

  let off = 2;
  while (off + 4 < d.length) {
    if (d[off] !== 0xff) { off++; continue; }
    while (off < d.length && d[off] === 0xff) off++;
    if (off >= d.length) break;
    const marker = d[off++];
    if (marker === 0xda || marker === 0xd9) break;
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01 || marker === 0x00) continue;
    if (off + 1 >= d.length) break;
    const segLen = (d[off] << 8) | d[off + 1];

    if (marker === 0xdb) {
      let pos = off + 2;
      const segEnd = off + segLen;
      while (pos < segEnd) {
        const precision = d[pos] >> 4;
        const tableId = d[pos] & 0x0f;
        pos++;
        if (tableId === 0 && precision === 0 && pos + 64 <= d.length) {
          let sum = 0;
          for (let i = 0; i < 64; i++) sum += d[pos + i];
          const scale = (sum * 100) / IJG_LUMA_BASE_SUM;
          const q = scale > 100 ? 5000 / scale : (200 - scale) / 2;
          return Math.max(1, Math.min(100, Math.round(q)));
        }
        pos += precision === 0 ? 64 : 128;
      }
    }
    off += segLen;
  }
  return null;
}

async function decodeImage(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  bitmap.close();
  return imageData;
}

async function wasmEncode(
  imageData: ImageData,
  format: string,
  quality: number,
): Promise<Blob> {
  switch (format) {
    case "jpeg": {
      const { encode } = await import("@jsquash/jpeg");
      const buffer = await encode(imageData, { quality });
      return new Blob([buffer], { type: "image/jpeg" });
    }
    case "png": {
      const { encode } = await import("@jsquash/png");
      const pngBuffer = await encode(imageData);
      try {
        const { optimise } = await import("@jsquash/oxipng");
        const optimized = await optimise(pngBuffer as ArrayBuffer, {
          level: 3,
        });
        return new Blob([optimized], { type: "image/png" });
      } catch {
        return new Blob([pngBuffer], { type: "image/png" });
      }
    }
    case "png-lossy": {
      const { ImagequantImage, Imagequant } = await import("imagequant");
      const uint8 = new Uint8Array(imageData.data.buffer);
      const img = new ImagequantImage(uint8, imageData.width, imageData.height, 0);
      const instance = new Imagequant();
      instance.set_quality(0, quality);
      instance.set_speed(4);
      const quantized = instance.process(img);
      let pngBuffer: ArrayBuffer = quantized.buffer as ArrayBuffer;
      try {
        const { optimise } = await import("@jsquash/oxipng");
        pngBuffer = await optimise(pngBuffer, { level: 3 });
      } catch { /* use unoptimized quantized buffer */ }
      return new Blob([pngBuffer], { type: "image/png" });
    }
    case "webp": {
      const { encode } = await import("@jsquash/webp");
      const buffer = await encode(imageData, { quality });
      return new Blob([buffer], { type: "image/webp" });
    }
    case "avif": {
      const { encode } = await import("@jsquash/avif");
      const buffer = await encode(imageData, {
        quality,
        speed: 6,
        bitDepth: 8,
      });
      return new Blob([buffer], { type: "image/avif" });
    }
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

async function canvasEncode(
  imageData: ImageData,
  format: string,
  quality: number,
): Promise<Blob> {
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext("2d")!;
  ctx.putImageData(imageData, 0, 0);
  const mimeMap: Record<string, string> = {
    jpeg: "image/jpeg",
    png: "image/png",
    "png-lossy": "image/png",
    webp: "image/webp",
  };
  const mime = mimeMap[format] || "image/png";
  return canvas.convertToBlob({ type: mime, quality: quality / 100 });
}

export async function compressImage(
  file: File,
  settings: CompressionSettings,
): Promise<CompressionResult> {
  const imageData = await decodeImage(file);

  const format =
    settings.outputFormat === "auto"
      ? detectImageFormat(file.type)
      : settings.outputFormat;

  let quality =
    settings.mode === "smart" ? smartQuality(format) : settings.quality;

  if (format === "jpeg") {
    const origQ = await estimateJpegQuality(file);
    if (origQ !== null) {
      quality = Math.round(origQ * (settings.quality / 100));
    }
  }

  let blob: Blob;
  try {
    blob = await wasmEncode(imageData, format, quality);
  } catch {
    blob = await canvasEncode(imageData, format, quality);
  }

  const baseFormat = format === "png-lossy" ? "png" : format;

  // If "compression" made the file larger, return original
  if (blob.size >= file.size && baseFormat === detectImageFormat(file.type)) {
    blob = file;
  }

  return {
    blob,
    originalSize: file.size,
    compressedSize: blob.size,
    width: imageData.width,
    height: imageData.height,
    outputFormat: baseFormat,
    savings: ((file.size - blob.size) / file.size) * 100,
  };
}
