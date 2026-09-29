"use server";

import type { TransactionType, PaymentMethod } from "@/lib/types";

export interface NewTransactionInput {
  amount: number;
  description: string;
  type: TransactionType;
  category_icon: string;
  category_name: string;
  payment_method: PaymentMethod;
  date: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createTransactionAction(
  input: NewTransactionInput
): Promise<ActionResult> {
  // Validate input
  if (!input.amount || input.amount <= 0) {
    return { success: false, error: "O valor deve ser maior que zero." };
  }

  if (!input.description.trim()) {
    return { success: false, error: "A descrição é obrigatória." };
  }

  // TODO: When Supabase is connected, insert into the transactions table
  // For now, log and return success for UI development
  console.log("[createTransactionAction]", input);

  return { success: true };
}

export interface NewSubscriptionInput {
  name: string;
  amount: number;
  due_day: number;
  payment_method: PaymentMethod;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

export async function createSubscriptionAction(
  input: NewSubscriptionInput
): Promise<ActionResult> {
  if (!input.name.trim()) {
    return { success: false, error: "O nome da assinatura é obrigatório." };
  }

  if (!input.amount || input.amount <= 0) {
    return { success: false, error: "O valor mensal deve ser maior que zero." };
  }

  if (!input.due_day || input.due_day < 1 || input.due_day > 31) {
    return { success: false, error: "O dia de vencimento deve estar entre 1 e 31." };
  }

  console.log("[createSubscriptionAction]", input);
  return { success: true };
}
