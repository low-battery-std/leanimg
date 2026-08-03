export interface UpscaleResult {
  blob: Blob;
  // Set for streamed (disk-backed) results: a downscaled image for display —
  // browsers cannot render a multi-hundred-megapixel blob in an <img>.
  previewBlob?: Blob;
  originalWidth: number;
  originalHeight: number;
  newWidth: number;
  newHeight: number;
  originalSize: number;
  newSize: number;
  scale: number;
}

export interface UpscaleFileEntry {
  id: string;
  file: File;
  preview: string;
  resultPreview?: string;
  status: "pending" | "processing" | "done" | "error";
  result?: UpscaleResult;
  error?: string;
  progress?: number;
}
