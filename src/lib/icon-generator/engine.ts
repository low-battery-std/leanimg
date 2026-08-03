import type {
  IconGeneratorSettings,
  IconGeneratorResult,
  IconOutput,
} from "./types";
import { ICON_SIZES, ICO_SIZES, HTML_SNIPPET } from "./types";
import { encodeIcoBlob } from "ico-codec";

function renderIcon(
  source: ImageBitmap,
  size: number,
  settings: IconGeneratorSettings,
): OffscreenCanvas {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = settings.backgroundColor;
  ctx.fillRect(0, 0, size, size);

  const margin = Math.round(size * (settings.margin / 100));
  const drawSize = size - margin * 2;
  if (drawSize > 0) {
    ctx.drawImage(source, margin, margin, drawSize, drawSize);
  }

  return canvas;
}

async function canvasToPngBlob(canvas: OffscreenCanvas): Promise<Blob> {
  return canvas.convertToBlob({ type: "image/png" });
}

async function canvasToPngBuffer(canvas: OffscreenCanvas): Promise<ArrayBuffer> {
  const blob = await canvasToPngBlob(canvas);
  return blob.arrayBuffer();
}

function buildManifest(settings: IconGeneratorSettings): Blob {
  const manifest = {
    name: settings.appName,
    short_name: settings.shortName,
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: settings.themeColor,
    background_color: settings.manifestBgColor,
    display: "standalone",
  };
  return new Blob([JSON.stringify(manifest, null, 2)], {
    type: "application/json",
  });
}

async function loadImage(file: File): Promise<ImageBitmap> {
  if (file.type === "image/svg+xml") {
    const text = await file.text();
    const svgBlob = new Blob([text], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load SVG"));
        img.src = url;
      });
      const size = Math.max(img.naturalWidth, img.naturalHeight, 512);
      const canvas = new OffscreenCanvas(size, size);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      return createImageBitmap(canvas);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  return createImageBitmap(file);
}

export async function generatePreview(
  file: File,
  size: number,
  settings: IconGeneratorSettings,
): Promise<Blob> {
  const source = await loadImage(file);
  const canvas = renderIcon(source, size, settings);
  source.close();
  return canvasToPngBlob(canvas);
}

export async function generateIcons(
  file: File,
  settings: IconGeneratorSettings,
): Promise<IconGeneratorResult> {
  const source = await loadImage(file);

  const icons: IconOutput[] = [];

  for (const { name, size } of ICON_SIZES) {
    const canvas = renderIcon(source, size, settings);
    const blob = await canvasToPngBlob(canvas);
    icons.push({ name, size, blob });
  }

  const icoPngs: { size: number; data: ArrayBuffer }[] = [];
  for (const size of ICO_SIZES) {
    const canvas = renderIcon(source, size, settings);
    const data = await canvasToPngBuffer(canvas);
    icoPngs.push({ size, data });
  }
  const icoBlob = encodeIcoBlob(icoPngs);
  icons.unshift({ name: "favicon.ico", size: 0, blob: icoBlob });

  source.close();

  const manifest = buildManifest(settings);

  return { icons, manifest, htmlSnippet: HTML_SNIPPET };
}
