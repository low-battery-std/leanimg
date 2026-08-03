"use client";

import dynamic from "next/dynamic";

const IconGenerator = dynamic(
  () =>
    import("./icon-generator").then((m) => ({
      default: m.IconGenerator,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-12 text-muted-foreground">
        Loading icon generator...
      </div>
    ),
  },
);

export function IconGeneratorLoader() {
  return <IconGenerator />;
}
