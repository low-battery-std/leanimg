"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { downloadBlob, downloadAsZip, formatFileSize } from "@/lib/utils/file-helpers";
import type { ResizeFileEntry } from "@/lib/resize/types";

interface ResizeBatchDownloadProps {
  files: ResizeFileEntry[];
  onClearAll: () => void;
}

export function ResizeBatchDownload({
  files,
  onClearAll,
}: ResizeBatchDownloadProps) {
  const t = useTranslations("resizer");
  const completed = files.filter((f) => f.status === "done" && f.result);
  if (completed.length === 0) return null;

  const isSingle = completed.length === 1;

  const handleDownloadAll = async () => {
    if (isSingle) {
      const f = completed[0];
      const r = f.result!;
      const name = `${f.file.name.replace(/\.[^.]+$/, "")}-${r.newWidth}x${r.newHeight}.${r.format}`;
      downloadBlob(r.blob, name, "resize-image");
      return;
    }
    const zipFiles = completed.map((f) => {
      const r = f.result!;
      return {
        name: `${f.file.name.replace(/\.[^.]+$/, "")}-${r.newWidth}x${r.newHeight}.${r.format}`,
        blob: r.blob,
      };
    });
    await downloadAsZip(zipFiles, undefined, "resize-image");
  };

  const totalOriginal = completed.reduce((s, f) => s + f.file.size, 0);
  const totalNew = completed.reduce(
    (s, f) => s + (f.result?.newSize ?? 0),
    0,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
      <div className="text-sm">
        {t("batchDownload.count", { count: completed.length })} &mdash;{" "}
        {formatFileSize(totalOriginal)}
        {" \u2192 "}
        <span className="font-medium">{formatFileSize(totalNew)}</span>
      </div>
      <div className="flex gap-2">
        <Button size="lg" onClick={handleDownloadAll}>
          {isSingle ? t("batchDownload.download") : t("batchDownload.saveZip")}
        </Button>
        <Button onClick={onClearAll} variant="outline">
          {t("batchDownload.clearAll")}
        </Button>
      </div>
    </div>
  );
}
