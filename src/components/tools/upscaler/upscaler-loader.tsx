"use client";

import dynamic from "next/dynamic";

const Upscaler = dynamic(
  () =>
    import("./upscaler").then((m) => ({
      default: m.Upscaler,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-12 text-muted-foreground">
        Loading image upscaler...
      </div>
    ),
  },
);

export function UpscalerLoader() {
  return <Upscaler />;
}
