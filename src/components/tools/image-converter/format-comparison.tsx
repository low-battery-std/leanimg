import { getTranslations } from "next-intl/server";

interface FormatComparisonProps {
  sourceFormatName: string;
  targetFormatName: string;
  rows: { label: string; source: string; target: string }[];
}

export async function FormatComparison({
  sourceFormatName,
  targetFormatName,
  rows,
}: FormatComparisonProps) {
  const t = await getTranslations("pairPage");

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-4 text-xl font-semibold">
        {t("vsTitle", { source: sourceFormatName, target: targetFormatName })}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4 text-left font-medium">
                {t("feature")}
              </th>
              <th className="py-2 px-4 text-left font-medium">
                {sourceFormatName}
              </th>
              <th className="py-2 pl-4 text-left font-medium">
                {targetFormatName}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-0">
                <td className="py-2 pr-4 font-medium text-muted-foreground">
                  {row.label}
                </td>
                <td className="py-2 px-4">{row.source}</td>
                <td className="py-2 pl-4">{row.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
