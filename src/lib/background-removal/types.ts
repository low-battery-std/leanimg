export interface BgRemovalResult {
  blob: Blob;
  originalSize: number;
  newSize: number;
  width: number;
  height: number;
}

export interface BgRemovalFileEntry {
  id: string;
  file: File;
  preview: string;
  resultPreview?: string;
  status: "pending" | "processing" | "done" | "error";
  result?: BgRemovalResult;
  error?: string;
}
