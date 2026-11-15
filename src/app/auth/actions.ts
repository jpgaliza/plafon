"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { syncCookiesFromProfile } from "@/lib/preferences";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

export async function signInAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Preencha todos os campos." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "O Supabase ainda não está configurado. Adicione suas credenciais no arquivo .env.local para continuar.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.user) {
    await syncCookiesFromProfile(supabase, data.user.id);
  }

  redirect("/dashboard");
}

export async function signUpAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password) {
    return { success: false, error: "Preencha todos os campos obrigatórios." };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: "A senha deve conter no mínimo 6 caracteres.",
    };
  }

  if (confirmPassword && password !== confirmPassword) {
    return { success: false, error: "As senhas não coincidem." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "O Supabase ainda não está configurado. Adicione suas credenciais no arquivo .env.local para continuar.",
    };
  }

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto =
    headersList.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
      emailRedirectTo: `${origin}/auth/callback?next=/login?verified=true`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // If email confirmation is disabled or session is created immediately:
  if (data?.session) {
    if (data.user) {
      await syncCookiesFromProfile(supabase, data.user.id);
    }
    redirect("/dashboard");
  }

  // If email confirmation is enabled:
  return {
    success: true,
    needsEmailConfirmation: true,
  };
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}

export async function requestPasswordResetAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    return { success: false, error: "Informe o seu e-mail." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "O Supabase ainda não está configurado. Adicione suas credenciais no arquivo .env.local para continuar.",
    };
  }

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const proto =
    headersList.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updatePasswordAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { success: false, error: "Preencha todos os campos." };
  }

  if (password.length < 6) {
    return {
      success: false,
      error: "A senha deve conter no mínimo 6 caracteres.",
    };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "As senhas não coincidem." };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error:
        "O Supabase ainda não está configurado. Adicione suas credenciais no arquivo .env.local para continuar.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.auth.signOut();
  redirect("/login?passwordReset=true");
}

