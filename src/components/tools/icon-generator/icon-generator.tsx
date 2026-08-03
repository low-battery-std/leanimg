"use client";

import { useState, useCallback } from "react";
import { IconDropzone } from "./icon-generator-dropzone";
import { IconGeneratorPanel } from "./icon-generator-panel";
import { IconPreview } from "./icon-generator-preview";
import { IconResult } from "./icon-generator-result";
import { generateIcons } from "@/lib/icon-generator/engine";
import { trackEvent } from "@/lib/analytics";
import {
  DEFAULT_SETTINGS,
  type IconGeneratorSettings,
  type IconGeneratorResult,
} from "@/lib/icon-generator/types";

export function IconGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [settings, setSettings] = useState<IconGeneratorSettings>({
    ...DEFAULT_SETTINGS,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<IconGeneratorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    setPreview(URL.createObjectURL(f));

    trackEvent("file_upload", {
      tool: "icon-generator",
      file_count: 1,
      total_size_kb: Math.round(f.size / 1024),
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!file) return;
    setIsGenerating(true);
    setError(null);
    try {
      const r = await generateIcons(file, settings);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }, [file, settings]);

  const handleReset = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  }, [preview]);

  if (!file) {
    return <IconDropzone onFile={handleFile} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-lg border bg-card p-3">
        {preview && (
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt={file.name}
              className="h-full w-full object-contain"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {Math.round(file.size / 1024)} KB
          </p>
        </div>
        <button
          onClick={handleReset}
          className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground"
          aria-label="Remove file"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <IconGeneratorPanel
        settings={settings}
        onSettingsChange={setSettings}
        onGenerate={handleGenerate}
        hasFile={true}
        isGenerating={isGenerating}
      />

      <IconPreview file={file} settings={settings} />

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      {result && <IconResult result={result} onReset={handleReset} />}
    </div>
  );
}
