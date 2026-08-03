import type { ConversionResult, ConversionSettings } from "./types";
import { mimeToFormat } from "./formats";

const DEFAULT_QUALITY: Record<string, number> = {
  jpeg: 85,
  webp: 80,
  avif: 50,
  png: 100,
};

async function bitmapToImageData(source: File | Blob): Promise<ImageData> {
  const bitmap = await createImageBitmap(source);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  bitmap.close();
  return imageData;
}

async function decodeHeic(file: File): Promise<ImageData> {
  const { heicTo } = await import("heic-to");
  const blob = await heicTo({ blob: file, type: "image/png" });
  return bitmapToImageData(blob);
}

async function decodeSvg(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file);
  let w = bitmap.width;
  let h = bitmap.height;

  if (!w || !h || (w <= 1 && h <= 1)) {
    bitmap.close();
    w = 1024;
    h = 1024;
    const reBitmap = await createImageBitmap(file, {
      resizeWidth: w,
      resizeHeight: h,
    });
    const canvas = new OffscreenCanvas(w * 2, h * 2);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(reBitmap, 0, 0, w * 2, h * 2);
    reBitmap.close();
    return ctx.getImageData(0, 0, w * 2, h * 2);
  }

  const scale = 2;
  const canvas = new OffscreenCanvas(w * scale, h * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w * scale, h * scale);
  bitmap.close();
  return ctx.getImageData(0, 0, w * scale, h * scale);
}

async function decodeTiff(file: File): Promise<ImageData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const UTIF = await import("utif") as any;
  const buffer = await file.arrayBuffer();
  const ifds = UTIF.decode(buffer);
  UTIF.decodeImage(buffer, ifds[0], ifds);
  const rgba = UTIF.toRGBA8(ifds[0]) as Uint8Array;
  const w = ifds[0].width as number;
  const h = ifds[0].height as number;
  return new ImageData(new Uint8ClampedArray(rgba), w, h);
}

async function decodeBmp(file: File): Promise<ImageData> {
  const { decode } = await import("fast-bmp");
  const buffer = await file.arrayBuffer();
  const bmpData = decode(buffer);

  const w = bmpData.width;
  const h = bmpData.height;
  const channels = bmpData.channels;
  const src = new Uint8Array(
    bmpData.data instanceof ArrayBuffer
      ? bmpData.data
      : (bmpData.data as { buffer: ArrayBuffer }).buffer,
  );

  if (channels === 4) {
    return new ImageData(new Uint8ClampedArray(src.buffer), w, h);
  }

  // Convert RGB to RGBA
  const rgba = new Uint8ClampedArray(w * h * 4);
  for (let i = 0, j = 0; i < src.length; i += channels, j += 4) {
    rgba[j] = src[i];
    rgba[j + 1] = src[i + 1];
    rgba[j + 2] = src[i + 2];
    rgba[j + 3] = 255;
  }
  return new ImageData(rgba, w, h);
}

async function decodeIco(file: File): Promise<ImageData> {
  const ICO = await import("icojs");
  const buffer = await file.arrayBuffer();
  const images = await ICO.default.parseICO(buffer);
  const largest = images.reduce((a, b) => (a.width > b.width ? a : b));
  const blob = new Blob([largest.buffer], { type: "image/png" });
  return bitmapToImageData(blob);
}

async function decode(file: File): Promise<ImageData> {
  const format = mimeToFormat(file.type);

  switch (format) {
    case "heic":
      return decodeHeic(file);
    case "svg":
      return decodeSvg(file);
    case "tiff":
      return decodeTiff(file);
    case "ico":
      return decodeIco(file);
  }

  try {
    return await bitmapToImageData(file);
  } catch {
    if (format === "avif") {
      const { decode: avifDecode } = await import("@jsquash/avif");
      const result = await avifDecode(await file.arrayBuffer());
      if (!result) throw new Error("Failed to decode AVIF");
      return result;
    }
    if (format === "bmp") {
      return decodeBmp(file);
    }
    throw new Error(`Cannot decode format: ${format || file.type}`);
  }
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
      throw new Error(`No encoder for format: ${format}`);
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
    webp: "image/webp",
  };
  const mime = mimeMap[format];
  if (!mime) throw new Error(`Canvas cannot encode: ${format}`);
  return canvas.convertToBlob({ type: mime, quality: quality / 100 });
}

async function encodePdf(file: File): Promise<ConversionResult> {
  const { jsPDF } = await import("jspdf");

  const bitmap = await createImageBitmap(file);
  const width = bitmap.width;
  const height = bitmap.height;
  bitmap.close();

  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

  const orientation = width > height ? "landscape" : "portrait";
  const doc = new jsPDF({ orientation, unit: "px", format: [width, height] });
  doc.addImage(dataUrl, 0, 0, width, height);
  const pdfBlob = doc.output("blob");

  return {
    blob: pdfBlob,
    originalSize: file.size,
    convertedSize: pdfBlob.size,
    width,
    height,
    outputFormat: "pdf",
  };
}

export async function convertImage(
  file: File,
  targetFormat: string,
  options?: ConversionSettings,
): Promise<ConversionResult> {
  if (targetFormat === "pdf") {
    return encodePdf(file);
  }

  const imageData = await decode(file);
  const quality = options?.quality ?? DEFAULT_QUALITY[targetFormat] ?? 80;

  let blob: Blob;
  try {
    blob = await wasmEncode(imageData, targetFormat, quality);
  } catch {
    blob = await canvasEncode(imageData, targetFormat, quality);
  }

  return {
    blob,
    originalSize: file.size,
    convertedSize: blob.size,
    width: imageData.width,
    height: imageData.height,
    outputFormat: targetFormat,
  };
}
