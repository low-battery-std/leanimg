"use client";

import dynamic from "next/dynamic";

const ImageCropper = dynamic(
  () =>
    import("./cropper").then((m) => ({
      default: m.ImageCropper,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-12 text-muted-foreground">
        Loading cropper...
      </div>
    ),
  },
);

export function CropperLoader() {
  return <ImageCropper />;
}
