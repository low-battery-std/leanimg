"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ConverterDropzone } from "./converter-dropzone";
import { ConverterResults } from "./converter-results";
import { ConverterSettings } from "./converter-settings";
import { TrustIndicators } from "@/components/tools/image-compressor/trust-indicators";
import { convertImage } from "@/lib/conversion/engine";
import { getFormat, getEncodeFormats, mimeToFormat } from "@/lib/conversion/formats";
import { generateId } from "@/lib/utils/file-helpers";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import type { ConversionFileEntry } from "@/lib/conversion/types";

const DEFAULT_QUALITY: Record<string, number> = {
  jpeg: 85,
  webp: 80,
  avif: 50,
  png: 100,
};

interface ImageConverterProps {
  sourceFormat: string;
  targetFormat: string;
}

export function ImageConverter({
  sourceFormat,
  targetFormat: initialTarget,
}: ImageConverterProps) {
  const t = useTranslations("converter");
  const tErrors = useTranslations("errors");
  const [files, setFiles] = useState<ConversionFileEntry[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState(initialTarget);
  const [quality, setQuality] = useState(DEFAULT_QUALITY[initialTarget] ?? 80);
  const [alreadyTargetNote, setAlreadyTargetNote] = useState<string | null>(null);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const filesRef = useRef(files);
  filesRef.current = files;
  const userPickedTarget = useRef(sourceFormat !== "auto");

  const encodeFormats = useMemo(() => getEncodeFormats(), []);
  const targetInfo = getFormat(selectedTarget);
  const targetName = targetInfo?.name ?? selectedTarget.toUpperCase();

  const detectedSource = useMemo(() => {
    if (files.length === 0) return null;
    const fmt = mimeToFormat(files[0].file.type);
    if (fmt === "unknown") return null;
    return getFormat(fmt);
  }, [files]);

  const runConversion = useCallback(
    async (entries: ConversionFileEntry[], target: string, q: number) => {
      setIsConverting(true);
      for (const entry of entries) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: "converting" as const, error: undefined }
              : f,
          ),
        );
        try {
          const result = await convertImage(entry.file, target, { quality: q });
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
                    error: err instanceof Error ? err.message : tErrors("conversionFailed"),
                  }
                : f,
            ),
          );
        }
        await new Promise((r) => setTimeout(r, 0));
      }
      setIsConverting(false);
    },
    [tErrors],
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const entries: ConversionFileEntry[] = newFiles.map((file) => ({
        id: generateId(),
        file,
        preview: URL.createObjectURL(file),
        status: "pending" as const,
      }));
      setFiles((prev) => [...prev, ...entries]);
      trackEvent("file_upload", {
        tool: "convert",
        file_count: newFiles.length,
        total_size_kb: Math.round(newFiles.reduce((s, f) => s + f.size, 0) / 1024),
      });

      if (!userPickedTarget.current) return;

      const hasAlreadyTarget = newFiles.some(
        (f) => mimeToFormat(f.type) === selectedTarget,
      );
      if (hasAlreadyTarget) {
        clearTimeout(noteTimerRef.current);
        setAlreadyTargetNote(
          tErrors("alreadyFormat", { format: targetName }),
        );
        noteTimerRef.current = setTimeout(() => setAlreadyTargetNote(null), 5000);
      }

      runConversion(entries, selectedTarget, quality);
    },
    [runConversion, selectedTarget, targetName, quality, tErrors],
  );

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

  const handleTargetChange = useCallback(
    (newTarget: string) => {
      if (isConverting) return;
      userPickedTarget.current = true;

      const isSameTarget = newTarget === selectedTarget;
      const newQ = isSameTarget ? quality : (DEFAULT_QUALITY[newTarget] ?? 80);
      if (!isSameTarget) {
        setSelectedTarget(newTarget);
        setQuality(newQ);
      }
      setAlreadyTargetNote(null);

      const current = filesRef.current;
      if (current.length === 0) return;

      const pending = current.filter((f) => f.status === "pending");
      const done = current.filter((f) => f.status === "done" || f.status === "error");

      if (pending.length > 0 && isSameTarget) {
        runConversion(pending, newTarget, newQ);
      } else if (!isSameTarget) {
        const reset = current.map((f) => ({
          ...f,
          status: "pending" as const,
          result: undefined,
          error: undefined,
        }));
        setFiles(reset);
        runConversion(reset, newTarget, newQ);
      } else if (done.length > 0) {
        // all already converted to this format, nothing to do
      }
    },
    [selectedTarget, quality, isConverting, runConversion],
  );

  const handleQualityChange = useCallback(
    (newQuality: number) => {
      setQuality(newQuality);

      const current = filesRef.current;
      const toReconvert = current.filter(
        (f) => f.status === "done" || f.status === "error",
      );
      if (toReconvert.length === 0) return;

      const reset = toReconvert.map((f) => ({
        ...f,
        status: "pending" as const,
        result: undefined,
        error: undefined,
      }));
      setFiles((prev) =>
        prev.map((f) => reset.find((r) => r.id === f.id) ?? f),
      );
      runConversion(reset, selectedTarget, newQuality);
    },
    [selectedTarget, runConversion],
  );

  return (
    <div className="space-y-6">
      <TrustIndicators />

      <ConverterDropzone
        onFiles={addFiles}
        disabled={isConverting}
        targetFormatName={targetName}
      />

      <div className="space-y-3">
        {detectedSource && (
          <p className="text-sm text-muted-foreground">
            {t("sourceDetected")}{" "}
            <span className="font-medium text-foreground">
              {detectedSource.name}
            </span>
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t("convertTo")}
          </span>
          {encodeFormats.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => handleTargetChange(fmt.id)}
              disabled={isConverting}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                selectedTarget === fmt.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                isConverting && "pointer-events-none opacity-50",
              )}
            >
              {fmt.name}
            </button>
          ))}
        </div>

        {alreadyTargetNote && (
          <p className="text-sm text-muted-foreground">{alreadyTargetNote}</p>
        )}
      </div>

      {files.length > 0 && (
        <>
          <ConverterSettings
            quality={quality}
            onQualityChange={handleQualityChange}
            targetFormat={selectedTarget}
          />

          <ConverterResults
            files={files}
            onRemove={removeFile}
            onClearAll={clearAll}
            targetFormat={selectedTarget}
          />
        </>
      )}
    </div>
  );
}
