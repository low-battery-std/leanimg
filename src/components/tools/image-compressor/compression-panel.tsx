"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils/file-helpers";
import type {
  CompressionSettings,
  CompressionMode,
  OutputFormat,
} from "@/lib/compression/types";

function estimateSize(
  originalBytes: number,
  quality: number,
  format: string,
): number | null {
  if (format === "png-lossy") return null;
  return originalBytes * (quality / 100) ** 1.8;
}

function sliderColorClass(q: number): string {
  if (q > 50) return "[&_[data-slot=slider-range]]:bg-green-600";
  if (q > 30) return "[&_[data-slot=slider-range]]:bg-amber-500";
  return "[&_[data-slot=slider-range]]:bg-red-500";
}

const PRESETS: {
  labelKey: "presetWeb" | "presetEmail" | "presetSocial";
  quality: number;
  outputFormat: OutputFormat;
}[] = [
  { labelKey: "presetWeb", quality: 80, outputFormat: "auto" },
  { labelKey: "presetEmail", quality: 70, outputFormat: "jpeg" },
  { labelKey: "presetSocial", quality: 85, outputFormat: "jpeg" },
];

interface CompressionPanelProps {
  settings: CompressionSettings;
  onSettingsChange: (settings: CompressionSettings) => void;
  onCompress: () => void;
  fileCount: number;
  isCompressing: boolean;
  totalOriginalSize: number;
}

export function CompressionPanel({
  settings,
  onSettingsChange,
  onCompress,
  fileCount,
  isCompressing,
  totalOriginalSize,
}: CompressionPanelProps) {
  const t = useTranslations("compressor");
  const isManual = settings.mode === "manual";
  const showQuality = isManual && settings.outputFormat !== "png";

  function qualityHint(q: number): string {
    if (q === 100) return t("panel.noCompression");
    if (q > 50) return t("panel.minimalChanges");
    if (q > 30) return t("panel.solidCompression");
    return t("panel.heavyCompression");
  }

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        {(["smart", "manual"] as CompressionMode[]).map((m) => (
          <button
            key={m}
            onClick={() =>
              onSettingsChange({
                ...settings,
                mode: m,
                ...(m === "smart" ? { quality: 80, outputFormat: "auto" } : {}),
              })
            }
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              settings.mode === m
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "smart" ? t("panel.smart") : t("panel.manual")}
          </button>
        ))}

        {!isManual && (
          <span className="ml-2 text-xs text-muted-foreground">
            {t("panel.smartHint")}
          </span>
        )}
      </div>

      {/* Presets (Manual mode) */}
      {isManual && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {t("panel.presets")}
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.labelKey}
              onClick={() =>
                onSettingsChange({
                  ...settings,
                  quality: p.quality,
                  outputFormat: p.outputFormat,
                })
              }
              className="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
            >
              {t(`panel.${p.labelKey}`)}
            </button>
          ))}
        </div>
      )}

      {/* Format + quality controls */}
      <div className="flex flex-wrap items-end gap-4">
        {isManual && (
          <div className="min-w-[240px] flex-1">
            <label className="mb-2 block text-sm font-medium">
              {t("panel.outputFormat")}
            </label>
            <Select
              value={settings.outputFormat}
              onValueChange={(v) =>
                onSettingsChange({
                  ...settings,
                  outputFormat: v as OutputFormat,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">{t("panel.keepOriginal")}</SelectItem>
                <SelectItem value="jpeg">{t("panel.jpegBest")}</SelectItem>
                <SelectItem value="png">{t("panel.pngNo")}</SelectItem>
                <SelectItem value="png-lossy">
                  {t("panel.pngSmaller")}
                </SelectItem>
                <SelectItem value="webp">{t("panel.webpModern")}</SelectItem>
                <SelectItem value="avif">{t("panel.avifSmallest")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {isManual && settings.outputFormat === "png" && (
          <p className="min-w-[260px] flex-[2] text-xs text-amber-600 dark:text-amber-400">
            {t("panel.pngWarning")}
          </p>
        )}

        {showQuality && (
          <div className="min-w-[260px] flex-[2]">
            <div className="mb-2 flex items-baseline justify-between">
              <label className="text-sm font-medium">
                {t("panel.quality", { value: settings.quality })}
              </label>
              {totalOriginalSize > 0 &&
                (() => {
                  const est = estimateSize(
                    totalOriginalSize,
                    settings.quality,
                    settings.outputFormat,
                  );
                  if (est !== null) {
                    return (
                      <span className="text-xs text-muted-foreground">
                        ≈ {formatFileSize(est)}
                        {fileCount > 1 && ` ${t("panel.total")}`}
                      </span>
                    );
                  }
                  return (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {t("panel.pngLarger")}
                    </span>
                  );
                })()}
            </div>

            <Slider
              className={sliderColorClass(settings.quality)}
              value={[settings.quality]}
              onValueChange={([v]) =>
                onSettingsChange({ ...settings, quality: v })
              }
              min={1}
              max={100}
              step={1}
            />

            <p className="mt-1.5 text-xs text-muted-foreground">
              {qualityHint(settings.quality)}
            </p>
          </div>
        )}

        <Button
          onClick={onCompress}
          disabled={fileCount === 0 || isCompressing}
          size="lg"
        >
          {isCompressing
            ? t("panel.compressing")
            : t("panel.compressBtn", { count: fileCount })}
        </Button>
      </div>
    </div>
  );
}
