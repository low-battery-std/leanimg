"use client";

import dynamic from "next/dynamic";

const ImageResizer = dynamic(
  () =>
    import("./image-resizer").then((m) => ({
      default: m.ImageResizer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-12 text-muted-foreground">
        Loading resizer...
      </div>
    ),
  },
);

export function ResizerLoader() {
  return <ImageResizer />;
}
