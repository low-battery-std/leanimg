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
const MAX_BYTES = 10 * 1024 * 1024;

interface CropperDropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

function validateFile(
  file: File,
): { key: string; values?: Record<string, string | number> } | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { key: "unsupportedFormat" };
  }
  if (file.size > MAX_BYTES) {
    return {
      key: "totalTooLarge",
      values: {
        size: formatFileSize(file.size),
        maxSize: formatFileSize(MAX_BYTES),
      },
    };
  }
  return null;
}

export function CropperDropzone({ onFile, disabled }: CropperDropzoneProps) {
  const t = useTranslations("cropper");
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
      const file = Array.from(e.dataTransfer.files).find((f) =>
        ACCEPTED_TYPES.includes(f.type),
      );
      if (!file) return;
      const err = validateFile(file);
      if (err) {
        showError(tErrors(err.key, err.values));
        return;
      }
      onFile(file);
    },
    [onFile, disabled, showError, tErrors],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const err = validateFile(file);
      if (err) {
        showError(tErrors(err.key, err.values));
        e.target.value = "";
        return;
      }
      onFile(file);
      e.target.value = "";
    },
    [onFile, showError, tErrors],
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
        onChange={handleChange}
        className="absolute inset-0 cursor-pointer opacity-0"
        disabled={disabled}
        aria-label="Upload image"
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
          {t("dropzone.hint", { maxSize: formatFileSize(MAX_BYTES) })}
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
