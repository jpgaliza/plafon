/**
 * Database types mirroring the Supabase schema.
 * These are used throughout the app for type safety
 * before the auto-generated Supabase types are available.
 */

export type TransactionType = "income" | "expense";
export type TransactionStatus = "pending" | "completed";
export type PaymentMethod = "pix" | "credit" | "debit" | "cash" | "transfer";

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
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
}
