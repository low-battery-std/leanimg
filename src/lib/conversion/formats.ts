import type { FormatInfo } from "./types";

export const formats: Record<string, FormatInfo> = {
  jpeg: {
    id: "jpeg",
    name: "JPG",
    extension: "jpg",
    mimeTypes: ["image/jpeg", "image/jpg"],
    supportsTransparency: false,
    supportsAnimation: false,
    canDecode: true,
    canEncode: true,
  },
  png: {
    id: "png",
    name: "PNG",
    extension: "png",
    mimeTypes: ["image/png"],
    supportsTransparency: true,
    supportsAnimation: false,
    canDecode: true,
    canEncode: true,
  },
  webp: {
    id: "webp",
    name: "WebP",
    extension: "webp",
    mimeTypes: ["image/webp"],
    supportsTransparency: true,
    supportsAnimation: true,
    canDecode: true,
    canEncode: true,
  },
  avif: {
    id: "avif",
    name: "AVIF",
    extension: "avif",
    mimeTypes: ["image/avif"],
    supportsTransparency: true,
    supportsAnimation: false,
    canDecode: true,
    canEncode: true,
  },
  gif: {
    id: "gif",
    name: "GIF",
    extension: "gif",
    mimeTypes: ["image/gif"],
    supportsTransparency: true,
    supportsAnimation: true,
    canDecode: true,
    canEncode: false,
  },
  heic: {
    id: "heic",
    name: "HEIC",
    extension: "heic",
    mimeTypes: ["image/heic", "image/heif"],
    supportsTransparency: false,
    supportsAnimation: false,
    canDecode: true,
    canEncode: false,
  },
  svg: {
    id: "svg",
    name: "SVG",
    extension: "svg",
    mimeTypes: ["image/svg+xml"],
    supportsTransparency: true,
    supportsAnimation: true,
    canDecode: true,
    canEncode: false,
  },
  pdf: {
    id: "pdf",
    name: "PDF",
    extension: "pdf",
    mimeTypes: ["application/pdf"],
    supportsTransparency: false,
    supportsAnimation: false,
    canDecode: false,
    canEncode: true,
  },
  tiff: {
    id: "tiff",
    name: "TIFF",
    extension: "tiff",
    mimeTypes: ["image/tiff"],
    supportsTransparency: true,
    supportsAnimation: false,
    canDecode: true,
    canEncode: false,
  },
  bmp: {
    id: "bmp",
    name: "BMP",
    extension: "bmp",
    mimeTypes: ["image/bmp"],
    supportsTransparency: false,
    supportsAnimation: false,
    canDecode: true,
    canEncode: false,
  },
  ico: {
    id: "ico",
    name: "ICO",
    extension: "ico",
    mimeTypes: ["image/x-icon", "image/vnd.microsoft.icon"],
    supportsTransparency: true,
    supportsAnimation: false,
    canDecode: true,
    canEncode: false,
  },
};

const mimeMap: Record<string, string> = {};
for (const fmt of Object.values(formats)) {
  for (const mime of fmt.mimeTypes) {
    mimeMap[mime] = fmt.id;
  }
}

export function mimeToFormat(mimeType: string): string {
  return mimeMap[mimeType] || "unknown";
}

export function getFormat(id: string): FormatInfo | undefined {
  return formats[id];
}

export function getEncodeFormats(): FormatInfo[] {
  return Object.values(formats).filter((f) => f.canEncode);
}
