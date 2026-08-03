"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { CropperDropzone } from "./cropper-dropzone";
import {
  CropPanel,
  getAspectRatioValue,
  type AspectRatioPreset,
} from "./crop-panel";
import { CropperResultCard } from "./cropper-result-card";
import { cropImage } from "@/lib/crop/engine";
import { generateId } from "@/lib/utils/file-helpers";
import { trackEvent } from "@/lib/analytics";
import type { CropFileEntry } from "@/lib/crop/types";

async function loadNaturalDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  bitmap.close();
  return { width, height };
}

function computeDefaultCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect?: number,
): Crop {
  if (aspect) {
    return centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
      mediaWidth,
      mediaHeight,
    );
  }
  return { unit: "%", x: 5, y: 5, width: 90, height: 90 };
}

export function ImageCropper() {
  const tErrors = useTranslations("errors");
  const [entry, setEntry] = useState<CropFileEntry | null>(null);
  const [aspectPreset, setAspectPreset] = useState<AspectRatioPreset>("free");
  const [customRatio, setCustomRatio] = useState<number | undefined>();
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isCropping, setIsCropping] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const aspectRatio = getAspectRatioValue(aspectPreset, customRatio);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(computeDefaultCrop(width, height, aspectRatio));
    },
    [aspectRatio],
  );

  const setFile = useCallback((file: File) => {
    setEntry((prev) => {
      if (prev?.preview) URL.revokeObjectURL(prev.preview);
      return null;
    });
    trackEvent("file_upload", {
      tool: "crop-image",
      file_count: 1,
      total_size_kb: Math.round(file.size / 1024),
    });

    loadNaturalDimensions(file).then((dims) => {
      setEntry({
        id: generateId(),
        file,
        preview: URL.createObjectURL(file),
        naturalWidth: dims.width,
        naturalHeight: dims.height,
        status: "pending",
      });
      setCrop(undefined);
      setCompletedCrop(undefined);
    });
  }, []);

  const clearFile = useCallback(() => {
    setEntry((prev) => {
      if (prev?.preview) URL.revokeObjectURL(prev.preview);
      return null;
    });
    setCrop(undefined);
    setCompletedCrop(undefined);
  }, []);

  const handlePresetChange = useCallback(
    (preset: AspectRatioPreset, ratio?: number) => {
      setAspectPreset(preset);
      if (preset === "custom") setCustomRatio(ratio);

      const newAspect = getAspectRatioValue(preset, ratio);
      if (imgRef.current) {
        const { width, height } = imgRef.current;
        setCrop(computeDefaultCrop(width, height, newAspect));
      }
      setCompletedCrop(undefined);

      setEntry((prev) =>
        prev && prev.status === "done"
          ? { ...prev, status: "pending", result: undefined, cropRegion: undefined }
          : prev ? { ...prev, cropRegion: undefined } : null,
      );
    },
    [],
  );

  const doCrop = useCallback(async () => {
    if (!entry || entry.status === "done") return;

    setIsCropping(true);
    setEntry((prev) =>
      prev ? { ...prev, status: "cropping", error: undefined } : null,
    );

    try {
      let region = entry.cropRegion;

      if (!region && completedCrop && imgRef.current) {
        const img = imgRef.current;
        const scaleX = entry.naturalWidth / img.width;
        const scaleY = entry.naturalHeight / img.height;
        region = {
          x: completedCrop.x * scaleX,
          y: completedCrop.y * scaleY,
          width: completedCrop.width * scaleX,
          height: completedCrop.height * scaleY,
        };
      }

      if (!region) {
        const ar = aspectRatio ?? entry.naturalWidth / entry.naturalHeight;
        const imgAr = entry.naturalWidth / entry.naturalHeight;
        let cropW: number;
        let cropH: number;
        if (imgAr > ar) {
          cropH = entry.naturalHeight;
          cropW = cropH * ar;
        } else {
          cropW = entry.naturalWidth;
          cropH = cropW / ar;
        }
        region = {
          x: (entry.naturalWidth - cropW) / 2,
          y: (entry.naturalHeight - cropH) / 2,
          width: cropW,
          height: cropH,
        };
      }

      const result = await cropImage(entry.file, { region, quality: 92 });
      setEntry((prev) =>
        prev ? { ...prev, status: "done", result } : null,
      );
    } catch (err) {
      setEntry((prev) =>
        prev
          ? {
              ...prev,
              status: "error",
              error: err instanceof Error ? err.message : tErrors("cropFailed"),
            }
          : null,
      );
    }

    setIsCropping(false);
  }, [entry, completedCrop, aspectRatio, tErrors]);

  const canCrop = !!entry && (entry.status === "pending" || entry.status === "error");

  return (
    <div className="space-y-6">
      {!entry && <CropperDropzone onFile={setFile} disabled={isCropping} />}

      {entry && (
        <>
          <div className="overflow-hidden rounded-lg border bg-card">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="max-h-[500px] w-full [&_img]:max-h-[500px] [&_img]:w-full [&_img]:object-contain"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={entry.preview}
                alt={entry.file.name}
                onLoad={onImageLoad}
                className="max-h-[500px] w-full object-contain"
              />
            </ReactCrop>
          </div>

          <CropPanel
            selectedPreset={aspectPreset}
            onPresetChange={handlePresetChange}
            onCrop={doCrop}
            isCropping={isCropping}
            canCrop={canCrop}
          />

          <CropperResultCard entry={entry} onRemove={clearFile} />
        </>
      )}
    </div>
  );
}
