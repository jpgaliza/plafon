import { DEFAULT_CATEGORIES } from "@/lib/categories";
import type { TransactionType } from "@/lib/types";

export interface BudgetSummary {
  monthlyBudget: number;
  monthlyExpenses: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
}

/**
 * Compute monthly spending ceiling (Plafon) metrics.
 */
export function calculateBudgetSummary(
  monthlyBudget: number,
  monthlyExpenses: number
): BudgetSummary {
  const safeBudget = Number.isFinite(monthlyBudget) && monthlyBudget > 0 ? monthlyBudget : 0;
  const safeExpenses = Number.isFinite(monthlyExpenses) && monthlyExpenses > 0 ? monthlyExpenses : 0;
  const remaining = safeBudget - safeExpenses;
  const percentUsed =
    safeBudget > 0
      ? Math.min(Math.max((safeExpenses / safeBudget) * 100, 0), 100)
      : 0;

  return {
    monthlyBudget: safeBudget,
    monthlyExpenses: safeExpenses,
    remaining,
    percentUsed,
    isOverBudget: safeBudget > 0 && safeExpenses > safeBudget,
  };
}

export interface GroupTotals {
  totalSpent: number;
  totalReceived: number;
  balance: number;
  hasIncome: boolean;
  transactionCount: number;
}

/**
 * Compute aggregate totals for a group.
 * `hasIncome` controls whether "Total recebido" and "Saldo" should be rendered.
 */
export function calculateGroupTotals(
  transactions: ReadonlyArray<{ amount: number; type: TransactionType }>
): GroupTotals {
  let totalSpent = 0;
  let totalReceived = 0;
  let hasIncome = false;

  for (const tx of transactions) {
    const amt = Number(tx.amount) || 0;
    if (tx.type === "income") {
      totalReceived += amt;
      hasIncome = true;
    } else {
      totalSpent += amt;
    }
  }

  return {
    totalSpent,
    totalReceived,
    balance: totalReceived - totalSpent,
    hasIncome,
    transactionCount: transactions.length,
  };
}

/**
 * Compute the ISO date (YYYY-MM-DD) for a subscription due day in a given year and 1-based month.
 * Clamps due_day to the last day of the month (e.g. 31 in Feb -> 28 or 29).
 */
export function computeDueDate(year: number, month: number, dueDay: number): string {
  const safeMonth = Math.max(1, Math.min(12, Math.trunc(month)));
  const lastDayOfMonth = new Date(Date.UTC(year, safeMonth, 0)).getUTCDate();
  const clampedDay = Math.max(1, Math.min(lastDayOfMonth, Math.trunc(dueDay)));
  const mm = String(safeMonth).padStart(2, "0");
  const dd = String(clampedDay).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/**
 * Get the start and end YYYY-MM-DD bounds for a YYYY-MM month key.
 */
export function getMonthBounds(yearMonth: string): { start: string; end: string } {
  const [yStr, mStr] = yearMonth.split("-");
  const year = Number(yStr);
  const month = Number(mStr);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    start: `${yearMonth}-01`,
    end: `${yearMonth}-${String(lastDay).padStart(2, "0")}`,
  };
}

/**
 * Resolve localized category display name.
 */
export function resolveCategoryName(
  name: string,
  isEn: boolean,
  nameEn?: string | null
): string {
  if (!isEn) return name;
  if (nameEn && nameEn.trim().length > 0) return nameEn;
  const match = DEFAULT_CATEGORIES.find(
    (c) =>
      c.name.toLowerCase() === name.toLowerCase() ||
      c.nameEn.toLowerCase() === name.toLowerCase()
  );
  return match ? match.nameEn : name;
}

/**
 * Format an ISO date string (YYYY-MM-DD) cleanly in UTC so local timezones
 * never shift the displayed day backwards.
 */
export function formatTransactionDate(
  dateStr: string,
  locale: string,
  referenceDateStr?: string
): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;

  const isEn = locale.startsWith("en");
  const todayStr = referenceDateStr || new Date().toISOString().split("T")[0];
  const [ty, tm, td] = todayStr.split("-").map(Number);
  const todayMs = Date.UTC(ty, tm - 1, td);
  const txMs = Date.UTC(year, month - 1, day);
  const diffDays = Math.round((todayMs - txMs) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return isEn ? "Today" : "Hoje";
  if (diffDays === 1) return isEn ? "Yesterday" : "Ontem";

  const dateObj = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(dateObj);
}

/**
 * Parse a decimal amount string supporting comma or dot separators.
 */
export function parseAmountInput(raw: string): number {
  const normalized = raw.trim().replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
}
