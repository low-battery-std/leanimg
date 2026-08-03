"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, downloadBlob } from "@/lib/utils/file-helpers";
import type { ResizeFileEntry } from "@/lib/resize/types";

interface ResizeResultCardProps {
  entry: ResizeFileEntry;
  onRemove: (id: string) => void;
}

export function ResizeResultCard({ entry, onRemove }: ResizeResultCardProps) {
  const t = useTranslations("resizer");
  const { file, status, result, error } = entry;

  const outputFileName = result
    ? `${file.name.replace(/\.[^.]+$/, "")}-${result.newWidth}x${result.newHeight}.${result.format}`
    : file.name;

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
          {entry.naturalWidth} &times; {entry.naturalHeight} &mdash;{" "}
          {formatFileSize(file.size)}
          {result && (
            <>
              {" \u2192 "}
              <span className="font-medium text-foreground">
                {result.newWidth} &times; {result.newHeight}
              </span>
              {" \u2014 "}
              <span className="font-medium text-foreground">
                {formatFileSize(result.newSize)}
              </span>
            </>
          )}
        </p>
        {status === "resizing" && (
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full animate-pulse rounded-full bg-primary"
              style={{ width: "60%" }}
            />
          </div>
        )}
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>

      {result && (
        <Badge variant="secondary" className="flex-shrink-0">
          {result.newWidth}&times;{result.newHeight}
        </Badge>
      )}

      <div className="flex flex-shrink-0 items-center gap-1">
        {result && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => downloadBlob(result.blob, outputFileName, "resize-image")}
          >
            {t("resultCard.download")}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(entry.id)}
          className="h-8 w-8 text-muted-foreground"
          aria-label={`Remove ${file.name}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
