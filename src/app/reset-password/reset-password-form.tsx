"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  updatePasswordAction,
  type AuthActionResult,
} from "@/app/auth/actions";
import { FadeIn } from "@/components/ui/fade-in";

export function ResetPasswordForm() {
  const t = useTranslations("Auth");
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(updatePasswordAction, null);

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full bg-accent-blue/15 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Link */}
        <FadeIn delay={0.05} className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("backToLogin")}</span>
          </Link>
        </FadeIn>

        {/* Card */}
        <FadeIn
          delay={0.1}
          className="rounded-2xl border border-border dark:border-white/10 bg-card/95 dark:bg-[#121215]/90 backdrop-blur-xl p-6 sm:p-8 shadow-xl dark:shadow-2xl dark:shadow-black/80 ring-1 ring-border/50 dark:ring-white/5"
        >
          {/* Brand header */}
          <div className="flex flex-col items-center text-center mb-6">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="relative flex h-9 w-9 items-center justify-center font-bold text-xl transition-transform group-hover:scale-105">
                <span className="absolute top-0 right-1 h-[3px] w-4 bg-accent-blue" />
                <span className="absolute left-1 bottom-1 h-6 w-[3px] bg-foreground" />
                <span className="absolute left-1 top-1 h-[3px] w-4 bg-foreground" />
                <span className="absolute right-1 top-1 h-4 w-[3px] bg-foreground" />
                <span className="absolute left-1 bottom-[10px] h-[3px] w-4 bg-foreground" />
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground dark:text-white">
                Plafon
              </span>
            </Link>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground dark:text-white">
              {t("resetPasswordTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t("resetPasswordSubtitle")}
            </p>
          </div>

          {/* Error notice */}
          {state?.error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-accent-red/30 bg-accent-red/10 p-3.5 text-xs text-accent-red animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{state.error}</p>
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-medium text-foreground/80 dark:text-zinc-300 mb-1.5">
                {t("newPasswordLabel")}
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  placeholder={t("newPasswordPlaceholder")}
                  className="w-full rounded-xl border border-border dark:border-white/10 bg-background pl-10 pr-11 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-medium text-foreground/80 dark:text-zinc-300 mb-1.5">
                {t("confirmNewPasswordLabel")}
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  minLength={6}
                  placeholder={t("confirmNewPasswordPlaceholder")}
                  className="w-full rounded-xl border border-border dark:border-white/10 bg-background pl-10 pr-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-accent-blue px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("resettingPassword")}</span>
                </>
              ) : (
                <span>{t("resetPasswordButton")}</span>
              )}
            </button>
          </form>
        </FadeIn>
      </div>
    </div>
  );
}
