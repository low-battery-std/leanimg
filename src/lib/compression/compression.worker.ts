import { compressImage } from "./engine";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = self as any;

ctx.onmessage = async (e: MessageEvent) => {
  const { id, file, settings } = e.data;
  try {
    const result = await compressImage(file, settings);
    ctx.postMessage({ id, result });
  } catch (err: unknown) {
    ctx.postMessage({
      id,
      error: err instanceof Error ? err.message : "Compression failed",
    });
  }
};
