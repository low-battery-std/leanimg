"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export type AspectRatioPreset =
  | "free"
  | "1:1"
  | "4:3"
  | "3:2"
  | "16:9"
  | "9:16"
  | "3:4"
  | "2:3"
  | "custom";

const PRESETS: { key: AspectRatioPreset; label: string; value?: number }[] = [
  { key: "free", label: "Free" },
  { key: "1:1", label: "1:1", value: 1 },
  { key: "4:3", label: "4:3", value: 4 / 3 },
  { key: "3:2", label: "3:2", value: 3 / 2 },
  { key: "16:9", label: "16:9", value: 16 / 9 },
  { key: "9:16", label: "9:16", value: 9 / 16 },
  { key: "3:4", label: "3:4", value: 3 / 4 },
  { key: "2:3", label: "2:3", value: 2 / 3 },
];

interface CropPanelProps {
  selectedPreset: AspectRatioPreset;
  onPresetChange: (preset: AspectRatioPreset, customRatio?: number) => void;
  onCrop: () => void;
  isCropping: boolean;
  canCrop: boolean;
}

export function CropPanel({
  selectedPreset,
  onPresetChange,
  onCrop,
  isCropping,
  canCrop,
}: CropPanelProps) {
  const t = useTranslations("cropper");
  const [customW, setCustomW] = useState(16);
  const [customH, setCustomH] = useState(9);

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div>
        <label className="mb-2 block text-sm font-medium">
          {t("panel.aspectRatio")}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => onPresetChange(p.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedPreset === p.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.key === "free" ? t("panel.freeform") : p.label}
            </button>
          ))}
          <button
            onClick={() =>
              onPresetChange(
                "custom",
                customW > 0 && customH > 0 ? customW / customH : undefined,
              )
            }
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedPreset === "custom"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("panel.custom")}
          </button>
        </div>
      </div>

      {selectedPreset === "custom" && (
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">{t("panel.ratio")}</label>
          <input
            type="number"
            min={1}
            max={100}
            value={customW}
            onChange={(e) => {
              const w = parseInt(e.target.value) || 1;
              setCustomW(w);
              if (w > 0 && customH > 0) onPresetChange("custom", w / customH);
            }}
            className="w-16 rounded-md border bg-background px-2 py-1 text-sm"
          />
          <span className="text-sm text-muted-foreground">:</span>
          <input
            type="number"
            min={1}
            max={100}
            value={customH}
            onChange={(e) => {
              const h = parseInt(e.target.value) || 1;
              setCustomH(h);
              if (customW > 0 && h > 0) onPresetChange("custom", customW / h);
            }}
            className="w-16 rounded-md border bg-background px-2 py-1 text-sm"
          />
        </div>
      )}

      <div className="flex items-end justify-end">
        <Button
          onClick={onCrop}
          disabled={!canCrop || isCropping}
          size="lg"
        >
          {isCropping ? t("panel.cropping") : t("panel.cropBtn")}
        </Button>
      </div>
    </div>
  );
}

export function getAspectRatioValue(
  preset: AspectRatioPreset,
  customRatio?: number,
): number | undefined {
  if (preset === "custom") return customRatio;
  const found = PRESETS.find((p) => p.key === preset);
  return found?.value;
}
