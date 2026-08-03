"use client";

import dynamic from "next/dynamic";

const BgRemover = dynamic(
  () =>
    import("./bg-remover").then((m) => ({
      default: m.BgRemover,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-12 text-muted-foreground">
        Loading background remover...
      </div>
    ),
  },
);

export function BgRemoverLoader() {
  return <BgRemover />;
}
