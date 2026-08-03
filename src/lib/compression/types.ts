export type OutputFormat = "auto" | "jpeg" | "png" | "png-lossy" | "webp" | "avif";

export type CompressionMode = "smart" | "manual";

export interface CompressionSettings {
  mode: CompressionMode;
  quality: number;
  outputFormat: OutputFormat;
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  outputFormat: string;
  savings: number;
}

export interface FileEntry {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "compressing" | "done" | "error";
  result?: CompressionResult;
  error?: string;
}
