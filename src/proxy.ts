import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // ml-assets excluded: model chunk filenames are extensionless hashes, which
  // the locale matcher would otherwise rewrite to /en/ml-assets/* (404).
  matcher: ["/", "/((?!api|_next|_vercel|ml-assets|.*\\..*).*)"],
};
