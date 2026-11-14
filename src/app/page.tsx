import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { fetchUserProfile, resolveActiveCurrency } from "@/lib/queries";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { LandingClient } from "@/components/landing-client";

export default async function Home() {
  let monthlyBudget: number | null = null;
  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  let currency = resolveActiveCurrency(cookieStore, null, locale);

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const profile = await fetchUserProfile(supabase, user.id);
      if (profile) {
        monthlyBudget = profile.monthly_budget;
        currency = resolveActiveCurrency(cookieStore, profile.currency, locale);
      }
    }
  }

  return <LandingClient monthlyBudget={monthlyBudget} currency={currency} />;
}
