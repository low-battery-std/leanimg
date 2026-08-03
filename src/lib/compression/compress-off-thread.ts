import type { CompressionSettings, CompressionResult } from "./types";
import { compressImage } from "./engine";

let worker: Worker | null = null;
let idCounter = 0;

const workerUrl = /* webpackIgnore: false */ new URL(
  "./compression.worker.ts",
  import.meta.url,
);

function getWorker(): Worker | null {
  if (worker) return worker;
  try {
    worker = new Worker(workerUrl);
    return worker;
  } catch {
    return null;
  }
}

export async function compressImageOffThread(
  file: File,
  settings: CompressionSettings,
): Promise<CompressionResult> {
  const w = getWorker();
  if (!w) return compressImage(file, settings);

  const id = ++idCounter;

  return new Promise<CompressionResult>((resolve, reject) => {
    const cleanup = () => {
      w.removeEventListener("message", onMessage);
      w.removeEventListener("error", onError);
    };

    const onMessage = (e: MessageEvent) => {
      if (e.data.id !== id) return;
      cleanup();
      if (e.data.error) {
        reject(new Error(e.data.error));
      } else {
        resolve(e.data.result);
      }
    };

    const onError = () => {
      cleanup();
      worker?.terminate();
      worker = null;
      compressImage(file, settings).then(resolve, reject);
    };

    w.addEventListener("message", onMessage);
    w.addEventListener("error", onError);
    w.postMessage({ id, file, settings });
  });
}
