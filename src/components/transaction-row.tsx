"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X, Unlink } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { PAYMENT_METHODS } from "@/lib/categories";
import { formatTransactionDate, resolveCategoryName } from "@/lib/finance";
import { CategoryIcon } from "@/lib/icons";
import type { TransactionWithDetails } from "@/lib/types";

interface TransactionRowProps {
  tx: TransactionWithDetails;
  locale: string;
  currency: string;
  todayStr: string;
  onEdit?: (tx: TransactionWithDetails) => void;
  onDelete?: (id: string) => Promise<void> | void;
  onRemoveFromGroup?: (id: string) => Promise<void> | void;
  isBusy?: boolean;
}

export function TransactionRow({
  tx,
  locale,
  currency,
  todayStr,
  onEdit,
  onDelete,
  onRemoveFromGroup,
  isBusy = false,
}: TransactionRowProps) {
  const t = useTranslations("Transactions");
  const tGroups = useTranslations("Groups");
  const tCommon = useTranslations("Common");
  const isEn = locale.startsWith("en");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isIncome = tx.type === "income";
  const categoryLabel = tx.category
    ? resolveCategoryName(tx.category.name, isEn, tx.category.name_en)
    : isEn
    ? "Other"
    : "Outros";
  const pmMatch = PAYMENT_METHODS.find((p) => p.value === tx.payment_method);
  const paymentLabel = pmMatch
    ? isEn
      ? pmMatch.labelEn
      : pmMatch.label
    : tx.payment_method;
  const formattedDate = formatTransactionDate(tx.date, locale, todayStr);

  return (
    <div
      data-testid={`transaction-row-${tx.id}`}
      className="flex items-center justify-between p-3.5 md:p-4 rounded-xl border border-border bg-card transition-colors hover:bg-muted/40 gap-3"
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
          <CategoryIcon name={tx.category?.icon} className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm md:text-base font-medium text-foreground truncate">
            {tx.description}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formattedDate} • <span>{categoryLabel}</span>
            <span className="hidden sm:inline"> • {paymentLabel}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <p
            className={cn(
              "text-sm md:text-base font-semibold tabular-nums",
              isIncome ? "text-accent-green" : "text-accent-red"
            )}
          >
            {isIncome ? "+" : "−"}{" "}
            {formatCurrency(Math.abs(tx.amount), currency, locale)}
          </p>
          <span className="text-[10px] text-muted-foreground sm:hidden">
            {paymentLabel}
          </span>
        </div>

        {onEdit && !confirmingDelete && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onEdit(tx)}
            title={t("editTransaction")}
            aria-label={t("editTransaction")}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground/70 transition-all hover:border-border dark:hover:border-white/10 hover:bg-muted dark:hover:bg-white/5 hover:text-foreground cursor-pointer disabled:opacity-40"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}

        {onDelete && !confirmingDelete && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => setConfirmingDelete(true)}
            title={t("deleteTransaction")}
            aria-label={t("deleteTransaction")}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground/60 transition-all hover:border-accent-red/20 hover:bg-accent-red/10 hover:text-accent-red cursor-pointer disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}

        {onDelete && confirmingDelete && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={isBusy}
              onClick={async () => {
                await onDelete(tx.id);
                setConfirmingDelete(false);
              }}
              title={tCommon("confirm")}
              aria-label={tCommon("confirm")}
              className="flex h-8 items-center gap-1 rounded-lg border border-accent-red/30 bg-accent-red/15 px-2 text-xs font-medium text-accent-red hover:bg-accent-red/25 transition-colors cursor-pointer disabled:opacity-40"
            >
              <Check className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("confirmDelete")}</span>
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setConfirmingDelete(false)}
              title={tCommon("cancel")}
              aria-label={tCommon("cancel")}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border dark:border-white/10 bg-muted dark:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {onRemoveFromGroup && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onRemoveFromGroup(tx.id)}
            title={tGroups("removeFromGroup")}
            aria-label={tGroups("removeFromGroup")}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground/60 transition-all hover:border-accent-red/20 hover:bg-accent-red/10 hover:text-accent-red cursor-pointer disabled:opacity-40"
          >
            <Unlink className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
