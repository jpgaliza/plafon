/**
 * Format a number as currency using Intl.NumberFormat.
 * Supports BRL, USD, EUR with proper locale formatting.
 */
export function formatCurrency(
  amount: number,
  currency: string = "BRL",
  locale?: string
): string {
  const localeMap: Record<string, string> = {
    BRL: "pt-BR",
    USD: "en-US",
    EUR: "de-DE",
  };

  const resolvedLocale = locale || localeMap[currency] || "pt-BR";

  return new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Available currencies for the app.
 */
export const CURRENCIES = ["BRL", "USD", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

/**
 * Available locales for the app.
 */
export const LOCALES = ["pt-BR", "en-US"] as const;
export type Locale = (typeof LOCALES)[number];
