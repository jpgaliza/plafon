import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchUserProfile,
  fetchUserTransactions,
  resolveActiveCurrency,
} from "@/lib/queries";
import { CategoriesClient } from "./categories-client";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [cookieStore, locale, profile, transactions] = await Promise.all([
    cookies(),
    getLocale(),
    fetchUserProfile(supabase, user.id),
    fetchUserTransactions(supabase, user.id),
  ]);

  const currency = resolveActiveCurrency(
    cookieStore,
    profile?.currency,
    locale
  );

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthSet = new Set<string>([currentMonth]);
  const monthsWithExpenses = new Set<string>();

  for (const tx of transactions) {
    if (tx.type === "expense" && tx.date.length >= 7) {
      const ym = tx.date.slice(0, 7);
      monthSet.add(ym);
      monthsWithExpenses.add(ym);
    }
  }

  const sortedMonthKeys = Array.from(monthSet).sort((a, b) =>
    b.localeCompare(a)
  );

  const formatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const availableMonths = sortedMonthKeys.map((ym) => {
    const [y, m] = ym.split("-").map(Number);
    return {
      value: ym,
      label: formatter.format(new Date(Date.UTC(y, m - 1, 15))),
    };
  });

  const defaultMonth =
    sortedMonthKeys.find((m) => monthsWithExpenses.has(m)) ?? currentMonth;

  return (
    <CategoriesClient
      transactions={transactions}
      availableMonths={availableMonths}
      defaultMonth={defaultMonth}
      locale={locale}
      currency={currency}
    />
  );
}
