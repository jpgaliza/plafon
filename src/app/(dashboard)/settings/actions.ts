"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CURRENCIES,
  LOCALES,
  type Currency,
  type Locale,
} from "@/lib/currency";
import { PREFERENCE_COOKIE_OPTIONS } from "@/lib/preferences";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ThemePreference } from "@/lib/types";
import { validateMonthlyBudget } from "@/lib/validators";

async function persistProfilePreference(
  patch: Partial<{
    locale: Locale;
    currency: Currency;
    theme: ThemePreference;
  }>
) {
  if (!isSupabaseConfigured()) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("profiles").update(patch).eq("id", user.id);
  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
}

export async function setLocaleAction(locale: Locale) {
  if (!(LOCALES as readonly string[]).includes(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, PREFERENCE_COOKIE_OPTIONS);
  await persistProfilePreference({ locale });
  redirect("/settings");
}

export async function setCurrencyAction(currency: Currency) {
  if (!(CURRENCIES as readonly string[]).includes(currency)) return;
  const cookieStore = await cookies();
  cookieStore.set("NEXT_CURRENCY", currency, PREFERENCE_COOKIE_OPTIONS);
  await persistProfilePreference({ currency });
  redirect("/settings");
}

export async function setThemeAction(theme: ThemePreference) {
  if (!["dark", "light", "system"].includes(theme)) return;
  const cookieStore = await cookies();
  cookieStore.set("NEXT_THEME", theme, PREFERENCE_COOKIE_OPTIONS);
  await persistProfilePreference({ theme });
  redirect("/settings");
}

export async function setMonthlyBudgetAction(
  amount: number
): Promise<{ success: boolean; error?: string }> {
  const validation = validateMonthlyBudget(amount);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase não configurado." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const normalized = Math.round(amount * 100) / 100;
  const { error } = await supabase
    .from("profiles")
    .update({ monthly_budget: normalized })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      error: error.message || "Erro ao salvar teto de gastos.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}
