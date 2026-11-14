import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchUserProfile,
  fetchUserSubscriptions,
  resolveActiveCurrency,
} from "@/lib/queries";
import { SubscriptionsClient } from "./subscriptions-client";

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [cookieStore, locale, profile, subscriptions] = await Promise.all([
    cookies(),
    getLocale(),
    fetchUserProfile(supabase, user.id),
    fetchUserSubscriptions(supabase, user.id),
  ]);

  const currency = resolveActiveCurrency(
    cookieStore,
    profile?.currency,
    locale
  );
  const now = new Date();
  const currentDay = now.getUTCDate();
  const daysInCurrentMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)
  ).getUTCDate();

  return (
    <SubscriptionsClient
      initialSubscriptions={subscriptions}
      locale={locale}
      currency={currency}
      currentDay={currentDay}
      daysInCurrentMonth={daysInCurrentMonth}
    />
  );
}
