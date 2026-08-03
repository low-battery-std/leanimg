import type { LucideIcon } from "lucide-react";
import { FileArchive, Scaling, ArrowRightLeft, Crop, Image, Eraser, ArrowUpFromLine } from "lucide-react";

export interface ToolDef {
  slug: string;
  title: string;
  description: string;
  href: string;
  available: boolean;
  icon: LucideIcon;
}

export const tools: ToolDef[] = [
  {
    slug: "compress-image",
    title: "Image Compressor",
    description:
      "Compress JPG, PNG, WebP, and AVIF images at optimal quality in seconds.",
    href: "/compress-image",
    available: true,
    icon: FileArchive,
  },
  {
    slug: "resize-image",
    title: "Image Resizer",
    description:
      "Resize images to exact dimensions or percentages. Bulk resize in seconds.",
    href: "/resize-image",
    available: true,
    icon: Scaling,
  },
  {
    slug: "crop-image",
    title: "Image Cropper",
    description: "Crop images to exact dimensions or aspect ratios. Free, instant, no upload.",
    href: "/crop-image",
    available: true,
    icon: Crop,
  },
  {
    slug: "convert",
    title: "Image Converter",
    description: "Convert between JPG, PNG, WebP, AVIF, and more. Free, instant, no upload.",
    href: "/convert",
    available: true,
    icon: ArrowRightLeft,
  },
  {
    slug: "icon-generator",
    title: "Favicon Generator",
    description: "Generate favicons and app icons from any image. ICO, PNG, Apple Touch, Android Chrome.",
    href: "/icon-generator",
    available: true,
    icon: Image,
  },
  {
    slug: "remove-background",
    title: "Background Remover",
    description: "Remove image backgrounds instantly with AI. Free, no sign-up, works in your browser.",
    href: "/remove-background",
    available: true,
    icon: Eraser,
  },
  {
    slug: "upscale-image",
    title: "Image Upscaler",
    description: "Upscale images 2x or 4x with AI. Enhance resolution with Real-ESRGAN — free, no sign-up.",
    href: "/upscale-image",
    available: true,
    icon: ArrowUpFromLine,
  },
];
