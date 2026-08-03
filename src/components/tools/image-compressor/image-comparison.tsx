"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

const ORIGINAL_SRC = "/pexels-quintingellar-large.jpg";
const COMPRESSED_SRC = "/pexels-quintingellar-compressed.avif";
const ORIGINAL_SIZE = "1.7 MB";
const COMPRESSED_SIZE = "328 KB";
const ALT_BASE = "New York City skyline at sunset";

export function ImageComparison() {
  const t = useTranslations("compressor");
  const [position, setPosition] = useState(50);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPosition(Number(e.target.value));
    },
    [],
  );

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-2 text-xl font-semibold">
        {t("imageComparison.title")}
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        {t("imageComparison.description")}
      </p>

      <figure className="relative select-none overflow-hidden rounded-lg">
        {/* Bottom layer: compressed */}
        <img
          src={COMPRESSED_SRC}
          alt={`${ALT_BASE} — compressed AVIF, ${COMPRESSED_SIZE}`}
          className="block w-full"
          loading="lazy"
          decoding="async"
          draggable={false}
        />

        {/* Top layer: original, clipped */}
        <img
          src={ORIGINAL_SRC}
          alt={`${ALT_BASE} — original JPG, ${ORIGINAL_SIZE}`}
          className="pointer-events-none absolute inset-0 block h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          loading="lazy"
          decoding="async"
          draggable={false}
        />

        {/* Handle line */}
        <div
          className="pointer-events-none absolute inset-y-0"
          style={{ left: `${position}%` }}
          aria-hidden="true"
        >
          <div className="absolute inset-y-0 -translate-x-1/2 w-0.5 bg-white shadow-[0_0_4px_rgba(0,0,0,0.5)]" />
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black/50 text-white backdrop-blur-sm">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 10L3 10M3 10L5 8M3 10L5 12M14 10L17 10M17 10L15 8M17 10L15 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Labels */}
        <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
          {t("imageComparison.original")} &mdash; {ORIGINAL_SIZE}
        </span>
        <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
          {t("imageComparison.compressed")} &mdash; {COMPRESSED_SIZE}
        </span>

        {/* Range input (accessible, keyboard-navigable) */}
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={handleChange}
          aria-label={t("imageComparison.sliderLabel")}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />

        <figcaption className="sr-only">
          Side-by-side comparison of an original {ORIGINAL_SIZE} JPG and a{" "}
          {COMPRESSED_SIZE} AVIF compressed with LeanImg, showing no visible
          quality loss.
        </figcaption>
      </figure>
    </section>
  );
}
