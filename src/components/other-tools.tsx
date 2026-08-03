import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { tools } from "@/lib/tools";
import { getTranslations } from "next-intl/server";
import { TrackedToolLink } from "@/components/tracked-tool-link";

const toolKeys: Record<string, string> = {
  "compress-image": "compressor",
  "resize-image": "resizer",
  "crop-image": "cropper",
  "convert": "converter",
  "icon-generator": "iconGenerator",
  "remove-background": "bgRemover",
  "upscale-image": "upscaler",
};

interface OtherToolsProps {
  current: string;
}

export async function OtherTools({ current }: OtherToolsProps) {
  const t = await getTranslations("otherTools");
  const tTools = await getTranslations("tools");
  const tFooter = await getTranslations("footer");

  const otherTools = tools.filter((tool) => tool.slug !== current);

  if (otherTools.length === 0) return null;

  return (
    <section className="mt-10 border-t pt-8">
      <h2 className="mb-4 text-xl font-semibold">{t("title")}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {otherTools.map((tool) => {
          const key = toolKeys[tool.slug] ?? tool.slug;
          const card = (
            <Card
              key={tool.slug}
              className={
                !tool.available
                  ? "opacity-60"
                  : "transition-colors hover:border-foreground/25"
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <tool.icon className="size-5 shrink-0" aria-hidden />
                  {tTools(`${key}.title`)}
                </CardTitle>
                <CardDescription>{tTools(`${key}.description`)}</CardDescription>
                {!tool.available && (
                  <span className="text-xs text-muted-foreground">
                    {tFooter("comingSoon")}
                  </span>
                )}
              </CardHeader>
            </Card>
          );

          return tool.available ? (
            <TrackedToolLink
              key={tool.slug}
              href={tool.href}
              slug={tool.slug}
              source="other_tools"
              className="rounded-xl"
            >
              {card}
            </TrackedToolLink>
          ) : (
            card
          );
        })}
      </div>
    </section>
  );
}
