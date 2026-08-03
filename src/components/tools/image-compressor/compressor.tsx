"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Dropzone } from "./dropzone";
import { CompressionPanel } from "./compression-panel";
import { ResultCard } from "./result-card";
import { BatchDownload } from "./batch-download";
import { TrustIndicators } from "./trust-indicators";
import { compressImageOffThread } from "@/lib/compression/compress-off-thread";
import { generateId } from "@/lib/utils/file-helpers";
import { trackEvent } from "@/lib/analytics";
import type { CompressionSettings, FileEntry } from "@/lib/compression/types";

const COUNTER_KEY = "leanimg_compressed_count";

function getStoredCount(): number {
  try {
    return parseInt(localStorage.getItem(COUNTER_KEY) ?? "0", 10) || 0;
  } catch {
    return 0;
  }
}

function incrementStoredCount(n: number): number {
  const next = getStoredCount() + n;
  try {
    localStorage.setItem(COUNTER_KEY, String(next));
  } catch { /* quota exceeded — ignore */ }
  return next;
}

export function ImageCompressor() {
  const t = useTranslations("compressor");
  const tErrors = useTranslations("errors");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>({
    mode: "smart",
    quality: 80,
    outputFormat: "auto",
  });
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressedCount, setCompressedCount] = useState(0);

  useEffect(() => {
    setCompressedCount(getStoredCount());
  }, []);

  const addFiles = useCallback((newFiles: File[]) => {
    const entries: FileEntry[] = newFiles.map((file) => ({
      id: generateId(),
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...entries]);
    trackEvent("file_upload", {
      tool: "compress-image",
      file_count: newFiles.length,
      total_size_kb: Math.round(newFiles.reduce((s, f) => s + f.size, 0) / 1024),
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry?.preview) URL.revokeObjectURL(entry.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
      return [];
    });
  }, []);

  const updateSettings = useCallback((next: CompressionSettings) => {
    setSettings(next);
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "done"
          ? { ...f, status: "pending" as const, result: undefined }
          : f,
      ),
    );
  }, []);

  const compressAll = useCallback(async () => {
    setIsCompressing(true);

    for (const entry of files) {
      if (entry.status !== "pending" && entry.status !== "error") continue;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === entry.id
            ? { ...f, status: "compressing" as const, error: undefined }
            : f,
        ),
      );

      try {
        const result = await compressImageOffThread(entry.file, settings);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: "done" as const, result }
              : f,
          ),
        );
        setCompressedCount(incrementStoredCount(1));
      } catch (err) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? {
                  ...f,
                  status: "error" as const,
                  error: err instanceof Error ? err.message : tErrors("compressionFailed"),
                }
              : f,
          ),
        );
      }

      // Yield to UI between files
      await new Promise((r) => setTimeout(r, 0));
    }

    setIsCompressing(false);
  }, [files, settings]);

  const pendingCount = files.filter(
    (f) => f.status === "pending" || f.status === "error",
  ).length;

  const totalOriginalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TrustIndicators />
        {compressedCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {t("counter", { count: compressedCount })}
          </p>
        )}
      </div>
      <Dropzone onFiles={addFiles} disabled={isCompressing} />

      {files.length > 0 && (
        <>
          <CompressionPanel
            settings={settings}
            onSettingsChange={updateSettings}
            onCompress={compressAll}
            fileCount={pendingCount}
            isCompressing={isCompressing}
            totalOriginalSize={totalOriginalSize}
          />

          <div className="space-y-2">
            {files.map((entry) => (
              <ResultCard key={entry.id} entry={entry} onRemove={removeFile} />
            ))}
          </div>

          <BatchDownload files={files} onClearAll={clearAll} />
        </>
      )}
    </div>
  );
}
