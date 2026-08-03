export type ResizeMode = "pixels" | "percentage" | "social";

export type FitMode = "cover" | "contain" | "stretch";

export interface ResizeSettings {
  mode: ResizeMode;
  width: number;
  height: number;
  percentage: number;
  maintainAspectRatio: boolean;
  doNotEnlarge: boolean;
  quality: number;
  fitMode: FitMode;
}

export interface ResizeResult {
  blob: Blob;
  originalWidth: number;
  originalHeight: number;
  newWidth: number;
  newHeight: number;
  originalSize: number;
  newSize: number;
  format: string;
}

export interface ResizeFileEntry {
  id: string;
  file: File;
  preview: string;
  naturalWidth: number;
  naturalHeight: number;
  status: "pending" | "resizing" | "done" | "error";
  result?: ResizeResult;
  error?: string;
}
