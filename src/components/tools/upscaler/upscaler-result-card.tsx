"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatFileSize, downloadBlob } from "@/lib/utils/file-helpers";
import type { UpscaleFileEntry } from "@/lib/upscale/types";

interface UpscalerResultCardProps {
  entry: UpscaleFileEntry;
  onRemove: (id: string) => void;
}

function ComparisonSlider({
  originalSrc,
  resultSrc,
  alt,
}: {
  originalSrc: string;
  resultSrc: string;
  alt: string;
}) {
  const t = useTranslations("upscaler");
  const [position, setPosition] = useState(50);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPosition(Number(e.target.value));
    },
    [],
  );

  return (
    <figure className="relative select-none overflow-hidden rounded-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resultSrc}
        alt={`${alt} — upscaled`}
        className="block w-full"
        draggable={false}
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={originalSrc}
        alt={`${alt} — original`}
        className="pointer-events-none absolute inset-0 block h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        draggable={false}
      />

      <div
        className="pointer-events-none absolute inset-y-0"
        style={{ left: `${position}%` }}
        aria-hidden="true"
      >
        <div className="absolute inset-y-0 -translate-x-1/2 w-0.5 bg-white shadow-[0_0_4px_rgba(0,0,0,0.5)]" />
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black/50 text-white backdrop-blur-sm">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 10L3 10M3 10L5 8M3 10L5 12M14 10L17 10M17 10L15 8M17 10L15 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
        {t("resultCard.original")}
      </span>
      <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
        {t("resultCard.result")}
      </span>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={handleChange}
        aria-label={t("resultCard.sliderLabel")}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </figure>
  );
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ProcessingProgress({ progress }: { progress?: number }) {
  const t = useTranslations("upscaler");
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const pct = progress ?? 90 * (1 - Math.exp(-elapsed / 20));

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("panel.elapsed", { time: formatElapsed(elapsed) })}</span>
        <span>
          {progress != null
            ? `${Math.round(progress)}%`
            : t("panel.estimatedTime")}
        </span>
      </div>
    </div>
  );
}

export function UpscalerResultCard({ entry, onRemove }: UpscalerResultCardProps) {
  const t = useTranslations("upscaler");
  const { file, status, result, resultPreview, error } = entry;

  const outputFileName = `${file.name.replace(/\.[^.]+$/, "")}-upscaled.png`;

  if (status === "done" && result && resultPreview) {
    return (
      <div className="rounded-lg border bg-card">
        <ComparisonSlider
          originalSrc={entry.preview}
          resultSrc={resultPreview}
          alt={file.name}
        />
        <div className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{outputFileName}</p>
            <p className="text-xs text-muted-foreground">
              {result.originalWidth}×{result.originalHeight}
              {" → "}
              <span className="font-medium text-foreground">
                {result.newWidth}×{result.newHeight}
              </span>
              {" · "}
              {formatFileSize(result.originalSize)}
              {" → "}
              {formatFileSize(result.newSize)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              onClick={() => downloadBlob(result.blob, outputFileName, "upscale-image")}
            >
              {t("resultCard.download")}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(entry.id)}
              className="h-8 w-8 text-muted-foreground"
              aria-label={`Remove ${file.name}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-3">
      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={entry.preview}
          alt={file.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
        </p>
        {status === "processing" && (
          <ProcessingProgress progress={entry.progress} />
        )}
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(entry.id)}
        className="h-8 w-8 flex-shrink-0 text-muted-foreground"
        aria-label={`Remove ${file.name}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </Button>
    </div>
  );
}
