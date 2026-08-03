import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/config";
import { tools } from "@/lib/tools";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "./language-switcher";
import { MobileNav } from "./mobile-nav";

const toolLabelKeys: Record<string, string> = {
  "compress-image": "compress",
  "resize-image": "resize",
  "crop-image": "crop",
  "convert": "converter",
  "icon-generator": "iconGenerator",
  "remove-background": "bgRemover",
  "upscale-image": "upscaler",
};

export async function Header() {
  const t = await getTranslations("header");

  const navItems = tools.map((tool) => ({
    href: tool.href,
    label: t(toolLabelKeys[tool.slug] ?? tool.slug),
    available: tool.available,
  }));

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <MobileNav items={navItems} />
        <Link href="/" className="mr-8 flex items-center gap-2 font-bold max-md:ml-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          {siteConfig.name}
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {tools.map((tool) =>
            tool.available ? (
              <Link
                key={tool.slug}
                href={tool.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(toolLabelKeys[tool.slug] ?? tool.slug)}
              </Link>
            ) : (
              <span
                key={tool.slug}
                className="text-muted-foreground/50"
              >
                {t(toolLabelKeys[tool.slug] ?? tool.slug)}
                <span className="ml-1 text-xs">{t("soon")}</span>
              </span>
            ),
          )}
        </nav>
        <div className="ml-auto">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
