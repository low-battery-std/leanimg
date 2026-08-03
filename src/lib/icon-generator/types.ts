export interface IconGeneratorSettings {
  backgroundColor: string;
  margin: number;
  appName: string;
  shortName: string;
  themeColor: string;
  manifestBgColor: string;
}

export const DEFAULT_SETTINGS: IconGeneratorSettings = {
  backgroundColor: "#ffffff",
  margin: 0,
  appName: "",
  shortName: "",
  themeColor: "#ffffff",
  manifestBgColor: "#ffffff",
};

export interface IconOutput {
  name: string;
  size: number;
  blob: Blob;
}

export interface IconGeneratorResult {
  icons: IconOutput[];
  manifest: Blob;
  htmlSnippet: string;
}

export const ICON_SIZES = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
] as const;

export const ICO_SIZES = [16, 32, 48] as const;

export const HTML_SNIPPET = `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">`;
