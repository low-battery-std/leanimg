import JSZip from "jszip";
import { trackEvent } from "@/lib/analytics";

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const sign = bytes < 0 ? "-" : "";
  const abs = Math.abs(bytes);
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(abs) / Math.log(k));
  return `${sign}${parseFloat((abs / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function detectImageFormat(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpeg",
    "image/jpg": "jpeg",
    "image/png": "png-lossy",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "gif",
  };
  return map[mimeType] || "jpeg";
}

export function downloadBlob(
  blob: Blob,
  filename: string,
  tool?: string,
): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  if (tool) {
    trackEvent("image_processed", { tool, count: 1 });
    trackEvent("total_images_processed", { count: 1 });
  }
}

export async function downloadAsZip(
  files: { name: string; blob: Blob }[],
  zipName = "compressed-images.zip",
  tool?: string,
): Promise<void> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.blob);
  }
  const content = await zip.generateAsync({ type: "blob" });
  downloadBlob(content, zipName);

  if (tool) {
    trackEvent("image_processed", { tool, count: files.length });
    trackEvent("total_images_processed", { count: files.length });
  }
}
