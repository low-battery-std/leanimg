"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils/file-helpers";

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];
const MAX_FILES = 10;
const MAX_TOTAL_BYTES = 10 * 1024 * 1024; // 10 MB

interface DropzoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

function validateFiles(
  files: File[],
): { key: string; values?: Record<string, string | number> } | null {
  if (files.length > MAX_FILES) {
    return {
      key: "tooManyFiles",
      values: { count: files.length, max: MAX_FILES },
    };
  }
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > MAX_TOTAL_BYTES) {
    return {
      key: "totalTooLarge",
      values: {
        size: formatFileSize(totalSize),
        maxSize: formatFileSize(MAX_TOTAL_BYTES),
      },
    };
  }
  return null;
}

export function Dropzone({ onFiles, disabled }: DropzoneProps) {
  const t = useTranslations("compressor");
  const tErrors = useTranslations("errors");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(errorTimerRef.current), []);

  const showError = useCallback((msg: string) => {
    setError(msg);
    clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(null), 5000);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        ACCEPTED_TYPES.includes(f.type),
      );
      const err = validateFiles(files);
      if (err) {
        showError(tErrors(err.key, err.values));
        return;
      }
      if (files.length > 0) onFiles(files);
    },
    [onFiles, disabled, showError, tErrors],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const err = validateFiles(files);
      if (err) {
        showError(tErrors(err.key, err.values));
        e.target.value = "";
        return;
      }
      if (files.length > 0) onFiles(files);
      e.target.value = "";
    },
    [onFiles, showError, tErrors],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-lg border-2 border-dashed p-12 text-center transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <input
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        onChange={handleChange}
        className="absolute inset-0 cursor-pointer opacity-0"
        disabled={disabled}
        aria-label="Upload images"
      />
      <div className="flex flex-col items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-lg font-medium">{t("dropzone.title")}</p>
        <p className="text-sm text-muted-foreground">
          {t("dropzone.hint", {
            maxFiles: MAX_FILES,
            maxSize: formatFileSize(MAX_TOTAL_BYTES),
          })}
        </p>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
