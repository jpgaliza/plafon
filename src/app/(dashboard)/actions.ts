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
