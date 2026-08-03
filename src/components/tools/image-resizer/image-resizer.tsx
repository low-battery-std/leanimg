"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ResizerDropzone } from "./resizer-dropzone";
import { ResizePanel } from "./resize-panel";
import { ResizeResultCard } from "./resize-result-card";
import { ResizeBatchDownload } from "./resize-batch-download";
import { TrustIndicators } from "@/components/tools/image-compressor/trust-indicators";
import { resizeImage, getImageDimensions } from "@/lib/resize/engine";
import { generateId } from "@/lib/utils/file-helpers";
import { trackEvent } from "@/lib/analytics";
import type { ResizeSettings, ResizeFileEntry } from "@/lib/resize/types";

export function ImageResizer() {
  const tErrors = useTranslations("errors");
  const [files, setFiles] = useState<ResizeFileEntry[]>([]);
  const [settings, setSettings] = useState<ResizeSettings>({
    mode: "pixels",
    width: 0,
    height: 0,
    percentage: 50,
    maintainAspectRatio: true,
    doNotEnlarge: true,
    quality: 90,
    fitMode: "cover",
  });
  const [isResizing, setIsResizing] = useState(false);

  const addFiles = useCallback(async (newFiles: File[]) => {
    const entries: ResizeFileEntry[] = [];
    for (const file of newFiles) {
      try {
        const dims = await getImageDimensions(file);
        entries.push({
          id: generateId(),
          file,
          preview: URL.createObjectURL(file),
          naturalWidth: dims.width,
          naturalHeight: dims.height,
          status: "pending",
        });
      } catch {
        entries.push({
          id: generateId(),
          file,
          preview: URL.createObjectURL(file),
          naturalWidth: 0,
          naturalHeight: 0,
          status: "error",
          error: tErrors("couldNotReadDimensions"),
        });
      }
    }
    setFiles((prev) => [...prev, ...entries]);
    trackEvent("file_upload", {
      tool: "resize-image",
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

  const updateSettings = useCallback((next: ResizeSettings) => {
    setSettings(next);
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "done"
          ? { ...f, status: "pending" as const, result: undefined }
          : f,
      ),
    );
  }, []);

  const resizeAll = useCallback(async () => {
    setIsResizing(true);

    for (const entry of files) {
      if (entry.status !== "pending" && entry.status !== "error") continue;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === entry.id
            ? { ...f, status: "resizing" as const, error: undefined }
            : f,
        ),
      );

      try {
        const result = await resizeImage(entry.file, settings);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id ? { ...f, status: "done" as const, result } : f,
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
                    err instanceof Error ? err.message : tErrors("resizeFailed"),
                }
              : f,
          ),
        );
      }

      await new Promise((r) => setTimeout(r, 0));
    }

    setIsResizing(false);
  }, [files, settings]);

  const pendingCount = files.filter(
    (f) => f.status === "pending" || f.status === "error",
  ).length;

  const firstFile = files[0];

  return (
    <div className="space-y-6">
      <TrustIndicators />
      <ResizerDropzone onFiles={addFiles} disabled={isResizing} />

      {files.length > 0 && (
        <>
          <ResizePanel
            settings={settings}
            onSettingsChange={updateSettings}
            onResize={resizeAll}
            fileCount={pendingCount}
            isResizing={isResizing}
            sampleWidth={firstFile?.naturalWidth}
            sampleHeight={firstFile?.naturalHeight}
          />

          <div className="space-y-2">
            {files.map((entry) => (
              <ResizeResultCard
                key={entry.id}
                entry={entry}
                onRemove={removeFile}
              />
            ))}
          </div>

          <ResizeBatchDownload files={files} onClearAll={clearAll} />
        </>
      )}
    </div>
  );
}
