import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchUserProfile,
  fetchUserTransactions,
  resolveActiveCurrency,
} from "@/lib/queries";
import { TransactionsClient } from "./transactions-client";

export default async function TransactionsPage() {
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
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <TransactionsClient
      transactions={transactions}
      locale={locale}
      currency={currency}
      todayStr={todayStr}
    />
  );
}
