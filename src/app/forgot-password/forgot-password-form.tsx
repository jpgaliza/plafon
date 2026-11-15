"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Mail,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  requestPasswordResetAction,
  type AuthActionResult,
} from "@/app/auth/actions";
import { FadeIn } from "@/components/ui/fade-in";

export function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(requestPasswordResetAction, null);

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
              {t("forgotPasswordTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t("forgotPasswordSubtitle")}
            </p>
          </div>

          {/* Reset link sent success banner */}
          {state?.success && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-accent-green/30 bg-accent-green/10 p-4 text-xs text-accent-green animate-in fade-in duration-200">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground dark:text-white mb-1">
                  {t("resetLinkSentTitle")}
                </p>
                <p className="leading-relaxed text-foreground/80 dark:text-zinc-300">
                  {t("resetLinkSentMessage")}
                </p>
                <Link
                  href="/login"
                  className="mt-3 inline-block font-semibold text-accent-green underline"
                >
                  {t("backToLogin")} →
                </Link>
              </div>
            </div>
          )}

          {/* Error notice */}
          {state?.error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-accent-red/30 bg-accent-red/10 p-3.5 text-xs text-accent-red animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{state.error}</p>
            </div>
          )}

          {/* Form - Only show if not yet successfully submitted */}
          {!state?.success && (
            <form action={formAction} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground/80 dark:text-zinc-300 mb-1.5">
                  {t("emailLabel")}
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={t("emailPlaceholder")}
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
                    <span>{t("sendingResetLink")}</span>
                  </>
                ) : (
                  <span>{t("forgotPasswordButton")}</span>
                )}
              </button>
            </form>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
