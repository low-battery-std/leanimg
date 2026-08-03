"use client";

import { Link } from "@/i18n/navigation";
import { trackEvent } from "@/lib/analytics";

interface TrackedToolLinkProps {
  href: string;
  slug: string;
  source: string;
  className?: string;
  children: React.ReactNode;
}

export function TrackedToolLink({
  href,
  slug,
  source,
  className,
  children,
}: TrackedToolLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackEvent("tool_click", { tool: slug, source })}
    >
      {children}
    </Link>
  );
}
