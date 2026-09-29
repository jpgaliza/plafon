"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Receipt,
  Search,
  Plus,
  ShoppingBag,
  Car,
  Wallet,
  Home,
  Dumbbell,
  Coffee,
  Laptop,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { FadeIn } from "@/components/ui/fade-in";
import { TransactionDrawer } from "@/components/transaction-drawer";

interface TransactionItem {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  categoryEn: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  dateEn: string;
  paymentMethod: string;
  paymentMethodEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SAMPLE_TRANSACTIONS: TransactionItem[] = [
  {
    id: "tx-1",
    name: "Mercado Pão de Açúcar",
    nameEn: "Supermarket",
    category: "Alimentação",
    categoryEn: "Food",
    amount: -120.5,
    type: "expense",
    date: "Hoje, 14:32",
    dateEn: "Today, 2:32 PM",
    paymentMethod: "Crédito",
    paymentMethodEn: "Credit",
    icon: ShoppingBag,
  },
  {
    id: "tx-2",
    name: "Uber",
    nameEn: "Uber",
    category: "Transporte",
    categoryEn: "Transport",
    amount: -35.0,
    type: "expense",
    date: "Ontem, 19:15",
    dateEn: "Yesterday, 7:15 PM",
    paymentMethod: "Crédito",
    paymentMethodEn: "Credit",
    icon: Car,
  },
  {
    id: "tx-3",
    name: "Café Especial",
    nameEn: "Specialty Coffee",
    category: "Alimentação",
    categoryEn: "Food",
    amount: -18.0,
    type: "expense",
    date: "Ontem, 09:40",
    dateEn: "Yesterday, 9:40 AM",
    paymentMethod: "Pix",
    paymentMethodEn: "Pix",
    icon: Coffee,
  },
  {
    id: "tx-4",
    name: "Salário Mensal",
    nameEn: "Monthly Salary",
    category: "Renda",
    categoryEn: "Income",
    amount: 15000.0,
    type: "income",
    date: "05/Set",
    dateEn: "Sep 5",
    paymentMethod: "Transferência",
    paymentMethodEn: "Transfer",
    icon: Wallet,
  },
  {
    id: "tx-5",
    name: "Aluguel Apartamento",
    nameEn: "Apartment Rent",
    category: "Moradia",
    categoryEn: "Housing",
    amount: -1200.0,
    type: "expense",
    date: "01/Set",
    dateEn: "Sep 1",
    paymentMethod: "Pix",
    paymentMethodEn: "Pix",
    icon: Home,
  },
  {
    id: "tx-6",
    name: "Freelance UI Design",
    nameEn: "Freelance UI Design",
    category: "Renda",
    categoryEn: "Income",
    amount: 3200.0,
    type: "income",
    date: "28/Ago",
    dateEn: "Aug 28",
    paymentMethod: "Pix",
    paymentMethodEn: "Pix",
    icon: Laptop,
  },
  {
    id: "tx-7",
    name: "Mensalidade Academia",
    nameEn: "Gym Membership",
    category: "Saúde",
    categoryEn: "Health",
    amount: -99.9,
    type: "expense",
    date: "25/Ago",
    dateEn: "Aug 25",
    paymentMethod: "Débito",
    paymentMethodEn: "Debit",
    icon: Dumbbell,
  },
];

export function TransactionsClient() {
  const t = useTranslations("Transactions");
  const tNewTx = useTranslations("NewTransaction");
  const locale = useLocale();
  const isEn = locale.startsWith("en");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredTransactions = SAMPLE_TRANSACTIONS.filter((tx) => {
    // Type filter
    if (filter === "income" && tx.type !== "income") return false;
    if (filter === "expense" && tx.type !== "expense") return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = isEn ? tx.nameEn.toLowerCase() : tx.name.toLowerCase();
      const cat = isEn
        ? tx.categoryEn.toLowerCase()
        : tx.category.toLowerCase();
      return name.includes(q) || cat.includes(q);
    }

    return true;
  });

  return (
    <>
      <TransactionDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-8 space-y-6">
        {/* Header */}
        <FadeIn
          delay={0.1}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isEn
                ? "Full log and history of all transactions"
                : "Extrato e histórico completo das suas transações"}
            </p>
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>{tNewTx("title")}</span>
          </button>
        </FadeIn>

        {/* Search & Filter Bar */}
        <FadeIn
          delay={0.2}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder={t("search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-card pl-10 pr-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 shrink-0">
            {(
              [
                { key: "all", label: t("all") },
                { key: "income", label: t("income") },
                { key: "expense", label: t("expense") },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "flex-1 sm:flex-initial rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer",
                  filter === tab.key
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Transactions List */}
        <FadeIn delay={0.3} className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-card/40 py-16 px-4 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                {t("noTransactions")}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTransactions.map((tx) => {
                const Icon = tx.icon;
                const isIncome = tx.type === "income";

                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3.5 md:p-4 rounded-xl border border-border bg-card transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={cn(
                          "flex h-10 w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl",
                          isIncome
                            ? "bg-accent-green/10 text-accent-green"
                            : "bg-accent-red/10 text-accent-red"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm md:text-base font-medium text-foreground truncate">
                          {isEn ? tx.nameEn : tx.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isEn ? tx.dateEn : tx.date} •{" "}
                          <span>{isEn ? tx.categoryEn : tx.category}</span>
                          <span className="hidden sm:inline">
                            {" "}
                            • {isEn ? tx.paymentMethodEn : tx.paymentMethod}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-4">
                      <p
                        className={cn(
                          "text-sm md:text-base font-semibold tabular-nums",
                          isIncome ? "text-accent-green" : "text-accent-red"
                        )}
                      >
                        {isIncome ? "+" : "−"}{" "}
                        {formatCurrency(
                          Math.abs(tx.amount),
                          undefined,
                          locale
                        )}
                      </p>
                      <span className="text-[10px] text-muted-foreground sm:hidden">
                        {isEn ? tx.paymentMethodEn : tx.paymentMethod}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </FadeIn>
      </div>
    </>
  );
}
