import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function ResizeFAQ() {
  const t = await getTranslations("resizer");
  const items = t.raw("faq.items") as { question: string; answer: string }[];

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-4 text-xl font-semibold">{t("faq.title")}</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-lg border px-4 py-3"
          >
            <summary className="cursor-pointer font-medium">
              {item.question}
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        {t.rich("faq.moreQuestions", {
          link: (chunks) => (
            <Link href="/about" className="underline hover:text-foreground">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </section>
  );
}
