import type { ConversionPair } from "../types";
import { phase2aPairs } from "./phase-2a";
import { phase2bPairs } from "./phase-2b";
import { phase2cPairs } from "./phase-2c";

export const allPairs: ConversionPair[] = [
  ...phase2aPairs,
  ...phase2bPairs,
  ...phase2cPairs,
];

export function getPairBySlug(slug: string): ConversionPair | undefined {
  return allPairs.find((p) => p.slug === slug);
}
