"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { BgRemoverDropzone } from "./bg-remover-dropzone";
import { BgRemoverPanel } from "./bg-remover-panel";
import { BgRemoverResultCard } from "./bg-remover-result-card";
import { BgRemoverBatchDownload } from "./bg-remover-batch-download";
import {
  removeBackground,
  loadModel,
  isModelLoaded,
} from "@/lib/background-removal/engine";
import type { ModelProgress } from "@/lib/background-removal/engine";
import { generateId } from "@/lib/utils/file-helpers";
import { trackEvent } from "@/lib/analytics";
import type { BgRemovalFileEntry } from "@/lib/background-removal/types";

export function BgRemover() {
  const tErrors = useTranslations("errors");
  const [files, setFiles] = useState<BgRemovalFileEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelProgress, setModelProgress] = useState<number | null>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    const entries: BgRemovalFileEntry[] = newFiles.map((file) => ({
      id: generateId(),
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...entries]);
    trackEvent("file_upload", {
      tool: "remove-background",
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
        const progressFiles = new Map<string, number>();
        try {
          await loadModel((p: ModelProgress) => {
            if (p.status === "progress" && p.file && p.progress != null) {
              progressFiles.set(p.file, p.progress);
              const values = Array.from(progressFiles.values());
              const avg = values.reduce((a, b) => a + b, 0) / values.length;
              setModelProgress(avg);
            }
          });
        } catch (err) {
          const message =
            err instanceof Error && err.message
              ? err.message
              : tErrors("processingFailed");
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
        setModelProgress(100);
      }

      for (const entry of files) {
        if (entry.status !== "pending" && entry.status !== "error") continue;

        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: "processing" as const, error: undefined }
              : f,
          ),
        );

        try {
          const result = await removeBackground(entry.file);
          const resultPreview = URL.createObjectURL(result.blob);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id
                ? { ...f, status: "done" as const, result, resultPreview }
                : f,
            ),
          );
        } catch (err) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id
                ? {
                    ...f,
                    status: "error" as const,
                    error:
                      err instanceof Error
                        ? err.message
                        : tErrors("processingFailed"),
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
  }, [files, tErrors]);

  const pendingCount = files.filter(
    (f) => f.status === "pending" || f.status === "error",
  ).length;

  return (
    <div className="space-y-6">
      <BgRemoverDropzone onFiles={addFiles} disabled={isProcessing} />

      {files.length > 0 && (
        <>
          <BgRemoverPanel
            onProcess={processAll}
            fileCount={pendingCount}
            isProcessing={isProcessing}
            modelProgress={modelProgress}
          />

          <div className="space-y-2">
            {files.map((entry) => (
              <BgRemoverResultCard
                key={entry.id}
                entry={entry}
                onRemove={removeFile}
              />
            ))}
          </div>

          <BgRemoverBatchDownload files={files} onClearAll={clearAll} />
        </>
      )}
    </div>
  );
}
