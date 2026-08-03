"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface ConverterSettingsProps {
  quality: number;
  onQualityChange: (quality: number) => void;
  targetFormat: string;
}

const LOSSY_FORMATS = new Set(["jpeg", "webp", "avif"]);

export function ConverterSettings({
  quality,
  onQualityChange,
  targetFormat,
}: ConverterSettingsProps) {
  const t = useTranslations("converter");
  const [isOpen, setIsOpen] = useState(false);

  if (!LOSSY_FORMATS.has(targetFormat)) return null;

  return (
    <details
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
      className="rounded-lg border px-4 py-3"
    >
      <summary className="cursor-pointer text-sm font-medium">
        {t("options")}
      </summary>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="quality-slider" className="text-sm">
            {t("quality")}
          </label>
          <span className="text-sm font-medium tabular-nums">{quality}%</span>
        </div>
        <input
          id="quality-slider"
          type="range"
          min={1}
          max={100}
          value={quality}
          onChange={(e) => onQualityChange(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <p className="text-xs text-muted-foreground">{t("qualityHint")}</p>
      </div>
    </details>
  );
}
