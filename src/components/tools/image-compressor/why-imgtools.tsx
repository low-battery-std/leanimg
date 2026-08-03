import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function WhyLeanImg() {
  const t = await getTranslations("compressor");
  const features = t.raw("whyLeanImg.features") as {
    title: string;
    description: string;
  }[];

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-4 text-xl font-semibold">
        {t("whyLeanImg.title")}
      </h2>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        {t.rich("whyLeanImg.description", {
          link: (chunks) => (
            <Link href="/" className="underline hover:text-foreground">
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
