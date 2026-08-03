export interface FormatInfo {
  id: string;
  name: string;
  extension: string;
  mimeTypes: string[];
  supportsTransparency: boolean;
  supportsAnimation: boolean;
  canDecode: boolean;
  canEncode: boolean;
}

export interface ConversionResult {
  blob: Blob;
  originalSize: number;
  convertedSize: number;
  width: number;
  height: number;
  outputFormat: string;
}

export interface ConversionSettings {
  quality?: number;
}

export interface ConversionFileEntry {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "converting" | "done" | "error";
  result?: ConversionResult;
  error?: string;
}

export interface ConversionPair {
  sourceFormat: string;
  targetFormat: string;
  slug: string;
  h1: string;
  whyConvert: string;
  comparison: { label: string; source: string; target: string }[];
  faq: { question: string; answer: string }[];
  crossLinks: { text: string; href: string }[];
}
