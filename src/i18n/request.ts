import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // Read locale from cookie, default to pt-BR
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "pt-BR";

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
