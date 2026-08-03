export interface SocialPreset {
  platform: string;
  label: string;
  width: number;
  height: number;
}

export const socialPresets: SocialPreset[] = [
  { platform: "Instagram", label: "Square Post", width: 1080, height: 1080 },
  { platform: "Instagram", label: "Portrait Post", width: 1080, height: 1350 },
  { platform: "Instagram", label: "Story / Reel", width: 1080, height: 1920 },
  { platform: "Instagram", label: "Landscape", width: 1080, height: 566 },
  { platform: "Facebook", label: "Post", width: 1200, height: 630 },
  { platform: "Facebook", label: "Cover Photo", width: 1640, height: 624 },
  { platform: "Facebook", label: "Story", width: 1080, height: 1920 },
  { platform: "YouTube", label: "Thumbnail", width: 1280, height: 720 },
  { platform: "YouTube", label: "Channel Banner", width: 2560, height: 1440 },
  { platform: "X / Twitter", label: "Post Image", width: 1200, height: 675 },
  { platform: "X / Twitter", label: "Header", width: 1500, height: 500 },
  { platform: "LinkedIn", label: "Post", width: 1200, height: 627 },
  { platform: "LinkedIn", label: "Cover Photo", width: 1584, height: 396 },
  { platform: "TikTok", label: "Video Cover", width: 1080, height: 1920 },
  { platform: "Pinterest", label: "Pin", width: 1000, height: 1500 },
];

export const percentagePresets = [25, 50, 75] as const;
