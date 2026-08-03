import { defineRouting } from "next-intl/routing";

export const locales = [
  "en", "zh", "es", "ar", "hi", "pt", "fr", "ru", "ja", "de",
  "id", "ko", "it", "tr", "vi", "pl", "nl", "th", "bn", "uk",
  "cs", "sv", "ro", "el", "hu",
] as const;

export type Locale = (typeof locales)[number];

export const rtlLocales: Locale[] = ["ar"];

export const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  es: "Español",
  ar: "العربية",
  hi: "हिन्दी",
  pt: "Português",
  fr: "Français",
  ru: "Русский",
  ja: "日本語",
  de: "Deutsch",
  id: "Bahasa Indonesia",
  ko: "한국어",
  it: "Italiano",
  tr: "Türkçe",
  vi: "Tiếng Việt",
  pl: "Polski",
  nl: "Nederlands",
  th: "ไทย",
  bn: "বাংলা",
  uk: "Українська",
  cs: "Čeština",
  sv: "Svenska",
  ro: "Română",
  el: "Ελληνικά",
  hu: "Magyar",
};

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
});
