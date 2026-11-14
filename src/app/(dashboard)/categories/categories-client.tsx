"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, ChevronDown, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { resolveCategoryName } from "@/lib/finance";
import { CategoryIcon } from "@/lib/icons";
import type { TransactionWithDetails } from "@/lib/types";
import { CategoryChart } from "@/components/category-chart";
import { FadeIn } from "@/components/ui/fade-in";

interface CategoriesClientProps {
  transactions: TransactionWithDetails[];
  availableMonths: { value: string; label: string }[];
  defaultMonth: string;
  locale: string;
  currency: string;
}

export function CategoriesClient({
  transactions,
  availableMonths,
  defaultMonth,
  locale,
  currency,
}: CategoriesClientProps) {
  const t = useTranslations("CategoriesPage");
  const isEn = locale.startsWith("en");

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedMonthLabel =
    availableMonths.find((m) => m.value === selectedMonth)?.label ||
    t("selectMonth");

  const { totalExpenses, chartData, categoryDetails } = useMemo(() => {
    const monthExpenses = transactions.filter(
      (tx) => tx.type === "expense" && tx.date.startsWith(selectedMonth)
    );

    const map = new Map<
      string,
      {
        id: string;
        name: string;
        iconName: string;
        hexColor: string;
        spent: number;
      }
    >();

    let total = 0;

    for (const tx of monthExpenses) {
      total += tx.amount;
      const catId = tx.category?.id ?? "other";
      const catName = tx.category
        ? resolveCategoryName(tx.category.name, isEn, tx.category.name_en)
        : isEn
        ? "Other"
        : "Outros";
      const catIcon = tx.category?.icon ?? "MoreHorizontal";
      const catColor = tx.category?.color ?? "#6B7280";

      const existing = map.get(catId);
      if (existing) {
        existing.spent += tx.amount;
      } else {
        map.set(catId, {
          id: catId,
          name: catName,
          iconName: catIcon,
          hexColor: catColor,
          spent: tx.amount,
        });
      }
    }

    const details = Array.from(map.values()).sort((a, b) => b.spent - a.spent);
    const chart = details.map((d) => ({
      name: d.name,
      value: d.spent,
      color: d.hexColor,
    }));

    return {
      totalExpenses: total,
      chartData: chart,
      categoryDetails: details,
    };
  }, [transactions, selectedMonth, isEn]);

  return (
    <div className="mx-auto w-full max-w-lg md:max-w-4xl px-4 md:px-8 py-6 md:py-8">
      <FadeIn delay={0.1} className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors shrink-0 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <div className="relative inline-flex flex-col mt-1">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium outline-none cursor-pointer hover:text-foreground transition-colors group capitalize"
            >
              {selectedMonthLabel}
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2 z-50 w-48 rounded-xl border border-border bg-card shadow-lg shadow-black/50 overflow-hidden divide-y divide-border animate-in fade-in zoom-in-95 duration-200">
                  {availableMonths.map((month) => (
                    <button
                      key={month.value}
                      type="button"
                      onClick={() => {
                        setSelectedMonth(month.value);
                        setIsDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted/50 cursor-pointer capitalize",
                        selectedMonth === month.value
                          ? "text-foreground font-medium bg-muted/20"
                          : "text-muted-foreground"
                      )}
                    >
                      {month.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </FadeIn>

      <div className="md:grid md:grid-cols-2 md:gap-8">
        {/* Chart View */}
        <FadeIn delay={0.2}>
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col items-center justify-center shadow-sm">
            <h2 className="text-lg font-semibold w-full mb-6">
              {t("monthlySummary")}
            </h2>
            <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
              <CategoryChart
                data={chartData}
                currency={currency}
                locale={locale}
                className="w-full h-full"
                innerRadius={100}
                outerRadius={130}
              />
              {totalExpenses > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none w-[180px] h-[180px] m-auto rounded-full overflow-hidden px-4 text-center">
                  <span className="text-sm text-muted-foreground">
                    {t("total")}
                  </span>
                  <span
                    className="text-xl md:text-2xl font-bold text-foreground truncate w-full"
                    title={formatCurrency(totalExpenses, currency, locale)}
                  >
                    {formatCurrency(totalExpenses, currency, locale)}
                  </span>
                </div>
              )}
            </div>

            {chartData.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 w-full">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        {/* Categories List */}
        <div className="mt-8 md:mt-0 space-y-4">
          <FadeIn delay={0.3}>
            <h2 className="text-lg font-semibold mb-4">{t("breakdown")}</h2>
          </FadeIn>

          {categoryDetails.length === 0 ? (
            <FadeIn delay={0.35}>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-card/40 py-14 px-4 text-center">
                <PieChart className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-foreground">
                  {t("noData")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("noDataDesc")}
                </p>
              </div>
            </FadeIn>
          ) : (
            categoryDetails.map((cat, idx) => {
              const percentage =
                totalExpenses > 0
                  ? Math.min((cat.spent / totalExpenses) * 100, 100)
                  : 0;

              return (
                <FadeIn key={cat.id} delay={0.4 + idx * 0.08}>
                  <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${cat.hexColor}1a` }}
                        >
                          <CategoryIcon
                            name={cat.iconName}
                            className="h-6 w-6"
                            style={{ color: cat.hexColor }}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {cat.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(cat.spent, currency, locale)}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold tabular-nums text-foreground">
                        {percentage.toFixed(0)}%
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: cat.hexColor,
                        }}
                      />
                    </div>
                  </div>
                </FadeIn>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
