import { getTranslations } from "next-intl/server";
import { socialPresets } from "@/lib/resize/presets";

export async function SocialSizeGuide() {
  const t = await getTranslations("resizer");
  const platforms = [...new Set(socialPresets.map((p) => p.platform))];

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-4 text-xl font-semibold">
        {t("socialSizeGuide.title")}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {t("socialSizeGuide.description")}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="pb-2 pr-4 text-left font-medium">
                {t("socialSizeGuide.platform")}
              </th>
              <th className="pb-2 pr-4 text-left font-medium">
                {t("socialSizeGuide.type")}
              </th>
              <th className="pb-2 text-left font-medium">
                {t("socialSizeGuide.dimensions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {platforms.map((platform) => {
              const presets = socialPresets.filter(
                (p) => p.platform === platform,
              );
              return presets.map((preset, i) => (
                <tr key={`${platform}-${preset.label}`} className="border-b">
                  <td className="py-2 pr-4 text-muted-foreground">
                    {i === 0 ? platform : ""}
                  </td>
                  <td className="py-2 pr-4">{preset.label}</td>
                  <td className="py-2 font-mono text-xs">
                    {preset.width} &times; {preset.height}
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
