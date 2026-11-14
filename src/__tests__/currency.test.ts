import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  getClientCurrency,
  getCurrencySymbol,
} from "@/lib/currency";

describe("currency utilities", () => {
  it("returns expected currency symbols", () => {
    expect(getCurrencySymbol("BRL")).toBe("R$");
    expect(getCurrencySymbol("USD")).toBe("$");
    expect(getCurrencySymbol("EUR")).toBe("€");
    expect(getCurrencySymbol()).toBe("R$");
  });

  it("formats BRL, USD, and EUR with explicit locales", () => {
    const brl = formatCurrency(1234.5, "BRL", "pt-BR");
    expect(brl).toContain("R$");
    expect(brl).toContain("1.234,50");

    const usd = formatCurrency(1234.5, "USD", "en-US");
    expect(usd).toBe("$1,234.50");

    const eur = formatCurrency(1234.5, "EUR", "de-DE");
    expect(eur).toContain("1.234,50");
    expect(eur).toContain("€");
  });

  it("falls back based on locale in node environment", () => {
    expect(getClientCurrency("en-US")).toBe("USD");
    expect(getClientCurrency("pt-BR")).toBe("BRL");
    expect(getClientCurrency()).toBe("BRL");
  });
});
