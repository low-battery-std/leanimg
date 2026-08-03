"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { ResizeSettings, ResizeMode, FitMode } from "@/lib/resize/types";
import { percentagePresets, socialPresets } from "@/lib/resize/presets";

interface ResizePanelProps {
  settings: ResizeSettings;
  onSettingsChange: (settings: ResizeSettings) => void;
  onResize: () => void;
  fileCount: number;
  isResizing: boolean;
  sampleWidth?: number;
  sampleHeight?: number;
}

function computePreview(
  origW: number,
  origH: number,
  settings: ResizeSettings,
): { w: number; h: number } | null {
  if (!origW || !origH) return null;

  if (settings.mode === "percentage") {
    const s = settings.percentage / 100;
    return {
      w: Math.max(1, Math.round(origW * s)),
      h: Math.max(1, Math.round(origH * s)),
    };
  }

  let tw = settings.width || origW;
  let th = settings.height || origH;

  if (settings.maintainAspectRatio && settings.mode === "pixels") {
    const ar = origW / origH;
    if (settings.width && !settings.height) {
      th = Math.round(tw / ar);
    } else if (settings.height && !settings.width) {
      tw = Math.round(th * ar);
    } else {
      const scale = Math.min(tw / origW, th / origH);
      tw = Math.round(origW * scale);
      th = Math.round(origH * scale);
    }
  }

  if (
    !settings.maintainAspectRatio &&
    settings.width > 0 &&
    settings.height > 0 &&
    settings.fitMode === "contain"
  ) {
    const scale = Math.min(tw / origW, th / origH);
    tw = Math.max(1, Math.round(origW * scale));
    th = Math.max(1, Math.round(origH * scale));
  }

  if (settings.doNotEnlarge) {
    tw = Math.min(tw, origW);
    th = Math.min(th, origH);
  }

  return { w: Math.max(1, tw), h: Math.max(1, th) };
}

export function ResizePanel({
  settings,
  onSettingsChange,
  onResize,
  fileCount,
  isResizing,
  sampleWidth,
  sampleHeight,
}: ResizePanelProps) {
  const t = useTranslations("resizer");
  const preview = computePreview(
    sampleWidth ?? 0,
    sampleHeight ?? 0,
    settings,
  );

  const update = (partial: Partial<ResizeSettings>) =>
    onSettingsChange({ ...settings, ...partial });

  const platforms = [...new Set(socialPresets.map((p) => p.platform))];

  const modeLabels: Record<ResizeMode, string> = {
    pixels: t("panel.byPixels"),
    percentage: t("panel.byPercentage"),
    social: t("panel.socialMedia"),
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Mode toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {(["pixels", "percentage", "social"] as ResizeMode[]).map((m) => (
          <button
            key={m}
            onClick={() => update({ mode: m })}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              settings.mode === m
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      {/* Pixel controls */}
      {settings.mode === "pixels" && (
        <div className="space-y-3">
          {/* Scale slider */}
          {sampleWidth && sampleHeight ? (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("panel.quick")}
                </span>
                {percentagePresets.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      const w = Math.max(1, Math.round(sampleWidth * p / 100));
                      const h = Math.max(1, Math.round(sampleHeight * p / 100));
                      update({ width: w, height: h, percentage: p });
                    }}
                    className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                      settings.percentage === (settings.width && sampleWidth ? Math.round(settings.width / sampleWidth * 100) : 0) && Math.round(settings.width / sampleWidth * 100) === p
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <div>
                {(() => {
                  const currentScale = settings.width
                    ? Math.round((settings.width / sampleWidth) * 100)
                    : 100;
                  return (
                    <>
                      <div className="mb-2 flex items-baseline justify-between">
                        <label className="text-sm font-medium">
                          {t("panel.scale", { value: currentScale })}
                        </label>
                        {preview && (
                          <span className="text-xs text-muted-foreground">
                            {preview.w} &times; {preview.h} px
                          </span>
                        )}
                      </div>
                      <Slider
                        value={[currentScale]}
                        onValueChange={([v]) => {
                          const w = Math.max(1, Math.round(sampleWidth * v / 100));
                          const h = Math.max(1, Math.round(sampleHeight * v / 100));
                          update({ width: w, height: h });
                        }}
                        min={1}
                        max={200}
                        step={1}
                      />
                    </>
                  );
                })()}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-end gap-4">
            <div className="w-36">
              <label className="mb-1 block text-sm font-medium">
                {t("panel.widthPx")}
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                value={settings.width || ""}
                onChange={(e) =>
                  update({ width: parseInt(e.target.value) || 0 })
                }
                placeholder={sampleWidth ? String(sampleWidth) : "Width"}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>

            <span className="pb-2 text-muted-foreground">&times;</span>

            <div className="w-36">
              <label className="mb-1 block text-sm font-medium">
                {t("panel.heightPx")}
              </label>
              <input
                type="number"
                min={1}
                max={10000}
                value={settings.height || ""}
                onChange={(e) =>
                  update({ height: parseInt(e.target.value) || 0 })
                }
                placeholder={sampleHeight ? String(sampleHeight) : "Height"}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.maintainAspectRatio}
                onChange={(e) =>
                  update({ maintainAspectRatio: e.target.checked })
                }
                className="rounded"
              />
              {t("panel.maintainAspectRatio")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={settings.doNotEnlarge}
                onChange={(e) => update({ doNotEnlarge: e.target.checked })}
                className="rounded"
              />
              {t("panel.doNotEnlarge")}
            </label>
          </div>
        </div>
      )}

      {/* Social media presets */}
      {settings.mode === "social" && (
        <div className="space-y-4">
          {platforms.map((platform) => {
            const presets = socialPresets.filter(
              (p) => p.platform === platform,
            );
            return (
              <div key={platform}>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  {platform}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => {
                    const isActive =
                      settings.width === preset.width &&
                      settings.height === preset.height;
                    return (
                      <button
                        key={`${preset.platform}-${preset.label}`}
                        onClick={() =>
                          update({
                            width: preset.width,
                            height: preset.height,
                            maintainAspectRatio: false,
                            fitMode: "cover",
                          })
                        }
                        className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                          isActive
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className="font-medium">{preset.label}</span>
                        <span className="ml-2 font-mono text-xs text-muted-foreground">
                          {preset.width}&times;{preset.height}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Fit mode selector */}
          {settings.width > 0 && settings.height > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                {t("panel.howToFit")}
              </label>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    {
                      value: "cover",
                      label: t("panel.fillCrop"),
                      hint: t("panel.fillCropHint"),
                      icon: "/images/fill-and-crop.png",
                    },
                    {
                      value: "contain",
                      label: t("panel.fitInside"),
                      hint: t("panel.fitInsideHint"),
                      icon: "/images/fit-inside.png",
                    },
                    {
                      value: "stretch",
                      label: t("panel.stretch"),
                      hint: t("panel.stretchHint"),
                      icon: "/images/stretch.png",
                    },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() =>
                      update({ fitMode: opt.value as FitMode })
                    }
                    className={`flex w-[130px] flex-col items-center gap-1.5 rounded-lg border p-2 text-center transition-colors ${
                      settings.fitMode === opt.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={opt.icon}
                      alt={opt.label}
                      className="h-16 w-16"
                    />
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-[11px] leading-tight text-muted-foreground">
                      {opt.hint}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("panel.selected")}{" "}
                <span className="font-medium text-foreground">
                  {settings.width} &times; {settings.height}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Percentage controls */}
      {settings.mode === "percentage" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {t("panel.quick")}
            </span>
            {percentagePresets.map((p) => (
              <button
                key={p}
                onClick={() => update({ percentage: p })}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  settings.percentage === p
                    ? "border-primary bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                {p}%
              </button>
            ))}
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <label className="text-sm font-medium">
                {t("panel.scale", { value: settings.percentage })}
              </label>
              {preview && (
                <span className="text-xs text-muted-foreground">
                  {preview.w} &times; {preview.h} px
                </span>
              )}
            </div>
            <Slider
              value={[settings.percentage]}
              onValueChange={([v]) => update({ percentage: v })}
              min={1}
              max={200}
              step={1}
            />
          </div>
        </div>
      )}

      {/* Quality slider */}
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <label className="text-sm font-medium">
            {t("panel.quality", { value: settings.quality })}
          </label>
          <span className="text-xs text-muted-foreground">
            {t("panel.qualityHint")}
          </span>
        </div>
        <Slider
          value={[settings.quality]}
          onValueChange={([v]) => update({ quality: v })}
          min={1}
          max={100}
          step={1}
        />
      </div>

      {/* Preview + Resize button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {preview && sampleWidth && sampleHeight && (
          <p className="text-sm text-muted-foreground">
            {sampleWidth} &times; {sampleHeight}
            {" \u2192 "}
            <span className="font-medium text-foreground">
              {preview.w} &times; {preview.h}
            </span>
            {fileCount > 1 && (
              <span className="ml-1 text-xs">
                {t("panel.sameSettings", { count: fileCount })}
              </span>
            )}
          </p>
        )}

        <Button
          onClick={onResize}
          disabled={fileCount === 0 || isResizing}
          size="lg"
          className="ml-auto"
        >
          {isResizing
            ? t("panel.resizing")
            : t("panel.resizeBtn", { count: fileCount })}
        </Button>
      </div>
    </div>
  );
}
