"use client";

import dynamic from "next/dynamic";

const ImageConverter = dynamic(
  () =>
    import("./converter").then((m) => ({
      default: m.ImageConverter,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-12 text-muted-foreground">
        Loading converter...
      </div>
    ),
  },
);

interface ConverterLoaderProps {
  sourceFormat: string;
  targetFormat: string;
}

export function ConverterLoader({
  sourceFormat,
  targetFormat,
}: ConverterLoaderProps) {
  return (
    <ImageConverter sourceFormat={sourceFormat} targetFormat={targetFormat} />
  );
}
