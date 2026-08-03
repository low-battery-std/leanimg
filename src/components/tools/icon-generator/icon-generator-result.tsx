"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { downloadAsZip } from "@/lib/utils/file-helpers";
import { formatFileSize } from "@/lib/utils/file-helpers";
import type { IconGeneratorResult } from "@/lib/icon-generator/types";

interface IconResultProps {
  result: IconGeneratorResult;
  onReset: () => void;
}

export function IconResult({ result, onReset }: IconResultProps) {
  const t = useTranslations("iconGenerator");
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    const files = [
      ...result.icons.map((icon) => ({ name: icon.name, blob: icon.blob })),
      { name: "site.webmanifest", blob: result.manifest },
    ];
    await downloadAsZip(files, "favicon-package", "icon-generator");
  };

  const handleCopySnippet = async () => {
    await navigator.clipboard.writeText(result.htmlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <h3 className="text-sm font-semibold">{t("result.title")}</h3>

      <div className="space-y-1">
        {result.icons.map((icon) => (
          <div
            key={icon.name}
            className="flex items-center justify-between rounded px-2 py-1 text-sm odd:bg-muted/50"
          >
            <span className="font-mono text-xs">{icon.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(icon.blob.size)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between rounded px-2 py-1 text-sm odd:bg-muted/50">
          <span className="font-mono text-xs">site.webmanifest</span>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(result.manifest.size)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="lg" onClick={handleDownload}>
          {t("result.downloadZip")}
        </Button>
        <Button variant="outline" onClick={onReset}>
          {t("result.newImage")}
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">{t("result.htmlSnippetLabel")}</p>
        <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-3 text-xs">
          <code>{result.htmlSnippet}</code>
        </pre>
        <Button variant="ghost" size="sm" onClick={handleCopySnippet}>
          {copied ? t("result.copied") : t("result.copySnippet")}
        </Button>
      </div>
    </div>
  );
}
