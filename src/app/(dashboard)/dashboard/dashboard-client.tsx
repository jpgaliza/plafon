"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Wallet, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import {
  calculateBudgetSummary,
  formatTransactionDate,
  resolveCategoryName,
} from "@/lib/finance";
import { CategoryIcon } from "@/lib/icons";
import type { TransactionWithDetails } from "@/lib/types";
import { CategoryChart } from "@/components/category-chart";
import { FadeIn } from "@/components/ui/fade-in";

interface CategoryChartPoint {
  name: string;
  value: number;
  color: string;
}

interface DashboardClientProps {
  locale: string;
  currency: string;
  balance: number;
  income: number;
  expenses: number;
  monthlyBudget: number;
  chartData: CategoryChartPoint[];
  recentTransactions: TransactionWithDetails[];
  todayStr: string;
}

export function DashboardClient({
  locale,
  currency,
  balance,
  income,
  expenses,
  monthlyBudget,
  chartData,
  recentTransactions,
  todayStr,
}: DashboardClientProps) {
  const t = useTranslations("Dashboard");
  const isEn = locale.startsWith("en");

  const budget = calculateBudgetSummary(monthlyBudget, expenses);

  return (
    <div className="mx-auto w-full max-w-lg md:max-w-6xl px-4 md:px-8 py-6 md:py-8">
      <FadeIn delay={0.1}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">
          {t("monthSummary")}
        </p>
      </FadeIn>

      <div className="md:grid md:grid-cols-3 md:gap-4 mt-6">
        {/* Main Balance & Spending Ceiling Card */}
        <FadeIn
          delay={0.2}
          className="md:mt-0 rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-blue/5 border border-accent-blue/20 p-5 shadow-sm h-full flex flex-col justify-center"
        >
          <div className="flex items-center gap-2 text-accent-blue">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-medium">{t("balance")}</span>
          </div>
          <p
            data-testid="dashboard-balance"
            className="mt-2 text-3xl font-bold tabular-nums text-foreground"
          >
            {formatCurrency(balance, currency, locale)}
          </p>

          {budget.monthlyBudget > 0 ? (
            <div className="mt-4 pt-3 border-t border-border/60 dark:border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-muted-foreground font-medium">
                  {t("spendingCeiling")}
                </span>
                <span
                  data-testid="dashboard-ceiling-remaining"
                  className={cn(
                    "font-semibold tabular-nums",
                    budget.isOverBudget
                      ? "text-accent-red"
                      : "text-accent-green"
                  )}
                >
                  {formatCurrency(Math.abs(budget.remaining), currency, locale)}{" "}
                  {budget.isOverBudget ? t("exceeded") : t("remaining")}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted dark:bg-white/10 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    budget.isOverBudget ? "bg-accent-red" : "bg-accent-blue"
                  )}
                  style={{ width: `${budget.percentUsed}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground tabular-nums">
                {t("ofBudget", {
                  budget: formatCurrency(
                    budget.monthlyBudget,
                    currency,
                    locale
                  ),
                })}
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <Link
                href="/settings"
                className="text-xs font-medium text-accent-blue hover:underline cursor-pointer"
              >
                {t("setBudget")}
              </Link>
            </div>
          )}
        </FadeIn>

        {/* Income / Expense Cards */}
        <div className="mt-4 md:mt-0 grid grid-cols-2 md:grid-cols-2 md:col-span-2 gap-2.5 min-[360px]:gap-3 md:gap-4">
          <FadeIn
            delay={0.3}
            className="rounded-xl border border-border bg-card p-2.5 min-[360px]:p-3 sm:p-4 md:p-5 flex flex-col justify-center min-w-0"
          >
            <div className="flex justify-between items-start gap-1 min-[360px]:gap-1.5 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">
                  {t("income")}
                </p>
                <p
                  data-testid="dashboard-income"
                  className="mt-1 text-xs min-[360px]:text-sm sm:text-lg md:text-2xl font-bold tabular-nums text-accent-green truncate"
                >
                  {formatCurrency(income, currency, locale)}
                </p>
              </div>
              <div className="rounded-full bg-accent-green/10 p-1 min-[360px]:p-1.5 md:p-2 shrink-0">
                <ArrowUpRight className="h-3.5 w-3.5 min-[360px]:h-4 min-[360px]:w-4 md:h-5 md:w-5 text-accent-green" />
              </div>
            </div>
          </FadeIn>

          <FadeIn
            delay={0.4}
            className="rounded-xl border border-border bg-card p-2.5 min-[360px]:p-3 sm:p-4 md:p-5 flex flex-col justify-center min-w-0"
          >
            <div className="flex justify-between items-start gap-1 min-[360px]:gap-1.5 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-muted-foreground">
                  {t("expenses")}
                </p>
                <p
                  data-testid="dashboard-expenses"
                  className="mt-1 text-xs min-[360px]:text-sm sm:text-lg md:text-2xl font-bold tabular-nums text-accent-red truncate"
                >
                  {formatCurrency(expenses, currency, locale)}
                </p>
              </div>
              <div className="rounded-full bg-accent-red/10 p-1 min-[360px]:p-1.5 md:p-2 shrink-0">
                <ArrowDownRight className="h-3.5 w-3.5 min-[360px]:h-4 min-[360px]:w-4 md:h-5 md:w-5 text-accent-red" />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 md:gap-8 mt-6 md:mt-8">
        {/* Left Column (Transactions on Desktop) */}
        <div className="md:col-span-2 order-2 md:order-1">
          {/* Recent Transactions */}
          <div className="mt-8 md:mt-0 mb-4 flex items-center justify-between">
            <FadeIn delay={0.6}>
              <h2 className="text-base md:text-lg font-semibold">
                {t("recentTransactions")}
              </h2>
            </FadeIn>
            <FadeIn delay={0.6}>
              <Link
                href="/transactions"
                className="text-xs md:text-sm font-medium text-accent-blue hover:underline cursor-pointer"
              >
                {t("viewAll")}
              </Link>
            </FadeIn>
          </div>

          {recentTransactions.length === 0 ? (
            <FadeIn
              delay={0.7}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border dark:border-white/15 bg-card/40 py-12 px-4 text-center"
            >
              <Receipt className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-foreground">
                {t("noTransactions")}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {t("noTransactionsDesc")}
              </p>
            </FadeIn>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx, idx) => {
                const isIncome = tx.type === "income";
                const colorClass = isIncome
                  ? "text-accent-green"
                  : "text-accent-red";
                const categoryName = tx.category
                  ? resolveCategoryName(
                      tx.category.name,
                      isEn,
                      tx.category.name_en
                    )
                  : isEn
                  ? "Other"
                  : "Outros";
                const formattedDate = formatTransactionDate(
                  tx.date,
                  locale,
                  todayStr
                );

                return (
                  <FadeIn
                    key={tx.id}
                    delay={0.7 + idx * 0.08}
                    className="flex items-center justify-between p-3 md:p-4 rounded-xl border border-border bg-card transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                      <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-muted">
                        <CategoryIcon
                          name={tx.category?.icon}
                          className={cn("h-5 w-5 md:h-6 md:w-6", colorClass)}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm md:text-base font-medium truncate">
                          {tx.description}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {formattedDate} • {categoryName}
                        </p>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "text-sm md:text-base font-semibold tabular-nums shrink-0 ml-3",
                        colorClass
                      )}
                    >
                      {isIncome ? "+" : "−"}{" "}
                      {formatCurrency(Math.abs(tx.amount), currency, locale)}
                    </p>
                  </FadeIn>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (Chart on Desktop) */}
        <div className="md:col-span-1 order-1 md:order-2">
          {/* Chart */}
          <FadeIn
            delay={0.5}
            className="rounded-2xl border border-border bg-card p-5 h-full flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm md:text-base font-semibold">
                {t("categories")}
              </h2>
              <Link
                href="/categories"
                className="text-xs md:text-sm font-medium text-accent-blue hover:underline cursor-pointer"
              >
                {t("viewAll")}
              </Link>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[220px]">
              <CategoryChart
                data={chartData}
                currency={currency}
                locale={locale}
                className="w-full h-[220px]"
                innerRadius={70}
                outerRadius={95}
              />
            </div>

            {chartData.length > 0 && (
              <div className="pt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 mt-auto">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
