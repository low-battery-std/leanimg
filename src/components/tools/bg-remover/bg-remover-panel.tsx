"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface BgRemoverPanelProps {
  onProcess: () => void;
  fileCount: number;
  isProcessing: boolean;
  modelProgress: number | null;
}

export function BgRemoverPanel({
  onProcess,
  fileCount,
  isProcessing,
  modelProgress,
}: BgRemoverPanelProps) {
  const t = useTranslations("bgRemover");

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      {modelProgress !== null && modelProgress < 100 && (
        <div>
          <p className="mb-2 text-sm text-muted-foreground">
            {t("panel.downloadingModel")}
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${modelProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button
          onClick={onProcess}
          disabled={fileCount === 0 || isProcessing}
          size="lg"
        >
          {isProcessing
            ? t("panel.processing")
            : t("panel.processBtn", { count: fileCount })}
        </Button>
        <p className="text-xs text-muted-foreground">
          {isProcessing ? t("panel.dontClose") : t("panel.outputHint")}
        </p>
      </div>
    </div>
  );
}
