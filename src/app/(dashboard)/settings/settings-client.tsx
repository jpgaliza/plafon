"use client";

import { useTranslations } from "next-intl";
import {
  Globe,
  Coins,
  Palette,
  LogOut,
  ChevronRight,
  Check,
} from "lucide-react";
import { LOCALES, CURRENCIES, type Locale, type Currency } from "@/lib/currency";
import {
  setLocaleAction,
  setCurrencyAction,
  setThemeAction,
} from "./actions";

interface SettingsClientProps {
  currentLocale: string;
  currentCurrency: string;
  currentTheme: string;
}

export function SettingsClient({
  currentLocale,
  currentCurrency,
  currentTheme,
}: SettingsClientProps) {
  const t = useTranslations("Settings");

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {/* Header */}
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

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
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
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
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
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
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
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

      {/* Logout */}
      <section className="rounded-xl border border-border bg-card">
        <button className="flex w-full items-center gap-3 px-4 py-3.5 text-sm transition-colors hover:bg-muted rounded-xl">
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
