"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Wallet, ShoppingBag, Car, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { CategoryChart } from "@/components/category-chart";
import { FadeIn } from "@/components/ui/fade-in";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isEn = locale.startsWith("en");

  // Dummy data
  const balance = 12540.50;
  const income = 15000.00;
  const expenses = 2459.50;

  const chartData = [
    { name: isEn ? "Housing" : "Moradia", value: 1200, color: "#8B5CF6" },
    { name: isEn ? "Food" : "Alimentação", value: 850, color: "#F97316" },
    { name: isEn ? "Transport" : "Transporte", value: 409.50, color: "#3B82F6" },
  ];

  const recentTransactions = [
    {
      id: 1,
      name: isEn ? "Supermarket" : "Mercado",
      category: isEn ? "Food" : "Alimentação",
      amount: -120.50,
      date: isEn ? "Today" : "Hoje",
      icon: ShoppingBag,
      color: "text-accent-red",
    },
    {
      id: 2,
      name: "Uber",
      category: isEn ? "Transport" : "Transporte",
      amount: -35.00,
      date: isEn ? "Yesterday" : "Ontem",
      icon: Car,
      color: "text-accent-red",
    },
    {
      id: 3,
      name: isEn ? "Salary" : "Salário",
      category: isEn ? "Income" : "Renda",
      amount: 15000.00,
      date: isEn ? "Sep 5" : "05/Set",
      icon: Wallet,
      color: "text-accent-green",
    },
    {
      id: 4,
      name: isEn ? "Rent" : "Aluguel",
      category: isEn ? "Housing" : "Moradia",
      amount: -1200.00,
      date: isEn ? "Sep 1" : "01/Set",
      icon: Home,
      color: "text-accent-red",
    },
  ];


  return (
    <div className="mx-auto w-full max-w-lg md:max-w-6xl px-4 md:px-8 py-6 md:py-8">
      <FadeIn delay={0.1}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm md:text-base text-muted-foreground">
          {t("monthSummary")}
        </p>
      </FadeIn>

      <div className="md:grid md:grid-cols-3 md:gap-4 mt-6">
        {/* Main Balance Card */}
        <FadeIn delay={0.2} className="md:mt-0 rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-blue/5 border border-accent-blue/20 p-5 shadow-sm h-full flex flex-col justify-center">
          <div className="flex items-center gap-2 text-accent-blue">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-medium">{t("balance")}</span>
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
            {formatCurrency(balance, undefined, locale)}
          </p>
        </FadeIn>

        {/* Income / Expense Cards */}
        <div className="mt-4 md:mt-0 grid grid-cols-2 md:grid-cols-2 md:col-span-2 gap-3 md:gap-4">
          <FadeIn delay={0.3} className="rounded-xl border border-border bg-card p-4 md:p-5 flex flex-col justify-center">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">{t("income")}</p>
                <p className="mt-1 text-lg md:text-2xl font-bold tabular-nums text-accent-green">
                  {formatCurrency(income, undefined, locale)}
                </p>
              </div>
              <div className="rounded-full bg-accent-green/10 p-1.5 md:p-2">
                <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-accent-green" />
              </div>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.4} className="rounded-xl border border-border bg-card p-4 md:p-5 flex flex-col justify-center">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">{t("expenses")}</p>
                <p className="mt-1 text-lg md:text-2xl font-bold tabular-nums text-accent-red">
                  {formatCurrency(expenses, undefined, locale)}
                </p>
              </div>
              <div className="rounded-full bg-accent-red/10 p-1.5 md:p-2">
                <ArrowDownRight className="h-4 w-4 md:h-5 md:w-5 text-accent-red" />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      <div className="md:grid md:grid-cols-3 md:gap-8 mt-6 md:mt-8">
        {/* Left Column (Transactions on Desktop) */}
        <div className="md:col-span-2 order-2 md:order-1">
          {/* Recent Transactions */}
          <div className="mt-8 md:mt-0 mb-4 flex items-center justify-between">
            <FadeIn delay={0.6}>
              <h2 className="text-base md:text-lg font-semibold">{t("recentTransactions")}</h2>
            </FadeIn>
            <FadeIn delay={0.6}>
              <Link href="/transactions" className="text-xs md:text-sm font-medium text-accent-blue hover:underline cursor-pointer">
                {t("viewAll")}
              </Link>
            </FadeIn>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((tx, idx) => (
              <FadeIn key={tx.id} delay={0.7 + idx * 0.1} className="flex items-center justify-between p-3 md:p-4 rounded-xl border border-border bg-card transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-muted">
                    <tx.icon className={cn("h-5 w-5 md:h-6 md:w-6", tx.color)} />
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-medium">{tx.name}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">{tx.date} • {tx.category}</p>
                  </div>
                </div>
                <p className={cn("text-sm md:text-base font-semibold tabular-nums", tx.color)}>
                  {tx.amount > 0 ? "+" : "−"} {formatCurrency(Math.abs(tx.amount), undefined, locale)}
                </p>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Right Column (Chart on Desktop) */}
        <div className="md:col-span-1 order-1 md:order-2">
          {/* Chart */}
          <FadeIn delay={0.5} className="rounded-2xl border border-border bg-card p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm md:text-base font-semibold">{t("categories")}</h2>
              <Link href="/categories" className="text-xs md:text-sm font-medium text-accent-blue hover:underline cursor-pointer">
                {t("viewAll")}
              </Link>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[220px]">
              <CategoryChart 
                data={chartData} 
                locale={locale}
                className="w-full h-full"
                innerRadius={70}
                outerRadius={95}
              />
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 mt-auto">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
