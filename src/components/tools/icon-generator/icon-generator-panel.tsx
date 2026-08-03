"use client";

import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { IconGeneratorSettings } from "@/lib/icon-generator/types";

interface IconGeneratorPanelProps {
  settings: IconGeneratorSettings;
  onSettingsChange: (settings: IconGeneratorSettings) => void;
  onGenerate: () => void;
  hasFile: boolean;
  isGenerating: boolean;
}

export function IconGeneratorPanel({
  settings,
  onSettingsChange,
  onGenerate,
  hasFile,
  isGenerating,
}: IconGeneratorPanelProps) {
  const t = useTranslations("iconGenerator");

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap gap-6">
        <div className="min-w-[200px] flex-1 space-y-4">
          <h3 className="text-sm font-semibold">{t("panel.iconSettings")}</h3>

          <div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">
                {t("panel.bgColor")}
              </label>
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) =>
                  onSettingsChange({
                    ...settings,
                    backgroundColor: e.target.value,
                  })
                }
                className="h-8 w-12 cursor-pointer rounded border"
              />
              <span className="text-xs text-muted-foreground">
                {settings.backgroundColor}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("panel.bgColorHint")}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("panel.margin", { value: settings.margin })}
            </label>
            <Slider
              value={[settings.margin]}
              onValueChange={([v]) =>
                onSettingsChange({ ...settings, margin: v })
              }
              min={0}
              max={30}
              step={1}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t("panel.marginHint")}
            </p>
          </div>
        </div>

        <div className="min-w-[200px] flex-1 space-y-4">
          <h3 className="text-sm font-semibold">
            {t("panel.manifestSettings")}
          </h3>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("panel.appName")}
            </label>
            <input
              type="text"
              value={settings.appName}
              onChange={(e) =>
                onSettingsChange({ ...settings, appName: e.target.value })
              }
              placeholder={t("panel.appNamePlaceholder")}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("panel.shortName")}
            </label>
            <input
              type="text"
              value={settings.shortName}
              onChange={(e) =>
                onSettingsChange({ ...settings, shortName: e.target.value })
              }
              placeholder={t("panel.shortNamePlaceholder")}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">
                  {t("panel.themeColor")}
                </label>
                <input
                  type="color"
                  value={settings.themeColor}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      themeColor: e.target.value,
                    })
                  }
                  className="h-8 w-12 cursor-pointer rounded border"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("panel.themeColorHint")}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">
                  {t("panel.manifestBgColor")}
                </label>
                <input
                  type="color"
                  value={settings.manifestBgColor}
                  onChange={(e) =>
                    onSettingsChange({
                      ...settings,
                      manifestBgColor: e.target.value,
                    })
                  }
                  className="h-8 w-12 cursor-pointer rounded border"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("panel.manifestBgColorHint")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={onGenerate}
        disabled={!hasFile || isGenerating}
        size="lg"
        className="w-full sm:w-auto"
      >
        {isGenerating ? t("panel.generating") : t("panel.generateBtn")}
      </Button>
    </div>
  );
}
