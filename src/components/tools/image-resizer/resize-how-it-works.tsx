import { getTranslations } from "next-intl/server";

export async function ResizeHowItWorks() {
  const t = await getTranslations("resizer");
  const steps = t.raw("howItWorks.steps") as {
    title: string;
    description: string;
  }[];

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-4 text-xl font-semibold">{t("howItWorks.title")}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {i + 1}
            </span>
            <div>
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
