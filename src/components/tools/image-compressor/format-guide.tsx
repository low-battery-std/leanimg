import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function FormatGuide() {
  const t = await getTranslations("compressor");
  const formats = t.raw("formatGuide.formats") as {
    name: string;
    best: string;
    description: string;
    traits: string[];
  }[];

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-2 text-xl font-semibold">
        {t("formatGuide.title")}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {t.rich("formatGuide.description", {
          link: (chunks) => (
            <Link href="/" className="underline hover:text-foreground">
              {chunks}
            </Link>
          ),
        })}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {formats.map((f) => (
          <div key={f.name} className="rounded-lg border p-4">
            <h3 className="font-medium">{f.name}</h3>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              {t("formatGuide.bestFor", { use: f.best })}
            </p>
            <p className="mb-3 text-sm text-muted-foreground">
              {f.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {f.traits.map((trait) => (
                <span
                  key={trait}
                  className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
