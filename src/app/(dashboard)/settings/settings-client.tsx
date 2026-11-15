"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Globe,
  Coins,
  Palette,
  LogOut,
  ChevronRight,
  Check,
  Target,
  Loader2,
} from "lucide-react";
import {
  LOCALES,
  CURRENCIES,
  getCurrencySymbol,
  type Locale,
  type Currency,
} from "@/lib/currency";
import { parseAmountInput } from "@/lib/finance";
import {
  setLocaleAction,
  setCurrencyAction,
  setThemeAction,
  setMonthlyBudgetAction,
} from "./actions";
import { signOutAction } from "@/app/auth/actions";

interface SettingsClientProps {
  currentLocale: string;
  currentCurrency: string;
  currentTheme: string;
  initialMonthlyBudget?: number;
}

export function SettingsClient({
  currentLocale,
  currentCurrency,
  currentTheme,
  initialMonthlyBudget = 0,
}: SettingsClientProps) {
  const t = useTranslations("Settings");
  const isEn = currentLocale.startsWith("en");
  const [budgetInput, setBudgetInput] = useState(() => {
    if (!initialMonthlyBudget || initialMonthlyBudget <= 0) return "";
    const fixed = initialMonthlyBudget.toFixed(2);
    return isEn ? fixed : fixed.replace(".", ",");
  });
  const [budgetSaved, setBudgetSaved] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [isSavingBudget, startTransition] = useTransition();

  function handleSaveBudget(e: React.FormEvent) {
    e.preventDefault();
    setBudgetSaved(false);
    setBudgetError(null);

    const trimmed = budgetInput.trim();
    const parsed = trimmed === "" ? 0 : parseAmountInput(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setBudgetError("Valor inválido.");
      return;
    }

    startTransition(async () => {
      const result = await setMonthlyBudgetAction(parsed);
      if (result.success) {
        setBudgetSaved(true);
      } else if (result.error) {
        setBudgetError(result.error);
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-lg md:max-w-6xl px-4 md:px-8 py-6 md:py-8 space-y-6">
      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
        {t("title")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Spending Ceiling */}
      <section className="rounded-xl border border-border bg-card p-1">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-blue/10">
            <Target className="h-5 w-5 text-accent-blue" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{t("monthlyBudget")}</p>
            <p className="text-xs text-muted-foreground">
              {t("monthlyBudgetDescription")}
            </p>
          </div>
        </div>
        <form onSubmit={handleSaveBudget} className="px-3 pb-3 pt-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 focus-within:border-accent-blue focus-within:ring-1 focus-within:ring-accent-blue/30">
              <span className="text-sm font-semibold text-muted-foreground">
                {getCurrencySymbol(currentCurrency)}
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder={t("monthlyBudgetPlaceholder")}
                value={budgetInput}
                onChange={(e) => {
                  setBudgetSaved(false);
                  setBudgetError(null);
                  setBudgetInput(e.target.value.replace(/[^0-9.,]/g, ""));
                }}
                data-testid="monthly-budget-input"
                className="w-full bg-transparent text-sm font-semibold tabular-nums text-foreground outline-none placeholder:text-muted-foreground/40"
              />
            </div>
            <button
              type="submit"
              disabled={isSavingBudget}
              data-testid="monthly-budget-save"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-accent-blue px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-accent-blue/90 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isSavingBudget && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{t("saveBudget")}</span>
            </button>
          </div>
          {budgetSaved && (
            <p
              data-testid="monthly-budget-saved"
              className="flex items-center gap-1.5 text-xs text-accent-green"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{t("budgetSaved")}</span>
            </p>
          )}
          {budgetError && (
            <p className="text-xs text-accent-red">{budgetError}</p>
          )}
        </form>
      </section>

      {/* Language */}
      <section className="rounded-xl border border-border bg-card p-1">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-blue/10">
            <Globe className="h-5 w-5 text-accent-blue" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{t("language")}</p>
            <p className="text-xs text-muted-foreground">
              {t("languageDescription")}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 px-1 pb-1">
          {LOCALES.map((locale) => (
            <button
              key={locale}
              onClick={() => setLocaleAction(locale as Locale)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted cursor-pointer"
            >
              <span>
                {t(`languages.${locale}` as Parameters<typeof t>[0])}
              </span>
              {currentLocale === locale && (
                <Check className="h-4 w-4 text-accent-green" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Currency */}
      <section className="rounded-xl border border-border bg-card p-1">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-green/10">
            <Coins className="h-5 w-5 text-accent-green" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{t("currency")}</p>
            <p className="text-xs text-muted-foreground">
              {t("currencyDescription")}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 px-1 pb-1">
          {CURRENCIES.map((currency) => (
            <button
              key={currency}
              onClick={() => setCurrencyAction(currency as Currency)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted cursor-pointer"
            >
              <span>
                {t(`currencies.${currency}` as Parameters<typeof t>[0])}
              </span>
              {currentCurrency === currency && (
                <Check className="h-4 w-4 text-accent-green" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Theme */}
      <section className="rounded-xl border border-border bg-card p-1">
        <div className="flex items-center gap-3 px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
            <Palette className="h-5 w-5 text-purple-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{t("theme")}</p>
            <p className="text-xs text-muted-foreground">
              {t("themeDescription")}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-0.5 px-1 pb-1">
          {(["dark", "light", "system"] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => setThemeAction(theme)}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted cursor-pointer"
            >
              <span>
                {t(`theme${theme.charAt(0).toUpperCase() + theme.slice(1)}` as Parameters<typeof t>[0])}
              </span>
              {currentTheme === theme && (
                <Check className="h-4 w-4 text-accent-green" />
              )}
            </button>
          ))}
        </div>
      </section>
      </div>

      {/* Logout */}
      <section className="rounded-xl border border-border bg-card">
        <button
          onClick={() => signOutAction()}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-muted rounded-xl cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-red/10">
            <LogOut className="h-5 w-5 text-accent-red" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-accent-red">{t("logout")}</p>
            <p className="text-xs text-muted-foreground">
              {t("logoutDescription")}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </section>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground">
        {t("version")} 0.1.0
      </p>
    </div>
  );
}
