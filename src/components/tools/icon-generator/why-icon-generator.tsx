import { getTranslations } from "next-intl/server";

export async function WhyIconGenerator() {
  const t = await getTranslations("iconGenerator");
  const features = t.raw("whyLeanImg.features") as {
    title: string;
    description: string;
  }[];

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-4 text-xl font-semibold">{t("whyLeanImg.title")}</h2>
      <p className="mb-6 text-muted-foreground">{t("whyLeanImg.description")}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-lg border bg-card p-4 space-y-1"
          >
            <h3 className="font-medium">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
