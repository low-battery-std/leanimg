export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropSettings {
  region: CropRegion;
  quality: number;
}

export interface CropResult {
  blob: Blob;
  originalWidth: number;
  originalHeight: number;
  newWidth: number;
  newHeight: number;
  originalSize: number;
  newSize: number;
  format: string;
}

export interface CropFileEntry {
  id: string;
  file: File;
  preview: string;
  naturalWidth: number;
  naturalHeight: number;
  status: "pending" | "cropping" | "done" | "error";
  result?: CropResult;
  error?: string;
  cropRegion?: CropRegion;
}
