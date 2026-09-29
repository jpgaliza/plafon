"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, Utensils, Home, Car, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { CategoryChart } from "@/components/category-chart";
import { FadeIn } from "@/components/ui/fade-in";

export default function CategoriesPage() {
  const t = useTranslations("CategoriesPage");
  const locale = useLocale();
  const isEn = locale.startsWith("en");

  const [selectedMonth, setSelectedMonth] = useState("2026-09");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Dynamic localized months
  const availableMonths = [
    {
      value: "2026-09",
      label: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(2026, 8, 1)),
    },
    {
      value: "2026-08",
      label: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(2026, 7, 1)),
    },
    {
      value: "2026-07",
      label: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(2026, 6, 1)),
    },
  ];

  const selectedMonthLabel =
    availableMonths.find((m) => m.value === selectedMonth)?.label || t("selectMonth");

  const totalExpenses = 2459.5;

  function getCategoryName(name: string) {
    if (!isEn) return name;
    const match = DEFAULT_CATEGORIES.find(
      (c) => c.name.toLowerCase() === name.toLowerCase() || c.nameEn.toLowerCase() === name.toLowerCase()
    );
    return match ? match.nameEn : name;
  }

  const chartData = [
    { name: getCategoryName("Moradia"), value: 1200, color: "#8B5CF6" },
    { name: getCategoryName("Alimentação"), value: 850, color: "#F97316" },
    { name: getCategoryName("Transporte"), value: 409.5, color: "#3B82F6" },
  ];

  const categoryDetails = [
    { id: 1, name: getCategoryName("Moradia"), icon: Home, color: "text-purple-500", bg: "bg-purple-500/10", spent: 1200, budget: 1500, hexColor: "#8B5CF6" },
    { id: 2, name: getCategoryName("Alimentação"), icon: Utensils, color: "text-orange-500", bg: "bg-orange-500/10", spent: 850, budget: 1000, hexColor: "#F97316" },
    { id: 3, name: getCategoryName("Transporte"), icon: Car, color: "text-blue-500", bg: "bg-blue-500/10", spent: 409.5, budget: 500, hexColor: "#3B82F6" },
  ];

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
                currency={isEn ? "USD" : "BRL"}
                locale={locale}
                className="w-full h-full"
                innerRadius={100}
                outerRadius={130}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none w-[180px] h-[180px] m-auto rounded-full overflow-hidden px-4 text-center">
                <span className="text-sm text-muted-foreground">{t("total")}</span>
                <span
                  className="text-xl md:text-2xl font-bold text-foreground truncate w-full"
                  title={formatCurrency(totalExpenses, isEn ? "USD" : "BRL", locale)}
                >
                  {formatCurrency(totalExpenses, isEn ? "USD" : "BRL", locale)}
                </span>
              </div>
            </div>

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
          </div>
        </FadeIn>

        {/* Categories List */}
        <div className="mt-8 md:mt-0 space-y-4">
          <FadeIn delay={0.3}>
            <h2 className="text-lg font-semibold mb-4">
              {t("breakdown")}
            </h2>
          </FadeIn>

          {categoryDetails.map((cat, idx) => {
            const percentage = Math.min((cat.spent / totalExpenses) * 100, 100);

            return (
              <FadeIn key={cat.id} delay={0.4 + idx * 0.1}>
                <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl",
                          cat.bg
                        )}
                      >
                        <cat.icon className={cn("h-6 w-6", cat.color)} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{cat.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(cat.spent, isEn ? "USD" : "BRL", locale)}
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
          })}
        </div>
      </div>
    </div>
  );
}
