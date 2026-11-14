"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Receipt, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveCategoryName } from "@/lib/finance";
import type { TransactionWithDetails } from "@/lib/types";
import { deleteTransactionAction } from "@/app/(dashboard)/actions";
import { FadeIn } from "@/components/ui/fade-in";
import { TransactionDrawer } from "@/components/transaction-drawer";
import { TransactionRow } from "@/components/transaction-row";

interface TransactionsClientProps {
  transactions: TransactionWithDetails[];
  locale: string;
  currency: string;
  todayStr: string;
}

export function TransactionsClient({
  transactions,
  locale,
  currency,
  todayStr,
}: TransactionsClientProps) {
  const t = useTranslations("Transactions");
  const tNewTx = useTranslations("NewTransaction");
  const isEn = locale.startsWith("en");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionWithDetails | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "income" && tx.type !== "income") return false;
    if (filter === "expense" && tx.type !== "expense") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const desc = tx.description.toLowerCase();
      const cat = tx.category
        ? resolveCategoryName(
            tx.category.name,
            isEn,
            tx.category.name_en
          ).toLowerCase()
        : (isEn ? "other" : "outros");
      return desc.includes(q) || cat.includes(q);
    }

    return true;
  });

  function handleOpenCreate() {
    setEditingTx(null);
    setDrawerOpen(true);
  }

  function handleOpenEdit(tx: TransactionWithDetails) {
    setEditingTx(tx);
    setDrawerOpen(true);
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTransactionAction(id);
    });
  }

  return (
    <>
      <TransactionDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setEditingTx(null);
        }}
        transaction={editingTx}
      />

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
              {t("subtitle")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
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
                type="button"
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
              <p className="text-sm font-medium text-foreground">
                {t("noTransactions")}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {t("noTransactionsDesc")}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTransactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  locale={locale}
                  currency={currency}
                  todayStr={todayStr}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  isBusy={isPending}
                />
              ))}
            </div>
          )}
        </FadeIn>
      </div>
    </>
  );
}
