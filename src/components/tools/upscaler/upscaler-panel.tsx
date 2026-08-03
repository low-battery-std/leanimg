"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

interface UpscalerPanelProps {
  onProcess: () => void;
  fileCount: number;
  isProcessing: boolean;
  scale: 2 | 4;
  onScaleChange: (scale: 2 | 4) => void;
  modelProgress: number | null;
  slowMode: boolean;
}

export function UpscalerPanel({
  onProcess,
  fileCount,
  isProcessing,
  scale,
  onScaleChange,
  modelProgress,
  slowMode,
}: UpscalerPanelProps) {
  const t = useTranslations("upscaler");

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      {modelProgress !== null && (
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

      {slowMode && (
        <p className="text-xs text-muted-foreground">{t("panel.slowMode")}</p>
      )}

      <div className="flex items-center gap-2">
        {([2, 4] as const).map((s) => (
          <button
            key={s}
            onClick={() => onScaleChange(s)}
            disabled={isProcessing}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              scale === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}x
          </button>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">
          {t("panel.scaleHint")}
        </span>
      </div>

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
