import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function WhyResize() {
  const t = await getTranslations("resizer");
  const features = t.raw("whyResize.features") as {
    title: string;
    description: string;
  }[];

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-4 text-xl font-semibold">{t("whyResize.title")}</h2>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        {t.rich("whyResize.description", {
          compressLink: (chunks) => (
            <Link
              href="/compress-image"
              className="underline hover:text-foreground"
            >
              {chunks}
            </Link>
          ),
          convertLink: (chunks) => (
            <Link href="/convert" className="underline hover:text-foreground">
              {chunks}
            </Link>
          ),
        })}
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-lg border p-4">
            <h3 className="mb-1 font-medium">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
