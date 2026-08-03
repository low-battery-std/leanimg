"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

export function TrustIndicators() {
  const t = useTranslations("trust");

  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline" className="gap-1.5 py-1">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        {t("free")}
      </Badge>
      <Badge variant="outline" className="gap-1.5 py-1">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        {t("instant")}
      </Badge>
      <Badge variant="outline" className="gap-1.5 py-1">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        {t("private")}
      </Badge>
    </div>
  );
}
