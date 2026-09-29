"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Drawer } from "vaul";
import {
  UtensilsCrossed,
  Gamepad2,
  Wrench,
  Heart,
  GraduationCap,
  ShoppingBag,
  Home,
  Car,
  MoreHorizontal,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_CATEGORIES, PAYMENT_METHODS } from "@/lib/categories";
import type { PaymentMethod } from "@/lib/types";
import { getCurrencySymbol } from "@/lib/currency";
import { createSubscriptionAction, type NewSubscriptionInput } from "@/app/(dashboard)/actions";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  UtensilsCrossed,
  Gamepad2,
  Wrench,
  Heart,
  GraduationCap,
  ShoppingBag,
  Home,
  Car,
  MoreHorizontal,
};

// Popular subscription presets for quick tap
const POPULAR_PRESETS = [
  { name: "Netflix", nameEn: "Netflix", amount: "55,90", category: "Lazer", categoryEn: "Entertainment", icon: "Gamepad2", color: "#E50914", dueDay: 10 },
  { name: "Spotify", nameEn: "Spotify", amount: "21,90", category: "Lazer", categoryEn: "Entertainment", icon: "Gamepad2", color: "#1DB954", dueDay: 15 },
  { name: "ChatGPT Plus", nameEn: "ChatGPT Plus", amount: "120,00", category: "Serviços", categoryEn: "Services", icon: "Wrench", color: "#10A37F", dueDay: 5 },
  { name: "Academia", nameEn: "Gym", amount: "99,00", category: "Saúde", categoryEn: "Health", icon: "Heart", color: "#EAB308", dueDay: 1 },
  { name: "iCloud / Google", nameEn: "iCloud / Google", amount: "14,90", category: "Serviços", categoryEn: "Services", icon: "Wrench", color: "#3B82F6", dueDay: 20 },
  { name: "Amazon Prime", nameEn: "Amazon Prime", amount: "19,90", category: "Compras", categoryEn: "Shopping", icon: "ShoppingBag", color: "#00A8E1", dueDay: 12 },
];

export interface SubscriptionItem {
  id: string;
  name: string;
  amount: number;
  due_day: number;
  payment_method: PaymentMethod;
  category_name: string;
  category_icon: string;
  category_color: string;
  is_active: boolean;
}

interface SubscriptionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (sub: SubscriptionItem) => void;
}

export function SubscriptionDrawer({
  open,
  onOpenChange,
  onCreated,
}: SubscriptionDrawerProps) {
  const t = useTranslations("NewSubscription");
  const locale = useLocale();
  const isEn = locale.startsWith("en");
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("10");
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");

  const expenseCategories = DEFAULT_CATEGORIES.filter(
    (cat) => cat.type === "expense"
  );

  function resetForm() {
    setName("");
    setAmount("");
    setDueDay("10");
    setSelectedCategory(0);
    setPaymentMethod("credit");
  }

  function handleSelectPreset(preset: typeof POPULAR_PRESETS[0]) {
    setName(isEn ? preset.nameEn : preset.name);
    setAmount(isEn ? preset.amount.replace(",", ".") : preset.amount);
    setDueDay(String(preset.dueDay));
    const catIdx = expenseCategories.findIndex(
      (c) =>
        c.name.toLowerCase() === preset.category.toLowerCase() ||
        c.nameEn.toLowerCase() === preset.categoryEn.toLowerCase()
    );
    if (catIdx !== -1) {
      setSelectedCategory(catIdx);
    }
  }

  function handleSubmit() {
    const parsedAmount = parseFloat(amount.replace(",", "."));
    const parsedDay = parseInt(dueDay, 10);
    const cat = expenseCategories[selectedCategory];

    const inputData: NewSubscriptionInput = {
      name,
      amount: parsedAmount,
      due_day: parsedDay,
      payment_method: paymentMethod,
      category_name: cat ? (isEn ? cat.nameEn : cat.name) : (isEn ? "Services" : "Serviços"),
      category_icon: cat?.icon ?? "Wrench",
      category_color: cat?.color ?? "#3B82F6",
    };

    startTransition(async () => {
      const result = await createSubscriptionAction(inputData);

      if (result.success) {
        if (onCreated) {
          onCreated({
            id: `sub_${Date.now()}`,
            name: inputData.name,
            amount: inputData.amount,
            due_day: inputData.due_day,
            payment_method: inputData.payment_method,
            category_name: inputData.category_name || (isEn ? "Services" : "Serviços"),
            category_icon: inputData.category_icon || "Wrench",
            category_color: inputData.category_color || "#3B82F6",
            is_active: true,
          });
        }
        resetForm();
        onOpenChange(false);
      }
    });
  }

  const isFormValid =
    name.trim().length > 0 &&
    amount.length > 0 &&
    parseFloat(amount.replace(",", ".")) > 0 &&
    parseInt(dueDay, 10) >= 1 &&
    parseInt(dueDay, 10) <= 31;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-2xl border-t border-white/10 bg-[#121215] outline-none">
          {/* Handle */}
          <Drawer.Handle className="mx-auto mb-2 mt-3 h-1.5 w-12 rounded-full bg-muted-foreground/30" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-5 pb-3">
            <div>
              <Drawer.Title className="text-lg font-semibold text-white">
                {t("title")}
              </Drawer.Title>
              <p className="text-xs text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
            <Drawer.Close asChild>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </Drawer.Close>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 no-scrollbar">
            {/* Quick Suggestions */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                <Sparkles className="h-3.5 w-3.5 text-accent-blue" />
                <span>{t("quickSuggestions")}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_PRESETS.map((preset) => {
                  const presetName = isEn ? preset.nameEn : preset.name;
                  const isSelected = name === presetName;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all cursor-pointer select-none",
                        isSelected
                          ? "border-accent-blue bg-accent-blue/15 text-white ring-1 ring-accent-blue shadow-sm"
                          : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:border-white/20 active:scale-95"
                      )}
                    >
                      <span
                        className="size-2 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span>{presetName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                {t("name")}
              </label>
              <input
                type="text"
                placeholder={t("namePlaceholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30"
              />
            </div>

            {/* Amount input */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                {t("amount")}
              </label>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-background px-4 py-3 focus-within:border-accent-blue focus-within:ring-1 focus-within:ring-accent-blue/30">
                <span className="text-xl font-bold text-accent-blue">
                  {getCurrencySymbol()}
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
                />
              </div>
            </div>

            {/* Due Day */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("dueDay")}
                </label>
                <span className="text-xs font-semibold text-accent-blue tabular-nums">
                  {t("dueDayLabel", { day: dueDay || "1" })}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent-blue"
                />
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(31, parseInt(e.target.value, 10) || 1));
                    setDueDay(String(val));
                  }}
                  className="w-14 text-center rounded-lg border border-white/10 bg-background py-1.5 text-sm font-semibold tabular-nums text-foreground outline-none focus:border-accent-blue"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                {t("category")}
              </label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {expenseCategories.map((cat, idx) => {
                  const Icon = ICON_MAP[cat.icon] || MoreHorizontal;
                  const catLabel = isEn ? cat.nameEn : cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setSelectedCategory(idx)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 text-xs transition-all cursor-pointer",
                        selectedCategory === idx
                          ? "bg-white/10 ring-2 ring-accent-blue"
                          : "hover:bg-white/5"
                      )}
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${cat.color}20` }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: cat.color }}
                        />
                      </div>
                      <span className="truncate text-[11px] leading-tight text-muted-foreground">
                        {catLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment method */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                {t("paymentMethod")}
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((pm) => {
                  const pmLabel = isEn ? pm.labelEn : pm.label;
                  return (
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
                      {pmLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              disabled={!isFormValid || isPending}
              onClick={handleSubmit}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-blue py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {t("submit")}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
