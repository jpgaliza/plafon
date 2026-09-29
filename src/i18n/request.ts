import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const supportedLocales = ["pt-BR", "en-US"] as const;

export default getRequestConfig(async () => {
  // Read locale from cookie, fallback to pt-BR if missing or unsupported
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get("NEXT_LOCALE")?.value || "pt-BR";
  const locale = (supportedLocales as readonly string[]).includes(rawLocale)
    ? rawLocale
    : "pt-BR";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
