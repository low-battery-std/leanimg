import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/lib/config";
import { tools } from "@/lib/tools";
import { getTranslations } from "next-intl/server";

const toolTitleKeys: Record<string, string> = {
  "compress-image": "compressor.title",
  "resize-image": "resizer.title",
  "crop-image": "cropper.title",
  "convert": "converter.title",
  "icon-generator": "iconGenerator.title",
  "remove-background": "bgRemover.title",
  "upscale-image": "upscaler.title",
};

export async function Footer() {
  const t = await getTranslations("footer");
  const tTools = await getTranslations("tools");

  return (
    <footer className="border-t py-8">
      <div className="container px-4">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-3 text-sm font-semibold">{t("tools")}</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              {tools.map((tool) =>
                tool.available ? (
                  <Link key={tool.slug} href={tool.href} className="hover:underline">
                    {tTools(toolTitleKeys[tool.slug] ?? tool.slug)}
                  </Link>
                ) : (
                  <span key={tool.slug}>
                    {tTools(toolTitleKeys[tool.slug] ?? tool.slug)}{" "}
                    <span className="text-xs">{t("comingSoon")}</span>
                  </span>
                ),
              )}
            </nav>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">{t("company")}</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/about" className="hover:underline">
                {t("about")}
              </Link>
              <Link href="/privacy" className="hover:underline">
                {t("privacy")}
              </Link>
            </nav>
          </div>

          <div className="flex flex-col justify-between">
            <p className="text-sm text-muted-foreground">
              {t("tagline")}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          {/* Legal notice, deliberately untranslated (AGPL-3.0 attribution). */}
          <p className="mt-1 text-xs text-muted-foreground">
            Background removal powered by{" "}
            <a
              href="https://github.com/imgly/background-removal-js"
              rel="noopener noreferrer"
              target="_blank"
              className="underline hover:text-foreground"
            >
              IMG.LY background-removal
            </a>{" "}
            (AGPL-3.0).
            {siteConfig.sourceRepoUrl && (
              <>
                {" "}
                <a
                  href={siteConfig.sourceRepoUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="underline hover:text-foreground"
                >
                  Source code
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
