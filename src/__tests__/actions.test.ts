import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: vi.fn(),
    get: vi.fn(),
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  isSupabaseConfigured: () => true,
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: null } })),
    },
  })),
}));

import {
  addTransactionsToGroupAction,
  createGroupAction,
  createSubscriptionAction,
  createTransactionAction,
  deleteGroupAction,
  deleteSubscriptionAction,
  deleteTransactionAction,
  removeTransactionFromGroupAction,
  toggleSubscriptionAction,
  updateGroupAction,
  updateTransactionAction,
} from "@/app/(dashboard)/actions";
import { setMonthlyBudgetAction } from "@/app/(dashboard)/settings/actions";

describe("Server Action validations", () => {
  it("validates createTransactionAction inputs before querying Supabase", async () => {
    const invalidAmount = await createTransactionAction({
      amount: 0,
      description: "Mercado",
      type: "expense",
      category_icon: "Utensils",
      category_name: "Alimentação",
      payment_method: "pix",
      date: "2026-11-14",
    });
    expect(invalidAmount).toEqual({
      success: false,
      error: "O valor deve ser maior que zero.",
    });

    const invalidDate = await createTransactionAction({
      amount: 50,
      description: "Mercado",
      type: "expense",
      category_icon: "Utensils",
      category_name: "Alimentação",
      payment_method: "pix",
      date: "2026-02-30",
    });
    expect(invalidDate).toEqual({
      success: false,
      error: "Data inválida.",
    });
  });

  it("validates updateTransactionAction and deleteTransactionAction required ids and payloads", async () => {
    const missingId = await updateTransactionAction({
      id: "",
      amount: 50,
      description: "Teste",
      type: "expense",
      category_icon: "Utensils",
      category_name: "Alimentação",
      payment_method: "pix",
      date: "2026-11-14",
    });
    expect(missingId).toEqual({
      success: false,
      error: "Transação não informada.",
    });

    const delEmpty = await deleteTransactionAction("");
    expect(delEmpty).toEqual({
      success: false,
      error: "Transação não informada.",
    });
  });

  it("validates subscription actions", async () => {
    const badDay = await createSubscriptionAction({
      name: "Streaming",
      amount: 29.9,
      due_day: 35,
      payment_method: "credit",
    });
    expect(badDay.success).toBe(false);

    expect(await toggleSubscriptionAction("", true)).toEqual({
      success: false,
      error: "Assinatura não informada.",
    });

    expect(await deleteSubscriptionAction("")).toEqual({
      success: false,
      error: "Assinatura não informada.",
    });
  });

  it("validates group actions and membership inputs", async () => {
    const emptyName = await createGroupAction("   ");
    expect(emptyName).toEqual({
      success: false,
      error: "O nome do grupo é obrigatório.",
    });

    const missingGroupId = await updateGroupAction("", "Viagem");
    expect(missingGroupId).toEqual({
      success: false,
      error: "Grupo não informado.",
    });

    expect(await deleteGroupAction("")).toEqual({
      success: false,
      error: "Grupo não informado.",
    });

    expect(await addTransactionsToGroupAction("g1", [])).toEqual({
      success: false,
      error: "Selecione ao menos uma transação.",
    });

    expect(await removeTransactionFromGroupAction("", "tx1")).toEqual({
      success: false,
      error: "Dados inválidos.",
    });
  });

  it("validates setMonthlyBudgetAction bounds and auth", async () => {
    const negative = await setMonthlyBudgetAction(-100);
    expect(negative).toEqual({
      success: false,
      error: "O teto mensal deve ser um valor maior ou igual a zero.",
    });

    const unauthenticated = await setMonthlyBudgetAction(2500);
    expect(unauthenticated).toEqual({
      success: false,
      error: "Usuário não autenticado.",
    });
  });
});
