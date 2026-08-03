import { siteConfig } from "@/lib/config";
import { locales, type Locale } from "@/i18n/routing";

export function localizedUrl(path: string, locale: string = "en"): string {
  const prefix = locale === "en" ? "" : `/${locale}`;
  return `${siteConfig.url}${prefix}${path}`;
}

export function buildAlternates(path: string, locale: string = "en") {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = localizedUrl(path, l);
  }
  languages["x-default"] = localizedUrl(path, "en");

  return {
    canonical: localizedUrl(path, locale),
    languages,
  };
}

export function localeToOgLocale(locale: string): string {
  const map: Record<string, string> = {
    en: "en_US", zh: "zh_CN", es: "es_ES", ar: "ar_SA", hi: "hi_IN",
    pt: "pt_BR", fr: "fr_FR", ru: "ru_RU", ja: "ja_JP", de: "de_DE",
    id: "id_ID", ko: "ko_KR", it: "it_IT", tr: "tr_TR", vi: "vi_VN",
    pl: "pl_PL", nl: "nl_NL", th: "th_TH", bn: "bn_BD", uk: "uk_UA",
    cs: "cs_CZ", sv: "sv_SE", ro: "ro_RO", el: "el_GR", hu: "hu_HU",
  };
  return map[locale] ?? "en_US";
}
