import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchUserProfile, resolveActiveCurrency } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [cookieStore, profile] = await Promise.all([
    cookies(),
    fetchUserProfile(supabase, user.id),
  ]);

  const currentLocale =
    cookieStore.get("NEXT_LOCALE")?.value || profile?.locale || "pt-BR";
  const currentCurrency = resolveActiveCurrency(
    cookieStore,
    profile?.currency,
    currentLocale
  );
  const currentTheme =
    cookieStore.get("NEXT_THEME")?.value || profile?.theme || "dark";
  const initialMonthlyBudget = profile?.monthly_budget ?? 0;

  return (
    <SettingsClient
      currentLocale={currentLocale}
      currentCurrency={currentCurrency}
      currentTheme={currentTheme}
      initialMonthlyBudget={initialMonthlyBudget}
    />
  );
}
