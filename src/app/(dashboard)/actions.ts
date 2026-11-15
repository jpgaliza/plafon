"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  Group,
  PaymentMethod,
  TransactionType,
} from "@/lib/types";
import {
  validateGroupName,
  validateSubscriptionInput,
  validateTransactionInput,
} from "@/lib/validators";

export interface NewTransactionInput {
  amount: number;
  description: string;
  type: TransactionType;
  category_id?: string | null;
  category_icon: string;
  category_name: string;
  payment_method: PaymentMethod;
  date: string;
  group_ids?: string[];
}

export interface UpdateTransactionInput extends NewTransactionInput {
  id: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface NewSubscriptionInput {
  name: string;
  amount: number;
  due_day: number;
  payment_method: PaymentMethod;
  category_id?: string | null;
  category_name?: string;
  category_icon?: string;
  category_color?: string;
}

export interface SubscriptionWithCategory {
  id: string;
  name: string;
  amount: number;
  due_day: number;
  payment_method: PaymentMethod;
  category_id: string | null;
  category_name: string;
  category_name_en: string;
  category_icon: string;
  category_color: string;
  is_active: boolean;
}

function revalidateFinancePaths(groupIds?: string[]) {
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  revalidatePath("/categories");
  revalidatePath("/subscriptions");
  revalidatePath("/groups");
  revalidatePath("/groups/[id]", "page");
  if (groupIds) {
    for (const gid of groupIds) {
      revalidatePath(`/groups/${gid}`);
    }
  }
}

async function resolveCategoryId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  type: TransactionType,
  categoryId?: string | null,
  categoryName?: string,
  categoryIcon?: string
): Promise<string | null> {
  if (categoryId) {
    const { data } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .eq("user_id", userId)
      .maybeSingle();
    if (data?.id) return data.id;
  }

  const { data: userCategories } = await supabase
    .from("categories")
    .select("id, name, name_en, icon, type")
    .eq("user_id", userId)
    .eq("type", type);

  if (!userCategories || userCategories.length === 0) return null;

  const targetName = (categoryName || "").trim().toLowerCase();
  if (targetName) {
    const byName = userCategories.find(
      (c) =>
        c.name.toLowerCase() === targetName ||
        c.name_en.toLowerCase() === targetName
    );
    if (byName) return byName.id;
  }

  if (categoryIcon) {
    const byIcon = userCategories.find((c) => c.icon === categoryIcon);
    if (byIcon) return byIcon.id;
  }

  return null;
}

export async function createTransactionAction(
  input: NewTransactionInput
): Promise<ActionResult & { transactionId?: string }> {
  const validation = validateTransactionInput(input);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const categoryId = await resolveCategoryId(
    supabase,
    user.id,
    input.type,
    input.category_id,
    input.category_name,
    input.category_icon
  );

  const { data: inserted, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      category_id: categoryId,
      description: input.description.trim(),
      amount: Math.round(input.amount * 100) / 100,
      type: input.type,
      payment_method: input.payment_method,
      date: input.date,
      status: "completed",
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return {
      success: false,
      error: error?.message || "Erro ao criar transação.",
    };
  }

  const uniqueGroupIds = Array.from(new Set(input.group_ids ?? [])).filter(Boolean);
  if (uniqueGroupIds.length > 0) {
    const { error: linkError } = await supabase
      .from("transaction_groups")
      .insert(
        uniqueGroupIds.map((groupId) => ({
          transaction_id: inserted.id,
          group_id: groupId,
        }))
      );

    if (linkError) {
      return {
        success: false,
        error: linkError.message || "Erro ao vincular grupos à transação.",
      };
    }
  }

  revalidateFinancePaths(uniqueGroupIds);
  return { success: true, transactionId: inserted.id };
}

export async function updateTransactionAction(
  input: UpdateTransactionInput
): Promise<ActionResult> {
  if (!input.id) {
    return { success: false, error: "Transação não informada." };
  }

  const validation = validateTransactionInput(input);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const categoryId = await resolveCategoryId(
    supabase,
    user.id,
    input.type,
    input.category_id,
    input.category_name,
    input.category_icon
  );

  const { error } = await supabase
    .from("transactions")
    .update({
      category_id: categoryId,
      description: input.description.trim(),
      amount: Math.round(input.amount * 100) / 100,
      type: input.type,
      payment_method: input.payment_method,
      date: input.date,
    })
    .eq("id", input.id)
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      error: error.message || "Erro ao atualizar transação.",
    };
  }

  const uniqueGroupIds =
    input.group_ids !== undefined
      ? Array.from(new Set(input.group_ids)).filter(Boolean)
      : undefined;

  if (uniqueGroupIds !== undefined) {
    const { error: deleteLinksError } = await supabase
      .from("transaction_groups")
      .delete()
      .eq("transaction_id", input.id);

    if (deleteLinksError) {
      return {
        success: false,
        error: deleteLinksError.message || "Erro ao atualizar grupos.",
      };
    }

    if (uniqueGroupIds.length > 0) {
      const { error: insertLinksError } = await supabase
        .from("transaction_groups")
        .insert(
          uniqueGroupIds.map((groupId) => ({
            transaction_id: input.id,
            group_id: groupId,
          }))
        );

      if (insertLinksError) {
        return {
          success: false,
          error: insertLinksError.message || "Erro ao vincular grupos.",
        };
      }
    }
  }

  revalidateFinancePaths(uniqueGroupIds);
  return { success: true };
}

export async function deleteTransactionAction(
  id: string
): Promise<ActionResult> {
  if (!id) {
    return { success: false, error: "Transação não informada." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      error: error.message || "Erro ao excluir transação.",
    };
  }

  revalidateFinancePaths();
  return { success: true };
}

export async function createSubscriptionAction(
  input: NewSubscriptionInput
): Promise<ActionResult & { subscription?: SubscriptionWithCategory }> {
  const validation = validateSubscriptionInput(input);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const categoryId = await resolveCategoryId(
    supabase,
    user.id,
    "expense",
    input.category_id,
    input.category_name,
    input.category_icon
  );

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      category_id: categoryId,
      name: input.name.trim(),
      amount: Math.round(input.amount * 100) / 100,
      due_day: input.due_day,
      payment_method: input.payment_method,
      is_active: true,
    })
    .select(
      "id, name, amount, due_day, payment_method, category_id, is_active, category:categories(id, name, name_en, icon, color)"
    )
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "Erro ao cadastrar assinatura.",
    };
  }

  // Generate today's transaction immediately if due today
  await supabase.rpc("generate_subscription_transactions");

  const cat = data.category as Pick<
    Category,
    "id" | "name" | "name_en" | "icon" | "color"
  > | null;

  revalidateFinancePaths();
  return {
    success: true,
    subscription: {
      id: data.id,
      name: data.name,
      amount: Number(data.amount),
      due_day: data.due_day,
      payment_method: data.payment_method as PaymentMethod,
      category_id: data.category_id,
      category_name: cat?.name || input.category_name || "Serviços",
      category_name_en: cat?.name_en || input.category_name || "Services",
      category_icon: cat?.icon || input.category_icon || "Wrench",
      category_color: cat?.color || input.category_color || "#64748B",
      is_active: data.is_active,
    },
  };
}

export async function toggleSubscriptionAction(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  if (!id) {
    return { success: false, error: "Assinatura não informada." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      error: error.message || "Erro ao atualizar assinatura.",
    };
  }

  if (isActive) {
    await supabase.rpc("generate_subscription_transactions");
  }

  revalidateFinancePaths();
  return { success: true };
}

export async function deleteSubscriptionAction(
  id: string
): Promise<ActionResult> {
  if (!id) {
    return { success: false, error: "Assinatura não informada." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      error: error.message || "Erro ao excluir assinatura.",
    };
  }

  revalidateFinancePaths();
  return { success: true };
}

export async function getUserGroupsAction(): Promise<Group[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("groups")
    .select("id, user_id, name, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function createGroupAction(
  name: string
): Promise<ActionResult & { group?: Group }> {
  const validation = validateGroupName(name);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const { data, error } = await supabase
    .from("groups")
    .insert({
      user_id: user.id,
      name: name.trim(),
    })
    .select("id, user_id, name, created_at")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "Erro ao criar grupo.",
    };
  }

  revalidateFinancePaths([data.id]);
  return { success: true, group: data };
}

export async function updateGroupAction(
  id: string,
  name: string
): Promise<ActionResult> {
  if (!id) {
    return { success: false, error: "Grupo não informado." };
  }

  const validation = validateGroupName(name);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const { error } = await supabase
    .from("groups")
    .update({ name: name.trim() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      error: error.message || "Erro ao renomear grupo.",
    };
  }

  revalidateFinancePaths([id]);
  return { success: true };
}

export async function deleteGroupAction(id: string): Promise<ActionResult> {
  if (!id) {
    return { success: false, error: "Grupo não informado." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const { error } = await supabase
    .from("groups")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      error: error.message || "Erro ao excluir grupo.",
    };
  }

  revalidateFinancePaths([id]);
  return { success: true };
}

export async function addTransactionsToGroupAction(
  groupId: string,
  transactionIds: string[]
): Promise<ActionResult> {
  if (!groupId) {
    return { success: false, error: "Grupo não informado." };
  }

  const uniqueIds = Array.from(new Set(transactionIds)).filter(Boolean);
  if (uniqueIds.length === 0) {
    return { success: false, error: "Selecione ao menos uma transação." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const { error } = await supabase.from("transaction_groups").upsert(
    uniqueIds.map((transactionId) => ({
      transaction_id: transactionId,
      group_id: groupId,
    })),
    { onConflict: "transaction_id,group_id", ignoreDuplicates: true }
  );

  if (error) {
    return {
      success: false,
      error: error.message || "Erro ao adicionar transações ao grupo.",
    };
  }

  revalidateFinancePaths([groupId]);
  return { success: true };
}

export async function removeTransactionFromGroupAction(
  groupId: string,
  transactionId: string
): Promise<ActionResult> {
  if (!groupId || !transactionId) {
    return { success: false, error: "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  const { error } = await supabase
    .from("transaction_groups")
    .delete()
    .eq("group_id", groupId)
    .eq("transaction_id", transactionId);

  if (error) {
    return {
      success: false,
      error: error.message || "Erro ao remover transação do grupo.",
    };
  }

  revalidateFinancePaths([groupId]);
  return { success: true };
}
