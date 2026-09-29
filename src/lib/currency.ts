export const CURRENCIES = ["BRL", "USD", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const LOCALES = ["pt-BR", "en-US"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Get active currency from client cookie or fallback based on locale.
 */
export function getClientCurrency(fallbackLocale?: string): Currency {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|;\s*)NEXT_CURRENCY=([^;]+)/);
    if (match && (CURRENCIES as readonly string[]).includes(match[1])) {
      return match[1] as Currency;
    }
  }
  return fallbackLocale?.startsWith("en") ? "USD" : "BRL";
}

/**
 * Return currency symbol ($, R$, €) based on currency.
 */
export function getCurrencySymbol(currency?: string): string {
  const active =
    currency || (typeof document !== "undefined" ? getClientCurrency() : "BRL");
  switch (active) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "BRL":
    default:
      return "R$";
  }
}

/**
 * Format a number as currency using Intl.NumberFormat.
 * Supports BRL, USD, EUR with proper locale formatting.
 * Automatically resolves active currency and locale if omitted.
 */
export function formatCurrency(
  amount: number,
  currency?: string,
  locale?: string
): string {
  const activeCurrency =
    currency ||
    (typeof document !== "undefined"
      ? getClientCurrency(locale)
      : locale?.startsWith("en")
      ? "USD"
      : "BRL");

  const localeMap: Record<string, string> = {
    BRL: "pt-BR",
    USD: "en-US",
    EUR: "de-DE",
  };

  const resolvedLocale =
    locale ||
    (typeof document !== "undefined" &&
    document.cookie.includes("NEXT_LOCALE=en-US")
      ? "en-US"
      : localeMap[activeCurrency] || "pt-BR");

  return new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency: activeCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

