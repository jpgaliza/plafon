"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Drawer } from "vaul";
import { Calendar, Check, FolderPlus, Minus, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_CATEGORIES, PAYMENT_METHODS } from "@/lib/categories";
import { CategoryIcon } from "@/lib/icons";
import type {
  Group,
  TransactionType,
  PaymentMethod,
  TransactionWithDetails,
} from "@/lib/types";
import {
  createGroupAction,
  createTransactionAction,
  getUserGroupsAction,
  updateTransactionAction,
} from "@/app/(dashboard)/actions";

interface TransactionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: TransactionWithDetails | null;
}

export function TransactionDrawer({
  open,
  onOpenChange,
  transaction,
}: TransactionDrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-card outline-none">
          <Drawer.Handle className="mx-auto mb-2 mt-3 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          {open ? (
            <TransactionDrawerForm
              key={transaction?.id ?? "new"}
              transaction={transaction}
              onClose={() => onOpenChange(false)}
            />
          ) : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function getInitialCategoryIndex(
  transaction: TransactionWithDetails | null | undefined,
  type: TransactionType
): number | null {
  if (!transaction?.category) return null;
  const typeCats = DEFAULT_CATEGORIES.filter((c) => c.type === type);
  const idx = typeCats.findIndex(
    (c) =>
      c.name.toLowerCase() === transaction.category!.name.toLowerCase() ||
      c.nameEn.toLowerCase() === transaction.category!.name_en.toLowerCase()
  );
  return idx !== -1 ? idx : null;
}

function TransactionDrawerForm({
  transaction,
  onClose,
}: {
  transaction?: TransactionWithDetails | null;
  onClose: () => void;
}) {
  const t = useTranslations("NewTransaction");
  const locale = useLocale();
  const isEn = locale.startsWith("en");
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(transaction);

  const initialType: TransactionType = transaction?.type ?? "expense";
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState(() => {
    if (!transaction) return "";
    return isEn
      ? String(transaction.amount)
      : String(transaction.amount).replace(".", ",");
  });
  const [description, setDescription] = useState(
    () => transaction?.description ?? ""
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(() =>
    getInitialCategoryIndex(transaction, initialType)
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    () => transaction?.payment_method ?? "pix"
  );
  const [date, setDate] = useState(
    () => transaction?.date ?? new Date().toISOString().split("T")[0]
  );
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    () => transaction?.group_ids ?? []
  );
  const [showInlineGroup, setShowInlineGroup] = useState(false);
  const [inlineGroupName, setInlineGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getUserGroupsAction().then((loaded) => {
      if (active) {
        setGroups(loaded);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  function toggleGroupSelection(groupId: string) {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  }

  async function handleCreateInlineGroup() {
    const trimmed = inlineGroupName.trim();
    if (!trimmed || isCreatingGroup) return;
    setError(null);
    setIsCreatingGroup(true);
    try {
      const res = await createGroupAction(trimmed);
      if (res.success && res.group) {
        const created = res.group;
        setGroups((prev) =>
          prev.some((g) => g.id === created.id) ? prev : [created, ...prev]
        );
        setSelectedGroupIds((prev) =>
          prev.includes(created.id) ? prev : [...prev, created.id]
        );
        setInlineGroupName("");
        setShowInlineGroup(false);
      } else if (res.error) {
        setError(res.error);
      }
    } finally {
      setIsCreatingGroup(false);
    }
  }

  const filteredCategories = DEFAULT_CATEGORIES.filter(
    (cat) => cat.type === type
  );

  function handleSubmit() {
    const cat =
      selectedCategory !== null ? filteredCategories[selectedCategory] : null;
    const parsedAmount = parseFloat(amount.replace(",", "."));
    setError(null);

    startTransition(async () => {
      const payload = {
        amount: parsedAmount,
        description,
        type,
        category_icon: cat?.icon ?? "MoreHorizontal",
        category_name: cat
          ? isEn
            ? cat.nameEn
            : cat.name
          : isEn
          ? "Other"
          : "Outros",
        payment_method: paymentMethod,
        date,
        group_ids: selectedGroupIds,
      };

      const result =
        isEditing && transaction
          ? await updateTransactionAction({ ...payload, id: transaction.id })
          : await createTransactionAction(payload);

      if (result.success) {
        onClose();
      } else if (result.error) {
        setError(result.error);
      }
    });
  }

  const isFormValid =
    amount.length > 0 &&
    parseFloat(amount.replace(",", ".")) > 0 &&
    description.trim().length > 0;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-3">
        <Drawer.Title className="text-lg font-semibold">
          {isEditing ? t("editTitle") : t("title")}
        </Drawer.Title>
        <Drawer.Close asChild>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </Drawer.Close>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 no-scrollbar">
        {/* Type toggle */}
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => {
              setType("expense");
              setSelectedCategory(null);
            }}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all cursor-pointer",
              type === "expense"
                ? "bg-accent-red text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Minus className="h-4 w-4" />
              {t("expense")}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setType("income");
              setSelectedCategory(null);
            }}
            className={cn(
              "flex-1 rounded-lg py-2.5 text-sm font-medium transition-all cursor-pointer",
              type === "income"
                ? "bg-accent-green text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Plus className="h-4 w-4" />
              {t("income")}
            </span>
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-accent-red/30 bg-accent-red/10 px-3.5 py-2.5 text-xs text-accent-red">
            {error}
          </div>
        )}

        {/* Amount input */}
        <div className="mt-5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("amount")}
          </label>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 focus-within:border-accent-blue focus-within:ring-1 focus-within:ring-accent-blue/30">
            <span
              className={cn(
                "text-xl font-bold",
                type === "expense" ? "text-accent-red" : "text-accent-green"
              )}
            >
              {type === "expense" ? "−" : "+"}
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={isEn ? "0.00" : "0,00"}
              value={amount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.,]/g, "");
                setAmount(val);
              }}
              className="flex-1 bg-transparent text-2xl font-bold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/40"
              autoFocus
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground">
            {t("description")}
          </label>
          <input
            type="text"
            placeholder={
              isEn ? "e.g. Supermarket, Salary..." : "Ex: Mercado, Salário..."
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30"
          />
        </div>

        {/* Date */}
        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground">
            {t("date")}
          </label>
          <div
            className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3 cursor-pointer focus-within:border-accent-blue focus-within:ring-1 focus-within:ring-accent-blue/30"
            onClick={(e) => {
              const input = e.currentTarget.querySelector(
                'input[type="date"]'
              ) as HTMLInputElement;
              if (input && input.showPicker) {
                input.showPicker();
              } else if (input) {
                input.focus();
              }
            }}
          >
            <Calendar className="h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground outline-none cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if ("showPicker" in HTMLInputElement.prototype) {
                  e.currentTarget.showPicker();
                }
              }}
            />
          </div>
        </div>

        {/* Category grid */}
        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground">
            {t("category")}
          </label>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {filteredCategories.map((cat, idx) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(idx)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-xs transition-all cursor-pointer",
                  selectedCategory === idx
                    ? "bg-muted ring-2 ring-accent-blue"
                    : "hover:bg-muted/60"
                )}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <CategoryIcon
                    name={cat.icon}
                    className="h-5 w-5"
                    style={{ color: cat.color }}
                  />
                </div>
                <span className="truncate text-[11px] leading-tight text-muted-foreground">
                  {isEn ? cat.nameEn : cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground">
            {t("paymentMethod")}
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.value}
                type="button"
                onClick={() => setPaymentMethod(pm.value)}
                className={cn(
                  "rounded-lg px-3 py-2 text-xs font-medium transition-all cursor-pointer",
                  paymentMethod === pm.value
                    ? "bg-accent-blue text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {isEn ? pm.labelEn : pm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Groups (optional multi-select + inline create) */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              {t("groups")}{" "}
              <span className="text-muted-foreground/60">
                ({t("groupsOptional")})
              </span>
            </label>
            <button
              type="button"
              onClick={() => setShowInlineGroup((prev) => !prev)}
              data-testid="tx-drawer-create-group-toggle"
              className="inline-flex items-center gap-1 text-xs font-medium text-accent-blue hover:underline cursor-pointer"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span>{t("createGroupInline")}</span>
            </button>
          </div>

          {showInlineGroup && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                maxLength={80}
                placeholder={t("groupNamePlaceholder")}
                value={inlineGroupName}
                onChange={(e) => setInlineGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleCreateInlineGroup();
                  }
                }}
                data-testid="tx-drawer-new-group-input"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-accent-blue"
              />
              <button
                type="button"
                disabled={!inlineGroupName.trim() || isCreatingGroup}
                onClick={() => void handleCreateInlineGroup()}
                data-testid="tx-drawer-new-group-submit"
                className="inline-flex items-center gap-1 rounded-lg bg-accent-blue px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-blue/90 disabled:opacity-40 cursor-pointer"
              >
                {isCreatingGroup && (
                  <Loader2 className="h-3 w-3 animate-spin" />
                )}
                <span>{t("addGroupConfirm")}</span>
              </button>
            </div>
          )}

          {groups.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {groups.map((g) => {
                const isSelected = selectedGroupIds.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGroupSelection(g.id)}
                    data-testid={`tx-drawer-group-pill-${g.id}`}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                      isSelected
                        ? "border-accent-blue bg-accent-blue/15 text-white ring-1 ring-accent-blue"
                        : "border-white/10 bg-muted/60 text-muted-foreground hover:text-foreground hover:border-white/20"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-accent-blue" />}
                    <span>{g.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="button"
          disabled={!isFormValid || isPending}
          onClick={handleSubmit}
          className={cn(
            "mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
            type === "expense"
              ? "bg-accent-red text-white shadow-lg shadow-accent-red/20"
              : "bg-accent-green text-white shadow-lg shadow-accent-green/20"
          )}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEditing ? t("saveChanges") : t("addTransaction")}
        </button>
      </div>
    </>
  );
}
