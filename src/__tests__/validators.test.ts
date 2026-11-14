import { describe, expect, it } from "vitest";
import {
  validateGroupName,
  validateMonthlyBudget,
  validateSubscriptionInput,
  validateTransactionInput,
} from "@/lib/validators";

describe("validateTransactionInput", () => {
  const validPayload = {
    amount: 42.5,
    description: "Almoço",
    type: "expense" as const,
    payment_method: "pix" as const,
    date: "2026-11-14",
  };

  it("accepts a valid transaction payload", () => {
    expect(validateTransactionInput(validPayload)).toEqual({ valid: true });
  });

  it("rejects zero, negative, or NaN amounts", () => {
    expect(validateTransactionInput({ ...validPayload, amount: 0 }).valid).toBe(false);
    expect(validateTransactionInput({ ...validPayload, amount: -10 }).valid).toBe(false);
    expect(validateTransactionInput({ ...validPayload, amount: NaN }).valid).toBe(false);
  });

  it("rejects blank descriptions and invalid calendar dates", () => {
    expect(validateTransactionInput({ ...validPayload, description: "   " }).valid).toBe(false);
    expect(validateTransactionInput({ ...validPayload, date: "2026-02-30" }).valid).toBe(false);
    expect(validateTransactionInput({ ...validPayload, date: "14/11/2026" }).valid).toBe(false);
  });
});

describe("validateSubscriptionInput", () => {
  it("validates due_day boundaries and positive amounts", () => {
    expect(
      validateSubscriptionInput({
        name: "Spotify",
        amount: 21.9,
        due_day: 15,
        payment_method: "credit",
      })
    ).toEqual({ valid: true });

    expect(
      validateSubscriptionInput({
        name: "Spotify",
        amount: 21.9,
        due_day: 0,
        payment_method: "credit",
      }).valid
    ).toBe(false);

    expect(
      validateSubscriptionInput({
        name: "Spotify",
        amount: 21.9,
        due_day: 32,
        payment_method: "credit",
      }).valid
    ).toBe(false);
  });
});

describe("validateGroupName and validateMonthlyBudget", () => {
  it("enforces non-empty group names up to 100 characters", () => {
    expect(validateGroupName("Viagem França")).toEqual({ valid: true });
    expect(validateGroupName("   ").valid).toBe(false);
    expect(validateGroupName("a".repeat(101)).valid).toBe(false);
  });

  it("accepts non-negative monthly budget and rejects negative/NaN", () => {
    expect(validateMonthlyBudget(0)).toEqual({ valid: true });
    expect(validateMonthlyBudget(3500)).toEqual({ valid: true });
    expect(validateMonthlyBudget(-1).valid).toBe(false);
    expect(validateMonthlyBudget(NaN).valid).toBe(false);
  });
});
