"use client";

import dynamic from "next/dynamic";

const ImageCompressor = dynamic(
  () =>
    import("./compressor").then((m) => ({
      default: m.ImageCompressor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-12 text-muted-foreground">
        Loading compressor...
      </div>
    ),
  },
);

export function CompressorLoader() {
  return <ImageCompressor />;
}
