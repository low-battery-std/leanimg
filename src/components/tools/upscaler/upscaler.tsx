"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { UpscalerDropzone } from "./upscaler-dropzone";
import { UpscalerPanel } from "./upscaler-panel";
import { UpscalerResultCard } from "./upscaler-result-card";
import { UpscalerBatchDownload } from "./upscaler-batch-download";
import {
  upscaleImage,
  loadModel,
  isModelLoaded,
  getActiveEp,
  UpscaleLimitError,
} from "@/lib/upscale/engine";
import { generateId } from "@/lib/utils/file-helpers";
import { trackEvent } from "@/lib/analytics";
import type { UpscaleFileEntry } from "@/lib/upscale/types";

export function Upscaler() {
  const t = useTranslations("upscaler");
  const tErrors = useTranslations("errors");
  const [files, setFiles] = useState<UpscaleFileEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scale, setScale] = useState<2 | 4>(2);
  const [modelProgress, setModelProgress] = useState<number | null>(null);
  const [slowMode, setSlowMode] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    const entries: UpscaleFileEntry[] = newFiles.map((file) => ({
      id: generateId(),
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...entries]);
    trackEvent("file_upload", {
      tool: "upscale-image",
      file_count: newFiles.length,
      total_size_kb: Math.round(
        newFiles.reduce((s, f) => s + f.size, 0) / 1024,
      ),
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry?.preview) URL.revokeObjectURL(entry.preview);
      if (entry?.resultPreview) URL.revokeObjectURL(entry.resultPreview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
        if (f.resultPreview) URL.revokeObjectURL(f.resultPreview);
      });
      return [];
    });
  }, []);

  const processAll = useCallback(async () => {
    setIsProcessing(true);

    try {
      if (!isModelLoaded()) {
        setModelProgress(0);
        try {
          await loadModel((p) => {
            if (p.phase === "model") setModelProgress(p.progress);
          });
        } catch {
          const message = t("errors.modelLoadFailed");
          setModelProgress(null);
          setFiles((prev) =>
            prev.map((f) =>
              f.status === "pending" || f.status === "error"
                ? { ...f, status: "error" as const, error: message }
                : f,
            ),
          );
          return;
        }
        setModelProgress(null);
      }
      setSlowMode(getActiveEp() === "wasm");

      for (const entry of files) {
        if (entry.status !== "pending" && entry.status !== "error") continue;

        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? {
                  ...f,
                  status: "processing" as const,
                  error: undefined,
                  progress: 0,
                }
              : f,
          ),
        );

        try {
          const result = await upscaleImage(entry.file, scale, (p) => {
            if (p.phase === "processing") {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === entry.id ? { ...f, progress: p.progress } : f,
                ),
              );
            }
          });
          const resultPreview = URL.createObjectURL(
            result.previewBlob ?? result.blob,
          );
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id
                ? {
                    ...f,
                    status: "done" as const,
                    result,
                    resultPreview,
                    progress: undefined,
                  }
                : f,
            ),
          );
        } catch (err) {
          const error =
            err instanceof UpscaleLimitError
              ? t(`errors.${err.code}`, { maxSide: err.maxSide, scale })
              : err instanceof Error && err.message
                ? err.message
                : tErrors("processingFailed");
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id
                ? {
                    ...f,
                    status: "error" as const,
                    error,
                    progress: undefined,
                  }
                : f,
            ),
          );
        }

        await new Promise((r) => setTimeout(r, 0));
      }
    } finally {
      setIsProcessing(false);
    }
  }, [files, scale, t, tErrors]);

  const pendingCount = files.filter(
    (f) => f.status === "pending" || f.status === "error",
  ).length;

  return (
    <div className="space-y-6">
      <UpscalerDropzone onFiles={addFiles} disabled={isProcessing} />

      {files.length > 0 && (
        <>
          <UpscalerPanel
            onProcess={processAll}
            fileCount={pendingCount}
            isProcessing={isProcessing}
            scale={scale}
            onScaleChange={setScale}
            modelProgress={modelProgress}
            slowMode={slowMode}
          />

          <div className="space-y-2">
            {files.map((entry) => (
              <UpscalerResultCard
                key={entry.id}
                entry={entry}
                onRemove={removeFile}
              />
            ))}
          </div>

          <UpscalerBatchDownload files={files} onClearAll={clearAll} />
        </>
      )}
    </div>
  );
}
