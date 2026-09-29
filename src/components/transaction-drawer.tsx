"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Drawer } from "vaul";
import {
  UtensilsCrossed,
  Car,
  Home,
  Heart,
  GraduationCap,
  Gamepad2,
  ShoppingBag,
  Wrench,
  Banknote,
  Laptop,
  TrendingUp,
  MoreHorizontal,
  Calendar,
  Minus,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_CATEGORIES, PAYMENT_METHODS } from "@/lib/categories";
import type { TransactionType, PaymentMethod } from "@/lib/types";
import { createTransactionAction } from "@/app/(dashboard)/actions";

// Map icon name strings to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  UtensilsCrossed,
  Car,
  Home,
  Heart,
  GraduationCap,
  Gamepad2,
  ShoppingBag,
  Wrench,
  Banknote,
  Laptop,
  TrendingUp,
  MoreHorizontal,
};

interface TransactionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDrawer({
  open,
  onOpenChange,
}: TransactionDrawerProps) {
  const t = useTranslations("NewTransaction");
  const locale = useLocale();
  const isEn = locale.startsWith("en");
  const [isPending, startTransition] = useTransition();

  // Form state
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const filteredCategories = DEFAULT_CATEGORIES.filter(
    (cat) => cat.type === type
  );

  function resetForm() {
    setAmount("");
    setDescription("");
    setSelectedCategory(null);
    setPaymentMethod("pix");
    setDate(new Date().toISOString().split("T")[0]);
  }

  function handleSubmit() {
    const cat = selectedCategory !== null ? filteredCategories[selectedCategory] : null;

    startTransition(async () => {
      const result = await createTransactionAction({
        amount: parseFloat(amount.replace(",", ".")),
        description,
        type,
        category_icon: cat?.icon ?? "MoreHorizontal",
        category_name: cat ? (isEn ? cat.nameEn : cat.name) : (isEn ? "Other" : "Outros"),
        payment_method: paymentMethod,
        date,
      });

      if (result.success) {
        resetForm();
        onOpenChange(false);
      }
    });
  }

  const isFormValid =
    amount.length > 0 &&
    parseFloat(amount.replace(",", ".")) > 0 &&
    description.trim().length > 0;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl bg-card outline-none">
          {/* Handle */}
          <Drawer.Handle className="mx-auto mb-2 mt-3 h-1.5 w-12 rounded-full bg-muted-foreground/30" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3">
            <Drawer.Title className="text-lg font-semibold">
              {t("title")}
            </Drawer.Title>
            <Drawer.Close asChild>
              <button className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer">
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
                    // Allow only numbers, comma and dot
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
                placeholder={isEn ? "e.g. Supermarket, Salary..." : "Ex: Mercado, Salário..."}
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
                  const input = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
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
                    // Prevent double firing if clicking directly on the input
                    e.stopPropagation(); 
                    if ('showPicker' in HTMLInputElement.prototype) {
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
                {filteredCategories.map((cat, idx) => {
                  const Icon = ICON_MAP[cat.icon] || MoreHorizontal;
                  return (
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
                        <Icon
                          className="h-5 w-5"
                          style={{ color: cat.color }}
                        />
                      </div>
                      <span className="truncate text-[11px] leading-tight text-muted-foreground">
                        {isEn ? cat.nameEn : cat.name}
                      </span>
                    </button>
                  );
                })}
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
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {t("addTransaction")}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
