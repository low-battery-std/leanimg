"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { downloadBlob, downloadAsZip } from "@/lib/utils/file-helpers";
import type { UpscaleFileEntry } from "@/lib/upscale/types";

interface UpscalerBatchDownloadProps {
  files: UpscaleFileEntry[];
  onClearAll: () => void;
}

export function UpscalerBatchDownload({ files, onClearAll }: UpscalerBatchDownloadProps) {
  const t = useTranslations("upscaler");
  const completed = files.filter((f) => f.status === "done" && f.result);
  if (completed.length === 0) return null;

  const isSingle = completed.length === 1;

  const handleDownloadAll = async () => {
    if (isSingle) {
      const f = completed[0];
      const name = `${f.file.name.replace(/\.[^.]+$/, "")}-upscaled.png`;
      downloadBlob(f.result!.blob, name, "upscale-image");
      return;
    }
    const zipFiles = completed.map((f) => ({
      name: `${f.file.name.replace(/\.[^.]+$/, "")}-upscaled.png`,
      blob: f.result!.blob,
    }));
    await downloadAsZip(zipFiles, "upscaled-images.zip", "upscale-image");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
      <div className="text-sm">
        {t("batchDownload.count", { count: completed.length })}
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
