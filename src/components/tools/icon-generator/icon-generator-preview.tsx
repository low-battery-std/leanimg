"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { generatePreview } from "@/lib/icon-generator/engine";
import type { IconGeneratorSettings } from "@/lib/icon-generator/types";

interface IconPreviewProps {
  file: File;
  settings: IconGeneratorSettings;
}

export function IconPreview({ file, settings }: IconPreviewProps) {
  const t = useTranslations("iconGenerator");
  const [favicon16, setFavicon16] = useState<string | null>(null);
  const [favicon32, setFavicon32] = useState<string | null>(null);
  const [appleIcon, setAppleIcon] = useState<string | null>(null);
  const [androidIcon, setAndroidIcon] = useState<string | null>(null);

  const updatePreviews = useCallback(async () => {
    try {
      const [b16, b32, bApple, bAndroid] = await Promise.all([
        generatePreview(file, 16, settings),
        generatePreview(file, 32, settings),
        generatePreview(file, 180, settings),
        generatePreview(file, 192, settings),
      ]);
      setFavicon16(URL.createObjectURL(b16));
      setFavicon32(URL.createObjectURL(b32));
      setAppleIcon(URL.createObjectURL(bApple));
      setAndroidIcon(URL.createObjectURL(bAndroid));
    } catch {
      /* ignore preview errors */
    }
  }, [file, settings]);

  useEffect(() => {
    updatePreviews();
    return () => {
      [favicon16, favicon32, appleIcon, androidIcon].forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePreviews]);

  const appName =
    settings.appName || settings.shortName || t("preview.defaultAppName");

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold">{t("preview.title")}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Browser Tab (shows theme_color as address bar tint) */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {t("preview.browserTab")}
          </p>
          <div className="overflow-hidden rounded-lg border">
            <div
              className="flex items-end gap-0 px-2 pt-2"
              style={{ backgroundColor: settings.themeColor }}
            >
              <div className="flex max-w-[200px] items-center gap-2 rounded-t-md border border-b-0 bg-background px-3 py-1.5">
                {favicon16 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={favicon16}
                    alt="Favicon preview"
                    width={16}
                    height={16}
                    className="shrink-0"
                  />
                )}
                <span className="truncate text-xs">{appName}</span>
                <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
                  ×
                </span>
              </div>
              <div className="flex-1" />
            </div>
            <div className="border-t bg-background px-3 py-1.5">
              <div className="rounded-sm bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                example.com
              </div>
            </div>
          </div>
        </div>

        {/* Google Search Result */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {t("preview.googleResult")}
          </p>
          <div className="rounded-lg border bg-background p-3">
            <div className="flex items-center gap-2">
              {favicon32 && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={favicon32}
                    alt="Favicon"
                    width={18}
                    height={18}
                    className="rounded-sm"
                  />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{appName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  example.com
                </p>
              </div>
            </div>
            <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
              {appName} — {t("preview.sampleTitle")}
            </p>
          </div>
        </div>

        {/* iOS Home Screen */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {t("preview.iosHomeScreen")}
          </p>
          <div className="flex flex-col items-center gap-1 rounded-lg border bg-gradient-to-b from-muted/30 to-muted/60 p-4">
            {appleIcon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={appleIcon}
                alt="iOS icon preview"
                width={60}
                height={60}
                className="rounded-[13.5px] shadow-sm"
              />
            )}
            <span className="mt-0.5 text-[11px]">{appName}</span>
          </div>
        </div>

        {/* Android Home Screen + Splash (shows background_color) */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {t("preview.androidHomeScreen")}
          </p>
          <div
            className="flex flex-col items-center gap-1 rounded-lg border p-4"
            style={{ backgroundColor: settings.manifestBgColor }}
          >
            {androidIcon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={androidIcon}
                alt="Android icon preview"
                width={48}
                height={48}
                className="rounded-full shadow-sm"
              />
            )}
            <span className="mt-0.5 text-[11px]">{appName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
