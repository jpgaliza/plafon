import type { TransactionType, PaymentMethod } from "@/lib/types";

/**
 * Default category definitions with icons (Lucide names) and colors.
 * These seed the user's categories on first use.
 */
export interface DefaultCategory {
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Expenses
  { name: "Alimentação", nameEn: "Food", icon: "UtensilsCrossed", color: "#F97316", type: "expense" },
  { name: "Transporte", nameEn: "Transport", icon: "Car", color: "#3B82F6", type: "expense" },
  { name: "Moradia", nameEn: "Housing", icon: "Home", color: "#8B5CF6", type: "expense" },
  { name: "Saúde", nameEn: "Health", icon: "Heart", color: "#EF4444", type: "expense" },
  { name: "Educação", nameEn: "Education", icon: "GraduationCap", color: "#06B6D4", type: "expense" },
  { name: "Lazer", nameEn: "Entertainment", icon: "Gamepad2", color: "#EC4899", type: "expense" },
  { name: "Compras", nameEn: "Shopping", icon: "ShoppingBag", color: "#F59E0B", type: "expense" },
  { name: "Serviços", nameEn: "Services", icon: "Wrench", color: "#64748B", type: "expense" },
  // Income
  { name: "Salário", nameEn: "Salary", icon: "Banknote", color: "#10B981", type: "income" },
  { name: "Freelance", nameEn: "Freelance", icon: "Laptop", color: "#14B8A6", type: "income" },
  { name: "Investimentos", nameEn: "Investments", icon: "TrendingUp", color: "#22C55E", type: "income" },
  { name: "Outros", nameEn: "Other", icon: "MoreHorizontal", color: "#6B7280", type: "income" },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string; labelEn: string }[] = [
  { value: "pix", label: "Pix", labelEn: "Pix" },
  { value: "credit", label: "Crédito", labelEn: "Credit" },
  { value: "debit", label: "Débito", labelEn: "Debit" },
  { value: "cash", label: "Dinheiro", labelEn: "Cash" },
  { value: "transfer", label: "Transferência", labelEn: "Transfer" },
];
