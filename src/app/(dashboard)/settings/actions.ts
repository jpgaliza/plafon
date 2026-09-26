"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Locale } from "@/lib/currency";
import type { Currency } from "@/lib/currency";

export async function setLocaleAction(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
  redirect("/settings");
}

export async function setCurrencyAction(currency: Currency) {
  const cookieStore = await cookies();
  cookieStore.set("NEXT_CURRENCY", currency, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  redirect("/settings");
}

export async function setThemeAction(theme: "dark" | "light" | "system") {
  const cookieStore = await cookies();
  cookieStore.set("NEXT_THEME", theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  redirect("/settings");
}
