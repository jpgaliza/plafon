import type { PaymentMethod, TransactionType } from "@/lib/types";

const VALID_TYPES: ReadonlySet<string> = new Set<TransactionType>(["income", "expense"]);
const VALID_PAYMENT_METHODS: ReadonlySet<string> = new Set<PaymentMethod>([
  "pix",
  "credit",
  "debit",
  "cash",
  "transfer",
]);
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export interface TransactionValidationInput {
  amount: number;
  description: string;
  type: TransactionType;
  payment_method: PaymentMethod;
  date: string;
}

export interface SubscriptionValidationInput {
  name: string;
  amount: number;
  due_day: number;
  payment_method: PaymentMethod;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateTransactionInput(
  input: TransactionValidationInput
): ValidationResult {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { valid: false, error: "O valor deve ser maior que zero." };
  }

  if (!input.description || !input.description.trim()) {
    return { valid: false, error: "A descrição é obrigatória." };
  }

  if (!VALID_TYPES.has(input.type)) {
    return { valid: false, error: "Tipo de transação inválido." };
  }

  if (!VALID_PAYMENT_METHODS.has(input.payment_method)) {
    return { valid: false, error: "Método de pagamento inválido." };
  }

  if (!input.date || !ISO_DATE_RE.test(input.date)) {
    return { valid: false, error: "Data inválida." };
  }

  const [y, m, d] = input.date.split("-").map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  if (
    parsed.getUTCFullYear() !== y ||
    parsed.getUTCMonth() + 1 !== m ||
    parsed.getUTCDate() !== d
  ) {
    return { valid: false, error: "Data inválida." };
  }

  return { valid: true };
}

export function validateSubscriptionInput(
  input: SubscriptionValidationInput
): ValidationResult {
  if (!input.name || !input.name.trim()) {
    return { valid: false, error: "O nome da assinatura é obrigatório." };
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { valid: false, error: "O valor mensal deve ser maior que zero." };
  }

  if (
    !Number.isInteger(input.due_day) ||
    input.due_day < 1 ||
    input.due_day > 31
  ) {
    return {
      valid: false,
      error: "O dia de vencimento deve estar entre 1 e 31.",
    };
  }

  if (!VALID_PAYMENT_METHODS.has(input.payment_method)) {
    return { valid: false, error: "Método de pagamento inválido." };
  }

  return { valid: true };
}

export function validateGroupName(name: string): ValidationResult {
  const trimmed = name?.trim() ?? "";
  if (!trimmed) {
    return { valid: false, error: "O nome do grupo é obrigatório." };
  }
  if (trimmed.length > 100) {
    return {
      valid: false,
      error: "O nome do grupo deve ter no máximo 100 caracteres.",
    };
  }
  return { valid: true };
}

export function validateMonthlyBudget(amount: number): ValidationResult {
  if (!Number.isFinite(amount) || amount < 0) {
    return {
      valid: false,
      error: "O teto mensal deve ser um valor maior ou igual a zero.",
    };
  }
  return { valid: true };
}
