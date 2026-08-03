import { getTranslations } from "next-intl/server";

interface ConversionFaqProps {
  items: { question: string; answer: string }[];
}

export async function ConversionFaq({ items }: ConversionFaqProps) {
  const t = await getTranslations("pairPage");

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-4 text-xl font-semibold">{t("faqTitle")}</h2>
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
    </section>
  );
}
