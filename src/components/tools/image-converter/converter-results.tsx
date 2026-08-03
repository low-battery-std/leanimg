"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatFileSize,
  downloadBlob,
  downloadAsZip,
} from "@/lib/utils/file-helpers";
import { getFormat } from "@/lib/conversion/formats";
import type { ConversionFileEntry } from "@/lib/conversion/types";

interface ResultCardProps {
  entry: ConversionFileEntry;
  onRemove: (id: string) => void;
}

function ResultCard({ entry, onRemove }: ResultCardProps) {
  const t = useTranslations("converter");
  const { file, status, result, error } = entry;

  const targetExt = result
    ? getFormat(result.outputFormat)?.extension ?? result.outputFormat
    : "";
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const outputFileName = result ? `${baseName}.${targetExt}` : file.name;

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
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
          {result && (
            <>
              {" \u2192 "}
              <span className="font-medium text-foreground">
                {formatFileSize(result.convertedSize)}
              </span>
            </>
          )}
        </p>
        {status === "converting" && (
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
        <Badge variant="default">{t("converted")}</Badge>
      )}

      <div className="flex flex-shrink-0 items-center gap-1">
        {result && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => downloadBlob(result.blob, outputFileName, "convert")}
          >
            {t("downloadExt", { ext: targetExt })}
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

interface ConverterResultsProps {
  files: ConversionFileEntry[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  targetFormat: string;
}

export function ConverterResults({
  files,
  onRemove,
  onClearAll,
  targetFormat,
}: ConverterResultsProps) {
  const t = useTranslations("converter");
  const doneFiles = files.filter((f) => f.status === "done" && f.result);

  const handleDownloadAll = async () => {
    const ext = getFormat(targetFormat)?.extension ?? targetFormat;
    const items = doneFiles.map((f) => ({
      name: `${f.file.name.replace(/\.[^.]+$/, "")}.${ext}`,
      blob: f.result!.blob,
    }));
    await downloadAsZip(items, undefined, "convert");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {files.map((entry) => (
          <ResultCard key={entry.id} entry={entry} onRemove={onRemove} />
        ))}
      </div>

      {doneFiles.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {doneFiles.length > 1 && (
            <Button variant="outline" onClick={handleDownloadAll}>
              {t("downloadAllZip")}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground"
          >
            {t("clearAll")}
          </Button>
        </div>
      )}
    </div>
  );
}
