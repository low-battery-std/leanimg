import { getTranslations } from "next-intl/server";

export async function WhyCropper() {
  const t = await getTranslations("cropper");
  const features = t.raw("whyCropper.features") as {
    title: string;
    description: string;
  }[];

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-4 text-xl font-semibold">{t("whyCropper.title")}</h2>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        {t("whyCropper.description")}
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-lg border p-4">
            <h3 className="mb-1 font-medium">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
