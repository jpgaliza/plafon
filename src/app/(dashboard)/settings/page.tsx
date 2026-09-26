import { cookies } from "next/headers";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const currentLocale = cookieStore.get("NEXT_LOCALE")?.value || "pt-BR";
  const currentCurrency = cookieStore.get("NEXT_CURRENCY")?.value || "BRL";
  const currentTheme = cookieStore.get("NEXT_THEME")?.value || "dark";

  return (
    <div className="mx-auto w-full max-w-lg">
      <SettingsClient
        currentLocale={currentLocale}
        currentCurrency={currentCurrency}
        currentTheme={currentTheme}
      />
    </div>
  );
}
