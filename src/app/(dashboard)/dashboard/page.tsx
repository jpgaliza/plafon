import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchUserProfile,
  fetchUserTransactions,
  resolveActiveCurrency,
} from "@/lib/queries";
import { resolveCategoryName } from "@/lib/finance";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Safety trigger on dashboard load to cover any missed subscription billing days
  await supabase.rpc("generate_subscription_transactions");

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
  const isEn = locale.startsWith("en");
  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonth = todayStr.slice(0, 7);

  let totalAllIncome = 0;
  let totalAllExpenses = 0;
  let monthlyIncome = 0;
  let monthlyExpenses = 0;

  const categoryMap = new Map<
    string,
    { name: string; value: number; color: string }
  >();

  for (const tx of transactions) {
    if (tx.type === "income") {
      totalAllIncome += tx.amount;
    } else {
      totalAllExpenses += tx.amount;
    }

    if (tx.date.startsWith(currentMonth)) {
      if (tx.type === "income") {
        monthlyIncome += tx.amount;
      } else {
        monthlyExpenses += tx.amount;
        const catName = tx.category
          ? resolveCategoryName(tx.category.name, isEn, tx.category.name_en)
          : isEn
          ? "Other"
          : "Outros";
        const catColor = tx.category?.color || "#6B7280";
        const key = `${catName}::${catColor}`;
        const existing = categoryMap.get(key);
        if (existing) {
          existing.value += tx.amount;
        } else {
          categoryMap.set(key, {
            name: catName,
            value: tx.amount,
            color: catColor,
          });
        }
      }
    }
  }

  const balance = totalAllIncome - totalAllExpenses;
  const chartData = Array.from(categoryMap.values()).sort(
    (a, b) => b.value - a.value
  );
  const recentTransactions = transactions.slice(0, 5);

  return (
    <DashboardClient
      locale={locale}
      currency={currency}
      balance={balance}
      income={monthlyIncome}
      expenses={monthlyExpenses}
      monthlyBudget={profile?.monthly_budget ?? 0}
      chartData={chartData}
      recentTransactions={recentTransactions}
      todayStr={todayStr}
    />
  );
}
