"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { downloadBlob, downloadAsZip, formatFileSize } from "@/lib/utils/file-helpers";
import type { FileEntry } from "@/lib/compression/types";

interface BatchDownloadProps {
  files: FileEntry[];
  onClearAll: () => void;
}

export function BatchDownload({ files, onClearAll }: BatchDownloadProps) {
  const t = useTranslations("compressor");
  const completed = files.filter((f) => f.status === "done" && f.result);
  if (completed.length === 0) return null;

  const totalOriginal = completed.reduce((s, f) => s + f.file.size, 0);
  const totalCompressed = completed.reduce(
    (s, f) => s + (f.result?.compressedSize ?? 0),
    0,
  );
  const totalSavings = ((totalOriginal - totalCompressed) / totalOriginal) * 100;
  const isSingle = completed.length === 1;

  const handleDownloadAll = async () => {
    if (isSingle) {
      const f = completed[0];
      const name = `${f.file.name.replace(/\.[^.]+$/, "")}.${f.result!.outputFormat}`;
      downloadBlob(f.result!.blob, name, "compress-image");
      return;
    }
    const zipFiles = completed.map((f) => ({
      name: `${f.file.name.replace(/\.[^.]+$/, "")}.${f.result!.outputFormat}`,
      blob: f.result!.blob,
    }));
    await downloadAsZip(zipFiles, undefined, "compress-image");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
      <div className="text-sm">
        {t("batchDownload.count", { count: completed.length })}
        {" \u2014 "}
        {t("batchDownload.saved", {
          savings: formatFileSize(totalOriginal - totalCompressed),
          percent: totalSavings.toFixed(0),
        })}
      </div>
      <div className="flex gap-2">
        <Button size="lg" onClick={handleDownloadAll}>
          {isSingle
            ? t("batchDownload.download")
            : t("batchDownload.saveZip")}
        </Button>
        <Button onClick={onClearAll} variant="outline">
          {t("batchDownload.clearAll")}
        </Button>
      </div>
    </div>
  );
}
