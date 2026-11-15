import type { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { CURRENCIES, type Currency } from "@/lib/currency";
import type {
  Category,
  Group,
  GroupWithStats,
  PaymentMethod,
  Profile,
  TransactionStatus,
  TransactionType,
  TransactionWithDetails,
} from "@/lib/types";
import type { SubscriptionWithCategory } from "@/app/(dashboard)/actions";

export function resolveActiveCurrency(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  profileCurrency?: string | null,
  locale?: string
): Currency {
  const fromCookie = cookieStore.get("NEXT_CURRENCY")?.value;
  if (fromCookie && (CURRENCIES as readonly string[]).includes(fromCookie)) {
    return fromCookie as Currency;
  }
  if (
    profileCurrency &&
    (CURRENCIES as readonly string[]).includes(profileCurrency)
  ) {
    return profileCurrency as Currency;
  }
  return locale?.startsWith("en") ? "USD" : "BRL";
}

export async function fetchUserProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    monthly_budget: Number(data.monthly_budget) || 0,
    locale: (data.locale === "en-US" ? "en-US" : "pt-BR") as Profile["locale"],
    currency: ((CURRENCIES as readonly string[]).includes(data.currency)
      ? data.currency
      : "BRL") as Currency,
    theme: (["dark", "light", "system"].includes(data.theme)
      ? data.theme
      : "dark") as Profile["theme"],
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function fetchUserCategories(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Category[]> {
  const { data } = await supabase
    .from("categories")
    .select("id, user_id, name, name_en, icon, color, type, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => ({
    ...row,
    type: row.type as TransactionType,
  }));
}

export async function fetchUserTransactions(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<TransactionWithDetails[]> {
  const { data } = await supabase
    .from("transactions")
    .select(
      "id, user_id, category_id, subscription_id, description, amount, type, payment_method, date, status, created_at, updated_at, category:categories(id, name, name_en, icon, color, type), transaction_groups(group_id)"
    )
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const rawCat = row.category as {
      id: string;
      name: string;
      name_en: string;
      icon: string;
      color: string;
      type: string;
    } | null;
    const rawLinks = (row.transaction_groups ?? []) as { group_id: string }[];

    return {
      id: row.id,
      user_id: row.user_id,
      category_id: row.category_id,
      subscription_id: row.subscription_id,
      description: row.description,
      amount: Number(row.amount),
      type: row.type as TransactionType,
      payment_method: row.payment_method as PaymentMethod,
      date: row.date,
      status: row.status as TransactionStatus,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category: rawCat
        ? {
            ...rawCat,
            type: rawCat.type as TransactionType,
          }
        : null,
      group_ids: rawLinks.map((l) => l.group_id),
    };
  });
}

export async function fetchUserSubscriptions(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<SubscriptionWithCategory[]> {
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "id, name, amount, due_day, payment_method, category_id, is_active, category:categories(id, name, name_en, icon, color)"
    )
    .eq("user_id", userId)
    .order("due_day", { ascending: true })
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const cat = row.category as {
      id: string;
      name: string;
      name_en: string;
      icon: string;
      color: string;
    } | null;

    return {
      id: row.id,
      name: row.name,
      amount: Number(row.amount),
      due_day: row.due_day,
      payment_method: row.payment_method as PaymentMethod,
      category_id: row.category_id,
      category_name: cat?.name || "Serviços",
      category_name_en: cat?.name_en || "Services",
      category_icon: cat?.icon || "Wrench",
      category_color: cat?.color || "#64748B",
      is_active: row.is_active,
    };
  });
}

export async function fetchUserGroups(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Group[]> {
  const { data } = await supabase
    .from("groups")
    .select("id, user_id, name, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function fetchUserGroupsWithStats(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<GroupWithStats[]> {
  const { data } = await supabase
    .from("groups")
    .select(
      "id, user_id, name, created_at, transaction_groups(transactions(id, amount, type))"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((g) => {
    const links = (g.transaction_groups ?? []) as unknown as Array<{
      transactions: { id: string; amount: number; type: string } | null;
    }>;

    let count = 0;
    let totalSpent = 0;
    for (const link of links) {
      if (!link.transactions) continue;
      count += 1;
      if (link.transactions.type === "expense") {
        totalSpent += Number(link.transactions.amount) || 0;
      }
    }

    return {
      id: g.id,
      user_id: g.user_id,
      name: g.name,
      created_at: g.created_at,
      transaction_count: count,
      total_spent: totalSpent,
    };
  });
}
