import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  fetchUserGroupsWithStats,
  fetchUserProfile,
  resolveActiveCurrency,
} from "@/lib/queries";
import { GroupsClient } from "./groups-client";

export default async function GroupsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [cookieStore, locale, profile, groups] = await Promise.all([
    cookies(),
    getLocale(),
    fetchUserProfile(supabase, user.id),
    fetchUserGroupsWithStats(supabase, user.id),
  ]);

  const currency = resolveActiveCurrency(
    cookieStore,
    profile?.currency,
    locale
  );

  return (
    <GroupsClient
      initialGroups={groups}
      locale={locale}
      currency={currency}
    />
  );
}
