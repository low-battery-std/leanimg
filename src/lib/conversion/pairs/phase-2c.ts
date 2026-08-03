import type { ConversionPair } from "../types";

export const phase2cPairs: ConversionPair[] = [
  {
    sourceFormat: "tiff",
    targetFormat: "jpeg",
    slug: "tiff-to-jpg",
    h1: "Convert TIFF to JPG — Free, Private, No Upload",
    whyConvert:
      "TIFF files are common in scanning, photography, and print workflows, but they are impractically large for sharing, emailing, or web use. A single TIFF scan can be 20–50 MB. Converting to JPG shrinks the file to a fraction of that size while keeping the photo looking great for everyday use.\n\nJPG is the universal photo format accepted by every email client, social network, and web platform. Converting your TIFF scans and photos to JPG makes them easy to share and upload without worrying about file size limits or compatibility.\n\nLeanImg converts TIFF to JPG entirely in your browser. Your files never leave your device — no upload, no server processing, no data stored anywhere. This is important for scanned documents like contracts, tax forms, and medical records.\n\nFor lossless quality, convert your TIFF to PNG instead. After converting to JPG, compress your images for even smaller files. The default quality of 85 provides an excellent balance between size and visual clarity.",
    comparison: [
      { label: "File Size", source: "Very large", target: "Small" },
      { label: "Transparency", source: "Yes", target: "No" },
      { label: "Compression", source: "Lossless or none", target: "Lossy" },
      { label: "Software Support", source: "Professional tools", target: "Universal" },
      { label: "Best For", source: "Print, scanning", target: "Sharing, web" },
      { label: "Color Depth", source: "Up to 48-bit", target: "24-bit" },
    ],
    faq: [
      {
        question: "How to convert TIFF to JPG?",
        answer:
          "Open LeanImg in any browser and drop your TIFF files into the converter. JPG files are created instantly on your device. The tool is free, requires no sign-up, and your images never leave your device. Batch conversion is supported for multiple files.",
      },
      {
        question: "Is it safe to convert TIFF to JPG online?",
        answer:
          "Yes. LeanImg processes your files entirely in the browser. Nothing is uploaded, nothing is stored, and your scanned documents remain private on your device. The local processing makes it safe for sensitive documents.",
      },
      {
        question: "How to convert TIFF to JPG on Windows?",
        answer:
          "Open Chrome, Edge, or Firefox on your PC and visit LeanImg. Drop your TIFF files into the converter and download JPGs instantly. No software to install, no sign-up needed. Works in any modern browser on Windows.",
      },
    ],
    crossLinks: [
      { text: "Compress your JPG", href: "/compress-image" },
      { text: "TIFF to PNG", href: "/convert/tiff-to-png" },
    ],
  },
  {
    sourceFormat: "tiff",
    targetFormat: "png",
    slug: "tiff-to-png",
    h1: "Convert TIFF to PNG — Free, Private, No Upload",
    whyConvert:
      "When you need to convert a TIFF file while preserving every pixel of detail, PNG is the right target. PNG uses lossless compression that keeps your image quality intact while reducing file size compared to uncompressed TIFF. This is ideal for scanned documents, medical images, and professional graphics that need exact pixel reproduction.\n\nPNG also supports transparency, which TIFF may include. Your transparent areas will be preserved in the converted file. PNG works in every browser, every editor, and every operating system — far wider compatibility than TIFF.\n\nLeanImg converts your TIFF files to PNG right in your browser without uploading them anywhere. Your images stay on your device throughout the entire process — completely private, free, and instant.\n\nIf file size matters more than pixel-perfect quality, consider TIFF to JPG for much smaller files. After converting to PNG, you can compress your PNG for additional savings while keeping lossless quality.",
    comparison: [
      { label: "File Size", source: "Very large", target: "Large (but smaller)" },
      { label: "Transparency", source: "Yes", target: "Yes" },
      { label: "Compression", source: "Lossless or none", target: "Lossless" },
      { label: "Software Support", source: "Professional tools", target: "Universal" },
      { label: "Best For", source: "Print, archival", target: "Web, editing" },
      { label: "Quality", source: "Exact pixels", target: "Exact pixels" },
    ],
    faq: [
      {
        question: "How to convert TIFF to PNG?",
        answer:
          "Visit LeanImg in any browser and drop your TIFF files into the converter. PNG files are generated instantly on your device. It is free, works without sign-up, and your files are never uploaded. You can convert multiple TIFF files at once.",
      },
      {
        question: "Is it safe to convert TIFF to PNG online?",
        answer:
          "Yes. LeanImg processes everything in your browser locally. No files are uploaded to any server, nothing is stored remotely, and your images remain completely private. Safe for scanned contracts, medical records, and other sensitive documents.",
      },
      {
        question: "How to convert TIFF to PNG on Mac?",
        answer:
          "Open any browser on your Mac and go to LeanImg. Drag your TIFF files into the converter and download PNG versions in seconds. No app to install, no account needed. Works in Safari, Chrome, and Firefox on macOS.",
      },
    ],
    crossLinks: [
      { text: "Compress your PNG", href: "/compress-image" },
      { text: "TIFF to JPG", href: "/convert/tiff-to-jpg" },
    ],
  },
  {
    sourceFormat: "bmp",
    targetFormat: "jpeg",
    slug: "bmp-to-jpg",
    h1: "Convert BMP to JPG — Free, Private, No Upload",
    whyConvert:
      "BMP files are uncompressed bitmaps that take up enormous amounts of space. A single BMP screenshot can be 5–10 MB, while the same image as a JPG would be under 500 KB. Converting BMP to JPG dramatically reduces file size, making images practical to share, email, and store.\n\nBMP was common in older Windows applications and some specialized software. Today, there is rarely a reason to keep images in BMP format. JPG provides excellent photo quality at a fraction of the file size, and it works everywhere.\n\nLeanImg converts your BMP files to JPG entirely in your browser. No upload, no server processing, no privacy risk — your files stay on your device from start to finish. Free and instant.\n\nIf you need lossless quality, convert to PNG instead. After converting to JPG, you can compress your images further with our compressor. The default quality setting of 85 is a good balance between size and clarity.",
    comparison: [
      { label: "File Size", source: "Very large (uncompressed)", target: "Small" },
      { label: "Transparency", source: "No", target: "No" },
      { label: "Compression", source: "None", target: "Lossy" },
      { label: "Software Support", source: "Windows, legacy", target: "Universal" },
      { label: "Best For", source: "Legacy systems", target: "Photos, sharing" },
      { label: "Quality", source: "Exact pixels", target: "Near-original" },
    ],
    faq: [
      {
        question: "How to convert BMP to JPG?",
        answer:
          "Open LeanImg in any browser and drop your BMP files into the converter. JPG files are created instantly on your device. Completely free, no sign-up, and your images never leave your device. Multiple BMP files can be converted at once.",
      },
      {
        question: "Is it safe to convert BMP to JPG online?",
        answer:
          "Yes. LeanImg processes files entirely in your browser. Nothing is uploaded, nothing is stored remotely, and your images stay private on your device. The conversion runs locally using browser technology.",
      },
      {
        question: "How to convert BMP to JPG on Windows?",
        answer:
          "Open Chrome, Edge, or Firefox and visit LeanImg. Drop your BMP files into the converter and download JPGs instantly. No software to install, no account needed. Works on any Windows version with a modern browser.",
      },
    ],
    crossLinks: [
      { text: "Compress your JPG", href: "/compress-image" },
      { text: "BMP to PNG", href: "/convert/bmp-to-png" },
    ],
  },
  {
    sourceFormat: "bmp",
    targetFormat: "png",
    slug: "bmp-to-png",
    h1: "Convert BMP to PNG — Free, Private, No Upload",
    whyConvert:
      "BMP files are uncompressed and take up far more disk space than necessary. Converting to PNG gives you lossless compression — every pixel stays exactly the same, but the file is typically 3–5 times smaller. PNG also adds transparency support that BMP lacks.\n\nPNG is the modern standard for lossless images. It works in every browser, every editor, and every operating system. If you have screenshots, diagrams, or graphics in BMP format, PNG is the natural upgrade with no quality compromise.\n\nLeanImg handles the conversion right in your browser. Your files never leave your device — no upload, no cloud processing, no data collection. Free, instant, and private.\n\nFor even smaller files where some quality loss is acceptable, convert to JPG instead. After converting to PNG, you can also compress your PNG for additional optimization while keeping lossless quality.",
    comparison: [
      { label: "File Size", source: "Very large (uncompressed)", target: "Much smaller" },
      { label: "Transparency", source: "No", target: "Yes (alpha channel)" },
      { label: "Compression", source: "None", target: "Lossless" },
      { label: "Software Support", source: "Windows, legacy", target: "Universal" },
      { label: "Best For", source: "Legacy systems", target: "Graphics, screenshots" },
      { label: "Quality", source: "Exact pixels", target: "Exact pixels" },
    ],
    faq: [
      {
        question: "How to convert BMP to PNG?",
        answer:
          "Visit LeanImg in any browser and drop your BMP files into the converter. PNG files are generated instantly on your device. Free, no sign-up, and your images are never uploaded to any server. Batch conversion for multiple files is supported.",
      },
      {
        question: "Is it safe to convert BMP to PNG online?",
        answer:
          "Yes. LeanImg converts files locally in your browser. No uploads, no server storage, and your images remain private on your device throughout the process. It is as safe as editing files on your own computer.",
      },
      {
        question: "How to convert BMP to PNG on Mac?",
        answer:
          "Open any browser on your Mac and go to LeanImg. Drag your BMP files into the converter and download PNG versions in seconds. No software installation needed. Works in Safari, Chrome, and Firefox on macOS.",
      },
    ],
    crossLinks: [
      { text: "Compress your PNG", href: "/compress-image" },
      { text: "BMP to JPG", href: "/convert/bmp-to-jpg" },
    ],
  },
  {
    sourceFormat: "gif",
    targetFormat: "png",
    slug: "gif-to-png",
    h1: "Convert GIF to PNG — Free, Private, No Upload",
    whyConvert:
      "GIF is limited to 256 colors, which can make photos and detailed graphics look banded and low-quality. Converting to PNG gives you full 24-bit color (16.7 million colors) plus lossless compression and transparency. The result is a sharper, more accurate image.\n\nPNG is the better choice for static images like logos, icons, screenshots, and graphics that were originally saved as GIF. The file may be slightly larger, but the quality improvement is significant for anything beyond simple animations.\n\nNote that this conversion captures the first frame of animated GIFs. If you need the animation preserved, GIF should remain in its original format.\n\nLeanImg converts GIF to PNG entirely in your browser. Your files never leave your device — no upload, no server, no account needed. Free and instant.\n\nFor smaller files, convert to JPG instead, though you will lose transparency. After converting, compress your PNG for optimized file size.",
    comparison: [
      { label: "Colors", source: "256 max", target: "16.7 million" },
      { label: "Transparency", source: "Binary (on/off)", target: "Full alpha" },
      { label: "Animation", source: "Yes", target: "No (first frame)" },
      { label: "Compression", source: "Lossless (LZW)", target: "Lossless (Deflate)" },
      { label: "Best For", source: "Simple animations", target: "Static graphics" },
      { label: "File Size", source: "Small for simple", target: "Slightly larger" },
    ],
    faq: [
      {
        question: "How to convert GIF to PNG?",
        answer:
          "Open LeanImg in any browser and drop your GIF files into the converter. PNG files are created instantly on your device. It is free, no sign-up needed, and your images are never uploaded. You can convert multiple GIF files at once.",
      },
      {
        question: "Is it safe to convert GIF to PNG online?",
        answer:
          "Yes. LeanImg processes files entirely in your browser. Nothing is uploaded, nothing is stored, and your images stay private. The local conversion is as secure as working with files directly on your computer.",
      },
      {
        question: "How to convert GIF to PNG on iPhone?",
        answer:
          "Open Safari on your iPhone and go to LeanImg. Tap the upload area to select your GIF files. PNG versions are created right on your phone. No app to install — it works in your mobile browser on any iPhone.",
      },
    ],
    crossLinks: [
      { text: "Compress your PNG", href: "/compress-image" },
      { text: "GIF to JPG", href: "/convert/gif-to-jpg" },
    ],
  },
  {
    sourceFormat: "gif",
    targetFormat: "jpeg",
    slug: "gif-to-jpg",
    h1: "Convert GIF to JPG — Free, Private, No Upload",
    whyConvert:
      "Need to share a GIF frame as a regular photo? Converting GIF to JPG gives you a standard photo format that works everywhere and often produces a smaller file. JPG is ideal for sharing single frames from GIFs on platforms that do not support GIF display or where you want a clean, static image.\n\nGIF is limited to 256 colors, which can cause visible banding in photos. While JPG does not fix the original color limitation, it produces a standard photo file that is universally compatible with every device and platform.\n\nThis conversion captures the first frame of animated GIFs. The resulting JPG is a static image without animation.\n\nLeanImg converts your GIF files to JPG right in your browser. Your images never leave your device — no upload, no server, no account required. Completely free and instant.\n\nIf you need transparency preserved, convert to PNG instead. After converting, compress your JPG for even smaller files.",
    comparison: [
      { label: "Colors", source: "256 max", target: "16.7 million" },
      { label: "Transparency", source: "Binary (on/off)", target: "No" },
      { label: "Animation", source: "Yes", target: "No (first frame)" },
      { label: "Compression", source: "Lossless (LZW)", target: "Lossy" },
      { label: "Best For", source: "Simple animations", target: "Photos, sharing" },
      { label: "File Size", source: "Varies", target: "Small" },
    ],
    faq: [
      {
        question: "How to convert GIF to JPG?",
        answer:
          "Visit LeanImg in any browser and drop your GIF files into the converter. JPG files are generated instantly. Free, no account needed, and your images are never uploaded to any server. Multiple GIF files can be converted in one batch.",
      },
      {
        question: "Is it safe to convert GIF to JPG online?",
        answer:
          "Yes. LeanImg converts files locally in your browser. No images are uploaded, no data is stored, and everything stays private on your device. The conversion uses browser-native technology for fast, secure processing.",
      },
      {
        question: "How to convert GIF to JPG on Windows?",
        answer:
          "Open Chrome, Edge, or Firefox on your PC and go to LeanImg. Drop your GIF files into the converter and download JPG versions instantly. No software needed, no sign-up. Works on any Windows version with a modern browser.",
      },
    ],
    crossLinks: [
      { text: "Compress your JPG", href: "/compress-image" },
      { text: "GIF to PNG", href: "/convert/gif-to-png" },
    ],
  },
  {
    sourceFormat: "ico",
    targetFormat: "png",
    slug: "ico-to-png",
    h1: "Convert ICO to PNG — Free, Private, No Upload",
    whyConvert:
      "ICO files are Windows icon containers that hold multiple image sizes for desktop icons and favicons. Converting ICO to PNG extracts the highest-resolution image and gives you a standard format that works everywhere — in design tools, web pages, and presentations.\n\nPNG preserves the transparency that icons typically require. The converted image maintains crisp edges and clean transparency, making it ready for use in designs, documentation, or anywhere you need the icon as a regular image.\n\nLeanImg selects the largest, highest-quality image from the ICO container and converts it to PNG. The process runs entirely in your browser — your files never leave your device, no upload needed, no account required. Free and instant.\n\nAfter converting, compress your PNG if you need a smaller file. For web favicons, you might want to resize the output to standard sizes like 32x32 or 64x64 pixels.",
    comparison: [
      { label: "File Type", source: "Icon container", target: "Single image" },
      { label: "Transparency", source: "Yes", target: "Yes" },
      { label: "Multiple Sizes", source: "Yes (bundled)", target: "No (largest extracted)" },
      { label: "Software Support", source: "Windows, browsers", target: "Universal" },
      { label: "Best For", source: "Desktop icons, favicons", target: "General use" },
      { label: "Editability", source: "Specialized tools", target: "Any editor" },
    ],
    faq: [
      {
        question: "How to convert ICO to PNG?",
        answer:
          "Open LeanImg in any browser and drop your ICO files into the converter. PNG files are created instantly on your device. It is free, requires no sign-up, and your files are never uploaded to any server. The largest image in the ICO is extracted.",
      },
      {
        question: "Is it safe to convert ICO to PNG online?",
        answer:
          "Yes. LeanImg processes ICO files locally in your browser. Nothing is uploaded, nothing is stored, and your files remain private on your device. The conversion is completely local and secure.",
      },
      {
        question: "How to convert ICO to PNG on Mac?",
        answer:
          "Open any browser on your Mac and visit LeanImg. Drop your ICO files into the converter and download PNG images instantly. No software to install, no account needed. Works in Safari, Chrome, and Firefox on macOS.",
      },
    ],
    crossLinks: [
      { text: "Compress your PNG", href: "/compress-image" },
      { text: "PNG to WebP", href: "/convert/png-to-webp" },
    ],
  },
];
