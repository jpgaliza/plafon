"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Drawer } from "vaul";
import {
  ArrowLeft,
  Check,
  FolderKanban,
  Loader2,
  Pencil,
  Plus,
  Receipt,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import {
  calculateGroupTotals,
  formatTransactionDate,
  resolveCategoryName,
} from "@/lib/finance";
import { CategoryIcon } from "@/lib/icons";
import type { Group, TransactionWithDetails } from "@/lib/types";
import {
  addTransactionsToGroupAction,
  removeTransactionFromGroupAction,
} from "@/app/(dashboard)/actions";
import { CategoryChart } from "@/components/category-chart";
import { GroupDrawer } from "@/components/group-drawer";
import { TransactionDrawer } from "@/components/transaction-drawer";
import { TransactionRow } from "@/components/transaction-row";
import { FadeIn } from "@/components/ui/fade-in";

interface GroupDetailClientProps {
  group: Group;
  groupTransactions: TransactionWithDetails[];
  availableTransactions: TransactionWithDetails[];
  locale: string;
  currency: string;
  todayStr: string;
}

type OptimisticGroupTxAction = { type: "remove"; txId: string };

function groupTransactionsReducer(
  state: TransactionWithDetails[],
  action: OptimisticGroupTxAction
): TransactionWithDetails[] {
  if (action.type === "remove") {
    return state.filter((tx) => tx.id !== action.txId);
  }
  return state;
}

export function GroupDetailClient({
  group,
  groupTransactions: initialGroupTransactions,
  availableTransactions,
  locale,
  currency,
  todayStr,
}: GroupDetailClientProps) {
  const t = useTranslations("Groups");
  const isEn = locale.startsWith("en");

  const [groupTransactions, applyOptimistic] = useOptimistic(
    initialGroupTransactions,
    groupTransactionsReducer
  );
  const [renameOpen, setRenameOpen] = useState(false);
  const [addExistingOpen, setAddExistingOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<TransactionWithDetails | null>(
    null
  );
  const [txDrawerOpen, setTxDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(
    () => calculateGroupTotals(groupTransactions),
    [groupTransactions]
  );

  const chartData = useMemo(() => {
    const expenses = groupTransactions.filter((tx) => tx.type === "expense");
    const map = new Map<
      string,
      { name: string; value: number; color: string }
    >();

    for (const tx of expenses) {
      const catId = tx.category?.id ?? "other";
      const name = tx.category
        ? resolveCategoryName(tx.category.name, isEn, tx.category.name_en)
        : isEn
        ? "Other"
        : "Outros";
      const color = tx.category?.color ?? "#6B7280";

      const existing = map.get(catId);
      if (existing) {
        existing.value += tx.amount;
      } else {
        map.set(catId, { name, value: tx.amount, color });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, [groupTransactions, isEn]);

  async function handleRemoveFromGroup(txId: string) {
    startTransition(async () => {
      applyOptimistic({ type: "remove", txId });
      await removeTransactionFromGroupAction(group.id, txId);
    });
  }

  return (
    <>
      <GroupDrawer
        open={renameOpen}
        onOpenChange={setRenameOpen}
        group={{ id: group.id, name: group.name }}
      />

      <AddExistingTransactionsDrawer
        open={addExistingOpen}
        onOpenChange={setAddExistingOpen}
        groupId={group.id}
        availableTransactions={availableTransactions}
        locale={locale}
        currency={currency}
        todayStr={todayStr}
      />

      <TransactionDrawer
        open={txDrawerOpen}
        onOpenChange={(open) => {
          setTxDrawerOpen(open);
          if (!open) setEditingTx(null);
        }}
        transaction={editingTx}
      />

      <div className="mx-auto w-full max-w-lg md:max-w-6xl px-4 md:px-8 py-6 md:py-8 space-y-6">
        {/* Back link & header */}
        <FadeIn delay={0.1} className="space-y-4">
          <Link
            href="/groups"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 -ml-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("backToGroups")}</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1
                    data-testid="group-detail-title"
                    className="text-2xl md:text-3xl font-bold tracking-tight text-foreground truncate"
                  >
                    {group.name}
                  </h1>
                  <button
                    type="button"
                    onClick={() => setRenameOpen(true)}
                    title={t("renameGroup")}
                    aria-label={t("renameGroup")}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-colors hover:border-border dark:hover:border-white/10 hover:bg-muted dark:hover:bg-white/5 hover:text-foreground cursor-pointer"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("transactionCount", { count: totals.transactionCount })}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAddExistingOpen(true)}
              data-testid="add-existing-tx-button"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>{t("addExisting")}</span>
            </button>
          </div>
        </FadeIn>

        {/* Group Totals: show ONLY "Total gasto" unless group has >= 1 income */}
        <FadeIn
          delay={0.2}
          className={cn(
            "grid gap-4",
            totals.hasIncome ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1"
          )}
        >
          <div className="rounded-2xl border border-border dark:border-white/10 bg-card p-5 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground">
              {t("totalSpent")}
            </p>
            <p
              data-testid="group-total-spent"
              className="mt-1 text-2xl md:text-3xl font-bold tabular-nums tracking-tight text-accent-red"
            >
              {formatCurrency(totals.totalSpent, currency, locale)}
            </p>
          </div>

          {totals.hasIncome && (
            <>
              <div className="rounded-2xl border border-border dark:border-white/10 bg-card p-5 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("totalReceived")}
                </p>
                <p
                  data-testid="group-total-received"
                  className="mt-1 text-2xl md:text-3xl font-bold tabular-nums tracking-tight text-accent-green"
                >
                  {formatCurrency(totals.totalReceived, currency, locale)}
                </p>
              </div>

              <div className="rounded-2xl border border-border dark:border-white/10 bg-card p-5 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("balance")}
                </p>
                <p
                  data-testid="group-balance"
                  className={cn(
                    "mt-1 text-2xl md:text-3xl font-bold tabular-nums tracking-tight",
                    totals.balance >= 0
                      ? "text-accent-green"
                      : "text-accent-red"
                  )}
                >
                  {formatCurrency(totals.balance, currency, locale)}
                </p>
              </div>
            </>
          )}
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Category Breakdown Chart */}
          <FadeIn
            delay={0.3}
            className="md:col-span-1 rounded-2xl border border-border bg-card p-5 flex flex-col"
          >
            <h2 className="text-sm md:text-base font-semibold mb-4">
              {t("categoriesBreakdown")}
            </h2>
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

          {/* Transactions List */}
          <FadeIn delay={0.35} className="md:col-span-2 space-y-3">
            <h2 className="text-base md:text-lg font-semibold">
              {t("groupTransactions")}
            </h2>

            {groupTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border dark:border-white/10 bg-card/50 px-6 py-12 text-center">
                <Receipt className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-foreground">
                  {t("noTransactionsInGroup")}
                </p>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  {t("noTransactionsInGroupDesc")}
                </p>
                <button
                  type="button"
                  onClick={() => setAddExistingOpen(true)}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border dark:border-white/10 bg-muted dark:bg-white/5 px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t("addExisting")}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {groupTransactions.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    locale={locale}
                    currency={currency}
                    todayStr={todayStr}
                    onEdit={(selected) => {
                      setEditingTx(selected);
                      setTxDrawerOpen(true);
                    }}
                    onRemoveFromGroup={handleRemoveFromGroup}
                    isBusy={isPending}
                  />
                ))}
              </div>
            )}
          </FadeIn>
        </div>
      </div>
    </>
  );
}

function AddExistingTransactionsDrawer({
  open,
  onOpenChange,
  groupId,
  availableTransactions,
  locale,
  currency,
  todayStr,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  availableTransactions: TransactionWithDetails[];
  locale: string;
  currency: string;
  todayStr: string;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 md:left-64 md:bottom-4 z-50 mx-auto flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden no-scrollbar rounded-t-2xl md:rounded-2xl border-t md:border border-border dark:border-white/10 bg-card md:shadow-2xl outline-none">
          <Drawer.Handle className="mx-auto mb-2 mt-3 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          {open ? (
            <AddExistingTransactionsContent
              key={groupId}
              groupId={groupId}
              availableTransactions={availableTransactions}
              locale={locale}
              currency={currency}
              todayStr={todayStr}
              onClose={() => onOpenChange(false)}
            />
          ) : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function AddExistingTransactionsContent({
  groupId,
  availableTransactions,
  locale,
  currency,
  todayStr,
  onClose,
}: {
  groupId: string;
  availableTransactions: TransactionWithDetails[];
  locale: string;
  currency: string;
  todayStr: string;
  onClose: () => void;
}) {
  const t = useTranslations("Groups");
  const isEn = locale.startsWith("en");

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = availableTransactions.filter((tx) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const desc = tx.description.toLowerCase();
    const cat = tx.category
      ? resolveCategoryName(
          tx.category.name,
          isEn,
          tx.category.name_en
        ).toLowerCase()
      : "";
    return desc.includes(q) || cat.includes(q);
  });

  function toggleId(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleConfirm() {
    if (selectedIds.length === 0 || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await addTransactionsToGroupAction(groupId, selectedIds);
      if (result.success) {
        onClose();
      } else if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-border/60 dark:border-white/5 px-5 pb-3">
        <div>
          <Drawer.Title className="text-lg font-semibold text-foreground">
            {t("selectTransactionsTitle")}
          </Drawer.Title>
          <p className="text-xs text-muted-foreground">
            {t("selectTransactionsSubtitle")}
          </p>
        </div>
        <Drawer.Close asChild>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </Drawer.Close>
      </div>

      <div className="px-5 pt-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("searchTransactions")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="add-existing-search"
            className="min-w-0 w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30"
          />
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-accent-red/30 bg-accent-red/10 px-3.5 py-2.5 text-xs text-accent-red">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden px-5 py-4 space-y-2.5 no-scrollbar">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border dark:border-white/10 bg-card/40 py-10 px-4 text-center">
            <Receipt className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              {t("noAvailableTransactions")}
            </p>
          </div>
        ) : (
          filtered.map((tx) => {
            const isSelected = selectedIds.includes(tx.id);
            const isIncome = tx.type === "income";
            const categoryLabel = tx.category
              ? resolveCategoryName(tx.category.name, isEn, tx.category.name_en)
              : isEn
              ? "Other"
              : "Outros";
            return (
              <button
                key={tx.id}
                type="button"
                onClick={() => toggleId(tx.id)}
                data-testid={`select-existing-tx-${tx.id}`}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-accent-blue bg-accent-blue/10"
                    : "border-border bg-background hover:bg-muted/40"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      isSelected
                        ? "border-accent-blue bg-accent-blue text-white"
                        : "border-border dark:border-white/20 bg-transparent"
                    )}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </div>
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      isIncome
                        ? "bg-accent-green/10 text-accent-green"
                        : "bg-accent-red/10 text-accent-red"
                    )}
                  >
                    <CategoryIcon name={tx.category?.icon} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatTransactionDate(tx.date, locale, todayStr)} •{" "}
                      {categoryLabel}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums shrink-0",
                    isIncome ? "text-accent-green" : "text-accent-red"
                  )}
                >
                  {isIncome ? "+" : "−"}{" "}
                  {formatCurrency(Math.abs(tx.amount), currency, locale)}
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="border-t border-border/60 dark:border-white/5 px-5 py-4">
        <button
          type="button"
          disabled={selectedIds.length === 0 || isPending}
          onClick={handleConfirm}
          data-testid="confirm-add-existing-tx"
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all cursor-pointer",
            selectedIds.length > 0 && !isPending
              ? "bg-accent-blue text-white shadow-lg shadow-accent-blue/25 hover:bg-accent-blue/90 active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{t("addSelected", { count: selectedIds.length })}</span>
        </button>
      </div>
    </>
  );
}
