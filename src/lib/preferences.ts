import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { CURRENCIES, LOCALES, type Currency, type Locale } from "@/lib/currency";
import { fetchUserProfile } from "@/lib/queries";
import type { ThemePreference } from "@/lib/types";

export const PREFERENCE_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

export interface ProfilePreferences {
  locale: Locale;
  currency: Currency;
  theme: ThemePreference;
}

export async function getUserPreferenceCookiesFromProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<ProfilePreferences | null> {
  const profile = await fetchUserProfile(supabase, userId);
  if (!profile) return null;

  const locale = (LOCALES as readonly string[]).includes(profile.locale)
    ? profile.locale
    : "pt-BR";
  const currency = (CURRENCIES as readonly string[]).includes(profile.currency)
    ? profile.currency
    : "BRL";
  const theme: ThemePreference = ["dark", "light", "system"].includes(
    profile.theme
  )
    ? profile.theme
    : "dark";

  return { locale, currency, theme };
}

export async function syncCookiesFromProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<void> {
  const prefs = await getUserPreferenceCookiesFromProfile(supabase, userId);
  if (!prefs) return;

  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", prefs.locale, PREFERENCE_COOKIE_OPTIONS);
  cookieStore.set("NEXT_CURRENCY", prefs.currency, PREFERENCE_COOKIE_OPTIONS);
  cookieStore.set("NEXT_THEME", prefs.theme, PREFERENCE_COOKIE_OPTIONS);
}
