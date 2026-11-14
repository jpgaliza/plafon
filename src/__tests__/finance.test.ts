import { describe, expect, it } from "vitest";
import {
  calculateBudgetSummary,
  calculateGroupTotals,
  computeDueDate,
  formatTransactionDate,
  getMonthBounds,
  parseAmountInput,
  resolveCategoryName,
} from "@/lib/finance";

describe("calculateBudgetSummary", () => {
  it("computes remaining budget and usage percentage within ceiling", () => {
    const summary = calculateBudgetSummary(2000, 500);
    expect(summary).toEqual({
      monthlyBudget: 2000,
      monthlyExpenses: 500,
      remaining: 1500,
      percentUsed: 25,
      isOverBudget: false,
    });
  });

  it("clamps percentage to 100 and marks over budget when expenses exceed ceiling", () => {
    const summary = calculateBudgetSummary(1000, 1250);
    expect(summary.remaining).toBe(-250);
    expect(summary.percentUsed).toBe(100);
    expect(summary.isOverBudget).toBe(true);
  });

  it("handles zero budget safely without marking over budget", () => {
    const summary = calculateBudgetSummary(0, 300);
    expect(summary.monthlyBudget).toBe(0);
    expect(summary.remaining).toBe(-300);
    expect(summary.percentUsed).toBe(0);
    expect(summary.isOverBudget).toBe(false);
  });
});

describe("calculateGroupTotals", () => {
  it("keeps hasIncome false when group contains only expenses", () => {
    const totals = calculateGroupTotals([
      { amount: 120, type: "expense" },
      { amount: 80.5, type: "expense" },
    ]);
    expect(totals).toEqual({
      totalSpent: 200.5,
      totalReceived: 0,
      balance: -200.5,
      hasIncome: false,
      transactionCount: 2,
    });
  });

  it("sets hasIncome true and calculates totalReceived and balance when income is present", () => {
    const totals = calculateGroupTotals([
      { amount: 300, type: "income" },
      { amount: 120, type: "expense" },
      { amount: 30, type: "expense" },
    ]);
    expect(totals).toEqual({
      totalSpent: 150,
      totalReceived: 300,
      balance: 150,
      hasIncome: true,
      transactionCount: 3,
    });
  });
});

describe("computeDueDate", () => {
  it("uses exact day when valid in month", () => {
    expect(computeDueDate(2026, 3, 15)).toBe("2026-03-15");
    expect(computeDueDate(2026, 1, 31)).toBe("2026-01-31");
  });

  it("clamps day 31 to last day of short months and leap years", () => {
    expect(computeDueDate(2026, 2, 31)).toBe("2026-02-28");
    expect(computeDueDate(2024, 2, 31)).toBe("2024-02-29");
    expect(computeDueDate(2026, 4, 31)).toBe("2026-04-30");
  });
});

describe("date, category, and parsing helpers", () => {
  it("computes month start and end bounds cleanly", () => {
    expect(getMonthBounds("2026-02")).toEqual({
      start: "2026-02-01",
      end: "2026-02-28",
    });
    expect(getMonthBounds("2024-02")).toEqual({
      start: "2024-02-01",
      end: "2024-02-29",
    });
  });

  it("resolves English category names when isEn is true", () => {
    expect(resolveCategoryName("Alimentação", true)).toBe("Food");
    expect(resolveCategoryName("Alimentação", false)).toBe("Alimentação");
    expect(resolveCategoryName("Custom", true, "Custom EN")).toBe("Custom EN");
  });

  it("formats Today and Yesterday without UTC shift", () => {
    expect(formatTransactionDate("2026-11-14", "pt-BR", "2026-11-14")).toBe("Hoje");
    expect(formatTransactionDate("2026-11-13", "en-US", "2026-11-14")).toBe("Yesterday");
  });

  it("parses comma and dot decimal inputs", () => {
    expect(parseAmountInput("49,90")).toBe(49.9);
    expect(parseAmountInput("120.50")).toBe(120.5);
    expect(parseAmountInput("abc")).toBeNaN();
  });
});
