"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFileSize, downloadBlob } from "@/lib/utils/file-helpers";
import type { FileEntry } from "@/lib/compression/types";

interface ResultCardProps {
  entry: FileEntry;
  onRemove: (id: string) => void;
}

export function ResultCard({ entry, onRemove }: ResultCardProps) {
  const t = useTranslations("compressor");
  const { file, status, result, error } = entry;

  const baseName = file.name.replace(/\.[^.]+$/, "");
  const outputFileName = result ? `${baseName}.${result.outputFormat}` : file.name;
  const formatChanged = result && outputFileName !== file.name;

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
        <p className="truncate text-sm font-medium">{outputFileName}</p>
        {formatChanged && (
          <p className="text-[10px] text-muted-foreground">
            {t("resultCard.from", {
              format: file.name.split(".").pop()?.toUpperCase() ?? "",
            })}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
          {result && (
            <>
              {" \u2192 "}
              <span className="font-medium text-foreground">
                {formatFileSize(result.compressedSize)}
              </span>
            </>
          )}
        </p>
        {status === "compressing" && (
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "60%" }} />
          </div>
        )}
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>

      {result && (
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <Badge
            variant={result.savings > 0 ? "default" : "secondary"}
          >
            {result.savings > 0
              ? `-${result.savings.toFixed(0)}%`
              : t("resultCard.noSavings")}
          </Badge>
          {result.savings <= 0 && (
            <p className="max-w-[180px] text-right text-[10px] leading-tight text-muted-foreground">
              {t("resultCard.tryLower")}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-shrink-0 items-center gap-1">
        {result && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => downloadBlob(result.blob, outputFileName, "compress-image")}
          >
            {t("resultCard.download", { format: result.outputFormat })}
          </Button>
        )}
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
  );
}
