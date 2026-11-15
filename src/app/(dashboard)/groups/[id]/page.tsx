import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchUserProfile,
  fetchUserTransactions,
  resolveActiveCurrency,
} from "@/lib/queries";
import { GroupDetailClient } from "./group-detail-client";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: group }, cookieStore, locale, profile, allTransactions] =
    await Promise.all([
      supabase
        .from("groups")
        .select("id, user_id, name, created_at")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle(),
      cookies(),
      getLocale(),
      fetchUserProfile(supabase, user.id),
      fetchUserTransactions(supabase, user.id),
    ]);

  if (!group) {
    notFound();
  }

  const currency = resolveActiveCurrency(
    cookieStore,
    profile?.currency,
    locale
  );
  const todayStr = new Date().toISOString().split("T")[0];

  const groupTransactions = allTransactions.filter((tx) =>
    tx.group_ids?.includes(group.id)
  );
  const availableTransactions = allTransactions.filter(
    (tx) => !tx.group_ids?.includes(group.id)
  );

  return (
    <GroupDetailClient
      group={group}
      groupTransactions={groupTransactions}
      availableTransactions={availableTransactions}
      locale={locale}
      currency={currency}
      todayStr={todayStr}
    />
  );
}
