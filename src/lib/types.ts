/**
 * Domain types mirroring the Supabase schema.
 */

import type { Currency, Locale } from "@/lib/currency";

export type TransactionType = "income" | "expense";
export type TransactionStatus = "pending" | "completed";
export type PaymentMethod = "pix" | "credit" | "debit" | "cash" | "transfer";
export type ThemePreference = "dark" | "light" | "system";

export interface Profile {
  id: string;
  monthly_budget: number;
  locale: Locale;
  currency: Currency;
  theme: ThemePreference;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  name_en: string;
  icon: string;
  color: string;
  type: TransactionType;
  created_at?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  amount: number;
  payment_method: PaymentMethod;
  due_day: number;
  is_active: boolean;
  last_generated_on?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  subscription_id: string | null;
  description: string;
  amount: number;
  type: TransactionType;
  payment_method: PaymentMethod;
  date: string;
  status: TransactionStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Group {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface GroupWithStats extends Group {
  transaction_count: number;
  total_spent: number;
}

export interface TransactionWithDetails extends Transaction {
  category?: Pick<Category, "id" | "name" | "name_en" | "icon" | "color" | "type"> | null;
  group_ids?: string[];
}
