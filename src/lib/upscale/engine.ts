import * as ort from "onnxruntime-web";
import type { UpscaleResult } from "./types";
import {
  StreamingPngEncoder,
  streamingSupported,
  cleanupStaleStreamFiles,
} from "./png-stream";

export type UpscaleProgress = {
  phase: "model" | "processing";
  progress: number; // 0-100
  loaded?: number;
  total?: number;
};

export type ExecutionProvider = "webgpu" | "wasm";

export class UpscaleLimitError extends Error {
  constructor(
    public code: "outputTooLarge" | "wasmInputTooLarge",
    public maxSide: number,
  ) {
    super(code);
    this.name = "UpscaleLimitError";
  }
}

// Both paths are versioned because /ml-assets/* is served immutable for a
// year: the .v1 model suffix and the ORT version dir must change together
// with any model re-export or onnxruntime-web upgrade (ORT_VERSION must
// match the package.json dependency), or returning visitors keep stale
// incompatible binaries cached.
const MODEL_URL = "/ml-assets/upscale/realesr-general-x4v3.v1.onnx";
// Must stay in lockstep with @imgly/background-removal's onnxruntime-web
// peer dependency — one hoisted ORT copy serves both tools, and a mismatch
// between the bundled JS and these wasm binaries breaks session creation.
const ORT_VERSION = "1.21.0";
const ORT_WASM_DIR = `/ml-assets/upscale/ort/${ORT_VERSION}/`;
// The model always produces 4x; 2x output is downscaled per tile so the full
// 4x image is never materialized.
const MODEL_SCALE = 4;
const TILE = 256;
const OVERLAP = 16;
const CORE = TILE - 2 * OVERLAP;

// Canvas-path ceiling: the assembled RGBA buffer is 4 bytes/px, and a
// ~106MP canvas run was observed to kill the renderer on a well-equipped
// desktop — 64MP (256MB) is the proven bound. Larger outputs stream to OPFS
// band-by-band instead of ever materializing.
const MAX_CANVAS_PX_DESKTOP = 64_000_000;
const MAX_CANVAS_PX_MOBILE = 16_000_000;
// Streaming keeps OUTPUT memory flat, so its ceiling is processing-time
// sanity, not RAM.
const MAX_STREAM_OUTPUT_PX = 512_000_000;
// But the INPUT is still flattened onto one canvas + one getImageData copy —
// that side must stay within the empirically safe single-canvas bound, or a
// 2x job crashes at the flatten step before the encoder ever starts.
const MAX_INPUT_PX_STREAM = 64_000_000;
// Single-threaded WASM (no COOP/COEP because of ads) runs minutes-per-megapixel.
const MAX_INPUT_PX_WASM = 1_100_000;
// Per-dimension ceiling (Firefox caps canvases at 32767px/side; band and
// preview canvases in the streaming path are outW wide).
const MAX_OUTPUT_SIDE = 32_000;

const PREVIEW_MAX_W = 1600;

let session: ort.InferenceSession | null = null;
let activeEp: ExecutionProvider | null = null;
let loadPromise: Promise<void> | null = null;

function isMobile(): boolean {
  // iPadOS 13+ reports a Macintosh UA; touch points give it away.
  return (
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (/Mac/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
  );
}

function canvasCeiling(): number {
  return isMobile() ? MAX_CANVAS_PX_MOBILE : MAX_CANVAS_PX_DESKTOP;
}

function streamingEligible(): boolean {
  // WASM inference is far too slow for outputs beyond the canvas ceiling
  // anyway, so streaming is a WebGPU-desktop feature.
  return !isMobile() && activeEp === "webgpu" && streamingSupported();
}

export function getActiveEp(): ExecutionProvider | null {
  return activeEp;
}

export function isModelLoaded(): boolean {
  return session !== null;
}

export function getLimits(scale: 2 | 4): {
  maxInputPixels: number;
  maxSide: number;
  slowMode: boolean;
} {
  const streaming = streamingEligible();
  const maxOutputPx = streaming ? MAX_STREAM_OUTPUT_PX : canvasCeiling();
  let maxInputPixels = Math.floor(maxOutputPx / (scale * scale));
  if (streaming) {
    maxInputPixels = Math.min(maxInputPixels, MAX_INPUT_PX_STREAM);
  }
  const slowMode = activeEp === "wasm";
  if (slowMode) {
    maxInputPixels = Math.min(maxInputPixels, MAX_INPUT_PX_WASM);
  }
  return {
    maxInputPixels,
    maxSide: Math.floor(Math.sqrt(maxInputPixels)),
    slowMode,
  };
}

async function fetchModel(
  onProgress?: (p: UpscaleProgress) => void,
): Promise<Uint8Array> {
  const response = await fetch(MODEL_URL);
  if (!response.ok || !response.body) {
    throw new Error("Failed to download the AI model");
  }
  const total = Number(response.headers.get("Content-Length")) || 0;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress?.({
      phase: "model",
      progress: total > 0 ? (loaded / total) * 100 : 0,
      loaded,
      total,
    });
  }
  const bytes = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

async function createSession(modelBytes: Uint8Array): Promise<void> {
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.wasmPaths = `${window.location.origin}${ORT_WASM_DIR}`;

  // Testing/debug override: ?upscale-ep=wasm forces the CPU path.
  const forced = new URLSearchParams(window.location.search).get("upscale-ep");

  if (forced !== "wasm" && "gpu" in navigator) {
    try {
      session = await ort.InferenceSession.create(modelBytes.slice().buffer, {
        executionProviders: ["webgpu"],
      });
      activeEp = "webgpu";
      return;
    } catch {
      // WebGPU unavailable or adapter rejected — fall through to WASM.
    }
  }

  // proxy:true runs WASM inference in ORT's own worker, keeping the main
  // thread (and ads) responsive; fall back to main-thread if it fails.
  try {
    ort.env.wasm.proxy = true;
    session = await ort.InferenceSession.create(modelBytes.slice().buffer, {
      executionProviders: ["wasm"],
    });
  } catch {
    ort.env.wasm.proxy = false;
    session = await ort.InferenceSession.create(modelBytes.slice().buffer, {
      executionProviders: ["wasm"],
    });
  }
  activeEp = "wasm";
}

export async function loadModel(
  onProgress?: (p: UpscaleProgress) => void,
): Promise<void> {
  if (session) return;
  if (!loadPromise) {
    loadPromise = (async () => {
      const bytes = await fetchModel(onProgress);
      await createSession(bytes);
      void cleanupStaleStreamFiles();
    })().catch((err) => {
      loadPromise = null;
      throw err;
    });
  }
  return loadPromise;
}

function tileToTensor(
  pixels: Uint8ClampedArray,
  imgWidth: number,
  sx: number,
  sy: number,
  tw: number,
  th: number,
): ort.Tensor {
  const data = new Float32Array(3 * th * tw);
  const plane = th * tw;
  for (let y = 0; y < th; y++) {
    const rowBase = ((sy + y) * imgWidth + sx) * 4;
    for (let x = 0; x < tw; x++) {
      const p = rowBase + x * 4;
      const o = y * tw + x;
      data[o] = pixels[p] / 255;
      data[plane + o] = pixels[p + 1] / 255;
      data[2 * plane + o] = pixels[p + 2] / 255;
    }
  }
  return new ort.Tensor("float32", data, [1, 3, th, tw]);
}

function outputToImageData(
  out: Float32Array,
  outW: number,
  outH: number,
  cropX: number,
  cropY: number,
  cropW: number,
  cropH: number,
): ImageData {
  const plane = outW * outH;
  const rgba = new Uint8ClampedArray(cropW * cropH * 4);
  for (let y = 0; y < cropH; y++) {
    const srcRow = (cropY + y) * outW + cropX;
    for (let x = 0; x < cropW; x++) {
      const s = srcRow + x;
      const d = (y * cropW + x) * 4;
      rgba[d] = out[s] * 255;
      rgba[d + 1] = out[plane + s] * 255;
      rgba[d + 2] = out[2 * plane + s] * 255;
      rgba[d + 3] = 255;
    }
  }
  return new ImageData(rgba, cropW, cropH);
}

// Runs one tile through the model and returns its core region as ImageData
// at the FINAL scale (2x tiles are downscaled here, so the 4x intermediate
// only ever exists tile-sized).
async function inferTileFinal(
  pixels: Uint8ClampedArray,
  inW: number,
  inH: number,
  x0: number,
  y0: number,
  scale: 2 | 4,
): Promise<ImageData> {
  const sx = Math.max(0, x0 - OVERLAP);
  const sy = Math.max(0, y0 - OVERLAP);
  const ex = Math.min(inW, x0 + CORE + OVERLAP);
  const ey = Math.min(inH, y0 + CORE + OVERLAP);
  const tw = ex - sx;
  const th = ey - sy;

  const tensor = tileToTensor(pixels, inW, sx, sy, tw, th);
  const result = await session!.run({ input: tensor });
  const out = result.output.data as Float32Array;

  const coreW = Math.min(CORE, inW - x0);
  const coreH = Math.min(CORE, inH - y0);
  const imgData = outputToImageData(
    out,
    tw * MODEL_SCALE,
    th * MODEL_SCALE,
    (x0 - sx) * MODEL_SCALE,
    (y0 - sy) * MODEL_SCALE,
    coreW * MODEL_SCALE,
    coreH * MODEL_SCALE,
  );
  if (scale === MODEL_SCALE) return imgData;

  const tmp = new OffscreenCanvas(imgData.width, imgData.height);
  tmp.getContext("2d")!.putImageData(imgData, 0, 0);
  const scaled = new OffscreenCanvas(coreW * scale, coreH * scale);
  const sctx = scaled.getContext("2d")!;
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(tmp, 0, 0, coreW * scale, coreH * scale);
  return sctx.getImageData(0, 0, coreW * scale, coreH * scale);
}

function copyIntoBand(
  band: Uint8ClampedArray,
  bandW: number,
  tile: ImageData,
  dx: number,
): void {
  const src = tile.data;
  for (let y = 0; y < tile.height; y++) {
    band.set(
      src.subarray(y * tile.width * 4, (y + 1) * tile.width * 4),
      (y * bandW + dx) * 4,
    );
  }
}

type TileProgress = () => void;

async function assembleViaCanvas(
  pixels: Uint8ClampedArray,
  inW: number,
  inH: number,
  scale: 2 | 4,
  tick: TileProgress,
): Promise<{ blob: Blob; previewBlob?: Blob }> {
  const outCanvas = new OffscreenCanvas(inW * scale, inH * scale);
  const outCtx = outCanvas.getContext("2d")!;

  for (let y0 = 0; y0 < inH; y0 += CORE) {
    for (let x0 = 0; x0 < inW; x0 += CORE) {
      const imgData = await inferTileFinal(pixels, inW, inH, x0, y0, scale);
      outCtx.putImageData(imgData, x0 * scale, y0 * scale);
      tick();
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return { blob: await outCanvas.convertToBlob({ type: "image/png" }) };
}

async function assembleViaStream(
  pixels: Uint8ClampedArray,
  inW: number,
  inH: number,
  scale: 2 | 4,
  tick: TileProgress,
): Promise<{ blob: Blob; previewBlob?: Blob }> {
  const outW = inW * scale;
  const outH = inH * scale;
  const encoder = await StreamingPngEncoder.create(outW, outH);

  // Cap both dimensions — a width-only cap would let a tall panorama produce
  // a multi-hundred-MB "preview".
  const pvScale = Math.min(1, PREVIEW_MAX_W / outW, PREVIEW_MAX_W / outH);
  const pvCanvas = new OffscreenCanvas(
    Math.max(1, Math.round(outW * pvScale)),
    Math.max(1, Math.round(outH * pvScale)),
  );
  const pvCtx = pvCanvas.getContext("2d")!;
  pvCtx.imageSmoothingEnabled = true;
  pvCtx.imageSmoothingQuality = "high";

  let blob: Blob;
  try {
    for (let y0 = 0; y0 < inH; y0 += CORE) {
      const coreH = Math.min(CORE, inH - y0);
      const bandRows = coreH * scale;
      const band = new Uint8ClampedArray(outW * bandRows * 4);

      for (let x0 = 0; x0 < inW; x0 += CORE) {
        const imgData = await inferTileFinal(pixels, inW, inH, x0, y0, scale);
        copyIntoBand(band, outW, imgData, x0 * scale);
        tick();
        await new Promise((r) => setTimeout(r, 0));
      }

      await encoder.writeRows(band, bandRows);

      const bandCanvas = new OffscreenCanvas(outW, bandRows);
      bandCanvas
        .getContext("2d")!
        .putImageData(new ImageData(band, outW, bandRows), 0, 0);
      pvCtx.drawImage(
        bandCanvas,
        0,
        y0 * scale * pvScale,
        pvCanvas.width,
        bandRows * pvScale,
      );
    }
    blob = await encoder.finish();
  } catch (err) {
    await encoder.abort();
    throw err;
  }

  // A completed multi-minute result must never be discarded over a preview
  // hiccup — fall back to no preview instead.
  const previewBlob = await pvCanvas
    .convertToBlob({ type: "image/png" })
    .catch(() => undefined);
  return { blob, previewBlob };
}

export async function upscaleImage(
  file: File,
  scale: 2 | 4,
  onProgress?: (p: UpscaleProgress) => void,
): Promise<UpscaleResult> {
  await loadModel(onProgress);

  const bitmap = await createImageBitmap(file);
  const inW = bitmap.width;
  const inH = bitmap.height;

  const limits = getLimits(scale);
  if (
    inW * inH > limits.maxInputPixels ||
    Math.max(inW, inH) * scale > MAX_OUTPUT_SIDE
  ) {
    bitmap.close();
    const code = limits.slowMode ? "wasmInputTooLarge" : "outputTooLarge";
    const maxSide = Math.min(
      limits.maxSide,
      Math.floor(MAX_OUTPUT_SIDE / scale),
    );
    throw new UpscaleLimitError(code, maxSide);
  }

  // Flatten transparency onto white — the model is RGB-only.
  const inCanvas = new OffscreenCanvas(inW, inH);
  const inCtx = inCanvas.getContext("2d")!;
  inCtx.fillStyle = "#fff";
  inCtx.fillRect(0, 0, inW, inH);
  inCtx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const pixels = inCtx.getImageData(0, 0, inW, inH).data;

  const totalTiles =
    Math.ceil(inW / CORE) * Math.ceil(inH / CORE);
  let done = 0;
  const tick: TileProgress = () => {
    done++;
    onProgress?.({ phase: "processing", progress: (done / totalTiles) * 100 });
  };

  const outputPx = inW * inH * scale * scale;
  const { blob, previewBlob } =
    outputPx > canvasCeiling()
      ? await assembleViaStream(pixels, inW, inH, scale, tick)
      : await assembleViaCanvas(pixels, inW, inH, scale, tick);

  return {
    blob,
    previewBlob,
    originalWidth: inW,
    originalHeight: inH,
    newWidth: inW * scale,
    newHeight: inH * scale,
    originalSize: file.size,
    newSize: blob.size,
    scale,
  };
}
