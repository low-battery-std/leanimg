"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { downloadBlob, downloadAsZip } from "@/lib/utils/file-helpers";
import type { BgRemovalFileEntry } from "@/lib/background-removal/types";

interface BgRemoverBatchDownloadProps {
  files: BgRemovalFileEntry[];
  onClearAll: () => void;
}

export function BgRemoverBatchDownload({ files, onClearAll }: BgRemoverBatchDownloadProps) {
  const t = useTranslations("bgRemover");
  const completed = files.filter((f) => f.status === "done" && f.result);
  if (completed.length === 0) return null;

  const isSingle = completed.length === 1;

  const handleDownloadAll = async () => {
    if (isSingle) {
      const f = completed[0];
      const name = `${f.file.name.replace(/\.[^.]+$/, "")}.png`;
      downloadBlob(f.result!.blob, name, "remove-background");
      return;
    }
    const zipFiles = completed.map((f) => ({
      name: `${f.file.name.replace(/\.[^.]+$/, "")}.png`,
      blob: f.result!.blob,
    }));
    await downloadAsZip(zipFiles, "background-removed.zip", "remove-background");
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
