import type { ConversionPair } from "../types";

export const phase2bPairs: ConversionPair[] = [
  {
    sourceFormat: "heic",
    targetFormat: "jpeg",
    slug: "heic-to-jpg",
    h1: "Convert HEIC to JPG — Free, Private, No Upload",
    whyConvert:
      "Your iPhone saves photos in HEIC format by default. While HEIC produces excellent quality at small file sizes, most websites, email services, and Windows applications cannot open HEIC files. Converting to JPG gives you a photo that works everywhere — on any device, in any app, on any platform.\n\nHEIC-to-JPG is the most common image conversion iPhone users need. Whether you are uploading photos to a website, attaching them to an email, or sharing with someone on Android or Windows, JPG is the universal standard that just works.\n\nLeanImg converts your HEIC photos to JPG right in your browser. Your photos never leave your device — no upload, no cloud processing, no privacy risk. This is especially important for personal photos that you do not want on anyone else's server.\n\nThe conversion is instant and free with no sign-up required. After converting, you can compress your JPG to make it even smaller for sharing. Need a modern web format instead? Try converting to WebP.",
    comparison: [
      { label: "File Size", source: "Small (efficient)", target: "Slightly larger" },
      { label: "Transparency", source: "No", target: "No" },
      { label: "Compression", source: "HEVC-based", target: "Lossy (DCT)" },
      { label: "Device Support", source: "Apple devices", target: "Universal" },
      { label: "Best For", source: "iPhone storage", target: "Sharing, web, email" },
      { label: "Editing Support", source: "Limited", target: "Universal" },
    ],
    faq: [
      {
        question: "How to convert HEIC to JPG?",
        answer:
          "Open LeanImg in any browser on your iPhone, Mac, or PC. Drop your HEIC files into the converter and download JPG versions instantly. It is completely free, requires no sign-up, and your photos are never uploaded to any server.",
      },
      {
        question: "Is it safe to convert HEIC to JPG online?",
        answer:
          "Yes. LeanImg processes your photos entirely in your browser. Nothing is uploaded to any server, nothing is stored, and no one else can see your images. Your photos stay on your device throughout the entire conversion process.",
      },
      {
        question: "How to convert HEIC to JPG on iPhone?",
        answer:
          "Open Safari on your iPhone and go to LeanImg. Tap the upload area to select HEIC photos from your camera roll. JPG versions are created instantly on your phone. No app to install — it works directly in Safari or Chrome.",
      },
      {
        question: "Why does my iPhone save photos as HEIC?",
        answer:
          "Apple uses HEIC because it produces smaller files than JPG while maintaining the same quality. This saves storage space on your iPhone. However, HEIC is not widely supported outside the Apple ecosystem, which is why conversion to JPG is often needed.",
      },
      {
        question: "Will I lose photo quality converting HEIC to JPG?",
        answer:
          "There is a minimal quality difference at the default setting of 85. The JPG will look virtually identical to the original HEIC photo. You can adjust the quality slider in advanced settings if you want higher quality or smaller files.",
      },
    ],
    crossLinks: [
      { text: "Compress your JPG", href: "/compress-image" },
      { text: "HEIC to WebP", href: "/convert/heic-to-webp" },
    ],
  },
  {
    sourceFormat: "heic",
    targetFormat: "png",
    slug: "heic-to-png",
    h1: "Convert HEIC to PNG — Free, Private, No Upload",
    whyConvert:
      "HEIC photos from your iPhone sometimes need to be in PNG format — for design work, presentations, or any situation where you need lossless quality and wide software compatibility. PNG preserves every pixel without compression artifacts, making it ideal for screenshots, graphics, and images that will be edited further.\n\nUnlike JPG, PNG supports transparency. If you plan to remove the background from your photo or layer it over other images, PNG is the right choice. The tradeoff is larger file sizes, but the quality preservation is worth it for editing workflows.\n\nLeanImg converts HEIC to PNG entirely in your browser. Your photos never leave your device — there is no server upload, no account needed, and no privacy concerns. The conversion is free and instant.\n\nFor everyday sharing where file size matters more than pixel-perfect quality, consider converting HEIC to JPG instead. After converting, you can compress your PNG to reduce its size while keeping lossless quality.",
    comparison: [
      { label: "File Size", source: "Small (efficient)", target: "Large (lossless)" },
      { label: "Transparency", source: "No", target: "Yes (alpha channel)" },
      { label: "Compression", source: "HEVC-based", target: "Lossless" },
      { label: "Device Support", source: "Apple devices", target: "Universal" },
      { label: "Best For", source: "iPhone storage", target: "Editing, design" },
      { label: "Quality Loss", source: "Minimal", target: "None" },
    ],
    faq: [
      {
        question: "How to convert HEIC to PNG?",
        answer:
          "Visit LeanImg in any browser and drop your HEIC files into the converter. PNG files are generated instantly on your device. It is free, requires no sign-up, and your images are never uploaded anywhere. You can convert multiple files at once.",
      },
      {
        question: "Is it safe to convert HEIC to PNG online?",
        answer:
          "Yes. LeanImg processes images entirely in your browser using local technology. Your photos are never uploaded, never stored on a server, and never accessible to anyone else. The conversion is completely private and secure on your device.",
      },
      {
        question: "How to convert HEIC to PNG on Mac?",
        answer:
          "Open Safari, Chrome, or Firefox on your Mac and navigate to LeanImg. Drag your HEIC files into the converter and download PNG files in seconds. No software installation required — it works in any modern browser on macOS.",
      },
      {
        question: "Why is the PNG file much larger than the HEIC?",
        answer:
          "HEIC uses advanced lossy compression while PNG uses lossless compression. PNG preserves every pixel exactly, which produces larger files. The larger size is the tradeoff for universal compatibility, transparency support, and zero quality loss on re-saves.",
      },
    ],
    crossLinks: [
      { text: "Compress your PNG", href: "/compress-image" },
      { text: "HEIC to JPG", href: "/convert/heic-to-jpg" },
    ],
  },
  {
    sourceFormat: "heic",
    targetFormat: "webp",
    slug: "heic-to-webp",
    h1: "Convert HEIC to WebP — Free, Private, No Upload",
    whyConvert:
      "WebP is the ideal web format for iPhone photos. It matches HEIC's compression efficiency while being supported by every modern browser. Converting HEIC to WebP gives you web-ready images that load fast and look great without the compatibility issues of HEIC.\n\nWebP supports transparency and produces files 25–35% smaller than JPG at the same quality. If you are preparing iPhone photos for a website, blog, or social media, WebP is the smartest target format. All major browsers — Chrome, Firefox, Safari, and Edge — display WebP natively.\n\nLeanImg handles the conversion right in your browser. Your photos never leave your device — no upload to any server, no data collection, no account needed. The process is free, instant, and unlimited.\n\nFor maximum compatibility with older devices and software, consider HEIC to JPG instead. After converting, use our compressor for additional optimization. Need lossless quality? Try HEIC to PNG.",
    comparison: [
      { label: "File Size", source: "Small", target: "Similar or smaller" },
      { label: "Transparency", source: "No", target: "Yes" },
      { label: "Compression", source: "HEVC-based", target: "VP8/VP8L" },
      { label: "Device Support", source: "Apple devices", target: "All modern browsers" },
      { label: "Best For", source: "iPhone storage", target: "Web delivery" },
      { label: "Animation", source: "No", target: "Yes" },
    ],
    faq: [
      {
        question: "How to convert HEIC to WebP?",
        answer:
          "Open LeanImg in any browser on your phone or computer. Drop your HEIC files into the converter and download WebP versions instantly. No sign-up needed, completely free, and your photos never leave your device. Batch conversion is supported.",
      },
      {
        question: "Is it safe to convert HEIC to WebP online?",
        answer:
          "Yes. LeanImg converts your photos entirely in your browser with no server upload. Your images never leave your device, are never stored anywhere, and remain completely private. The technology runs locally in your browser for maximum security.",
      },
      {
        question: "How to convert HEIC to WebP on iPhone?",
        answer:
          "Open Safari on your iPhone, go to LeanImg, and tap the upload area to select HEIC photos. WebP files are created right on your phone in seconds. No app to download — the converter works directly in your mobile browser.",
      },
      {
        question: "Is WebP better than HEIC for the web?",
        answer:
          "For web delivery, yes. WebP has universal browser support while HEIC is mainly supported on Apple devices. Both formats offer excellent compression efficiency. WebP also supports transparency and animation, making it more versatile for web content.",
      },
    ],
    crossLinks: [
      { text: "Compress your images", href: "/compress-image" },
      { text: "HEIC to JPG", href: "/convert/heic-to-jpg" },
    ],
  },
  {
    sourceFormat: "svg",
    targetFormat: "png",
    slug: "svg-to-png",
    h1: "Convert SVG to PNG — Free, Private, No Upload",
    whyConvert:
      "SVG files are perfect for scalable graphics, but many platforms — including social media, email clients, and presentation tools — require raster image formats like PNG. Converting SVG to PNG gives you a pixel-based image that works everywhere, with transparency preserved.\n\nPNG is the best rasterization target for SVG because it maintains sharp edges, supports transparency, and uses lossless compression. Your icons, logos, and illustrations will look crisp at the rendered resolution without any compression artifacts.\n\nLeanImg rasterizes your SVG at 2x resolution for retina-quality output, all within your browser. Your files never leave your device — no upload, no server processing, no privacy concerns. The conversion is instant, free, and requires no sign-up.\n\nFor the best results, make sure your SVG has explicit width and height attributes or a viewBox. After converting, compress your PNG if you need a smaller file size. Need a more compact web format? Try PNG to WebP.",
    comparison: [
      { label: "File Size", source: "Tiny (vector)", target: "Larger (raster)" },
      { label: "Transparency", source: "Yes", target: "Yes" },
      { label: "Scalability", source: "Infinite", target: "Fixed resolution" },
      { label: "Browser Support", source: "Universal", target: "Universal" },
      { label: "Best For", source: "Icons, logos, graphics", target: "Sharing, uploads" },
      { label: "Editability", source: "Vector editing", target: "Pixel editing" },
    ],
    faq: [
      {
        question: "How to convert SVG to PNG?",
        answer:
          "Open LeanImg in any browser, drop your SVG files into the converter, and download PNG versions instantly. The conversion is free, requires no account, and processes everything locally. Your SVG files are never uploaded to any server.",
      },
      {
        question: "Is it safe to convert SVG to PNG online?",
        answer:
          "Yes. LeanImg rasterizes your SVG entirely in your browser. No files are uploaded, no data is stored, and your designs remain private on your device. The conversion uses browser-native rendering for fast, secure processing.",
      },
      {
        question: "How to convert SVG to PNG on Mac?",
        answer:
          "Open any browser on your Mac and visit LeanImg. Drag your SVG files into the converter and download high-resolution PNG files in seconds. No software to install, no Illustrator needed. Works in Safari, Chrome, and Firefox.",
      },
      {
        question: "What resolution will my PNG be?",
        answer:
          "LeanImg renders SVGs at 2x the intrinsic size for retina-quality output. If your SVG is 500x500, the PNG will be 1000x1000 pixels. SVGs without explicit dimensions are rendered at a default size of 1024x1024 pixels.",
      },
    ],
    crossLinks: [
      { text: "Compress your PNG", href: "/compress-image" },
      { text: "PNG to WebP", href: "/convert/png-to-webp" },
    ],
  },
  {
    sourceFormat: "jpeg",
    targetFormat: "pdf",
    slug: "jpg-to-pdf",
    h1: "Convert JPG to PDF — Free, Private, No Upload",
    whyConvert:
      "PDF is the standard format for documents, reports, and printable files. Converting a JPG photo to PDF makes it easy to share as a formal document, include in a multi-page report, or prepare for professional printing. Many institutions and services specifically require PDF format for submissions.\n\nThe resulting PDF matches the exact dimensions of your original photo. The image is embedded at full quality without re-compression, so there is no quality loss during conversion. The PDF can be opened on any device with a PDF viewer — which is virtually every device.\n\nLeanImg converts your JPG to PDF entirely in your browser. Your images never leave your device — no upload, no server processing, no data stored anywhere. This is especially important for sensitive documents like ID photos, receipts, or personal records.\n\nFor batch photo-to-PDF conversion, drop multiple images and download them individually. After converting, you may want to compress your images first for smaller PDF files.",
    comparison: [
      { label: "File Type", source: "Image", target: "Document" },
      { label: "Use Case", source: "Photos, web", target: "Documents, printing" },
      { label: "Multi-page", source: "No", target: "Yes (one page per image)" },
      { label: "Device Support", source: "Universal", target: "Universal" },
      { label: "Printing", source: "Basic", target: "Professional" },
      { label: "Sharing", source: "As image", target: "As document" },
    ],
    faq: [
      {
        question: "How to convert JPG to PDF?",
        answer:
          "Open LeanImg in any browser and drop your JPG files into the converter. PDF files are created instantly on your device. It is free, requires no sign-up, and your images are never uploaded to any server. Each image becomes a single-page PDF.",
      },
      {
        question: "Is it safe to convert JPG to PDF online?",
        answer:
          "Yes. LeanImg creates the PDF entirely in your browser. Your images are never uploaded, never stored on a server, and remain completely private. This is especially important for sensitive photos like ID cards, receipts, or personal documents.",
      },
      {
        question: "How to convert JPG to PDF on iPhone?",
        answer:
          "Open Safari on your iPhone and visit LeanImg. Select your JPG photos from the camera roll and download PDF versions instantly. No app needed — the converter works directly in your mobile browser on any iPhone model.",
      },
      {
        question: "Will the PDF have the same quality as my JPG?",
        answer:
          "Yes. The JPG is embedded in the PDF at full quality without re-compression. The PDF page size matches the original image dimensions exactly. There is no quality loss during the conversion process from JPG to PDF.",
      },
    ],
    crossLinks: [
      { text: "Compress your images first", href: "/compress-image" },
      { text: "PNG to PDF", href: "/convert/png-to-pdf" },
    ],
  },
  {
    sourceFormat: "png",
    targetFormat: "pdf",
    slug: "png-to-pdf",
    h1: "Convert PNG to PDF — Free, Private, No Upload",
    whyConvert:
      "Need to turn a screenshot, graphic, or design into a shareable document? Converting PNG to PDF wraps your image in a format that is accepted everywhere for official submissions, printing, and archiving. PDFs are the standard for documents that need to look the same on every device.\n\nThe conversion preserves your PNG at full quality — the image is embedded without re-compression. The PDF page size matches your image dimensions exactly. This makes it perfect for receipts, certificates, screenshots for documentation, and design exports.\n\nLeanImg creates the PDF right in your browser without uploading your files. Your images never leave your device — no server, no cloud, no third party ever sees your data. Free and instant with no account required.\n\nFor the sharpest printed results, use high-resolution PNG files. If you need smaller PDF files, compress your PNG before converting. Need a photo format instead? Try PNG to JPG for universal compatibility.",
    comparison: [
      { label: "File Type", source: "Image", target: "Document" },
      { label: "Use Case", source: "Graphics, screenshots", target: "Documents, archiving" },
      { label: "Transparency", source: "Yes", target: "Preserved in PDF" },
      { label: "Device Support", source: "Universal", target: "Universal" },
      { label: "Printing", source: "Basic", target: "Professional" },
      { label: "Sharing", source: "As image", target: "As document" },
    ],
    faq: [
      {
        question: "How to convert PNG to PDF?",
        answer:
          "Visit LeanImg in any browser, drop your PNG files into the converter, and download PDF versions instantly. The conversion is completely free, requires no account, and processes files locally. Your images are never uploaded to a server.",
      },
      {
        question: "Is it safe to convert PNG to PDF online?",
        answer:
          "Yes. LeanImg generates the PDF entirely in your browser. No files are uploaded, nothing is stored remotely, and your images stay private on your device. This is ideal for sensitive documents like screenshots of personal information.",
      },
      {
        question: "How to convert PNG to PDF on Windows?",
        answer:
          "Open Chrome, Edge, or Firefox on your Windows PC and go to LeanImg. Drop your PNG files into the converter and download PDFs instantly. No software to install, no account needed. Works on Windows 10, 11, or any version.",
      },
      {
        question: "Is the PNG quality preserved in the PDF?",
        answer:
          "Yes. Your PNG image is embedded in the PDF at full quality without any re-compression. The PDF page dimensions match your original image size exactly. The result is an exact, lossless representation of your PNG in document format.",
      },
    ],
    crossLinks: [
      { text: "Compress your images first", href: "/compress-image" },
      { text: "JPG to PDF", href: "/convert/jpg-to-pdf" },
    ],
  },
];
