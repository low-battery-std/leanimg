import {
  removeBackground as imglyRemoveBackground,
  preload,
  type Config,
} from "@imgly/background-removal";
import type { BgRemovalResult } from "./types";

export type ModelProgress = {
  status: string;
  file?: string;
  progress?: number;
  loaded?: number;
  total?: number;
};

// publicPath must be an absolute URL — the library resolves asset chunks via
// new URL(chunk, publicPath), which throws on relative paths. Built lazily
// because window only exists client-side (component is loaded with ssr: false).
function getConfig(): Config {
  return {
    publicPath: `${window.location.origin}/ml-assets/`,
    model: "isnet",
    device: "cpu",
    output: {
      format: "image/png",
      quality: 0.8,
    },
  };
}

let modelLoaded = false;

export async function loadModel(
  onProgress?: (p: ModelProgress) => void,
): Promise<void> {
  const config: Config = {
    ...getConfig(),
    progress: (key, current, total) => {
      onProgress?.({
        status: "progress",
        file: key,
        progress: total > 0 ? (current / total) * 100 : 0,
        loaded: current,
        total,
      });
    },
  };
  await preload(config);
  modelLoaded = true;
}

export function isModelLoaded(): boolean {
  return modelLoaded;
}

export async function removeBackground(
  file: File,
): Promise<BgRemovalResult> {
  const blob = await imglyRemoveBackground(file, getConfig());

  const bitmap = await createImageBitmap(blob);
  const { width, height } = bitmap;
  bitmap.close();

  return {
    blob,
    originalSize: file.size,
    newSize: blob.size,
    width,
    height,
  };
}
