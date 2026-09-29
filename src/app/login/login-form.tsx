"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { signInAction, type AuthActionResult } from "@/app/auth/actions";
import { FadeIn } from "@/components/ui/fade-in";

export function LoginForm() {
  const t = useTranslations("Auth");
  const searchParams = useSearchParams();
  const isVerified = searchParams.get("verified") === "true";
  const isPasswordReset = searchParams.get("passwordReset") === "true";
  const urlError = searchParams.get("error");
  const isExpired = urlError === "expired" || urlError === "otp_expired";

  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState<
    AuthActionResult | null,
    FormData
  >(signInAction, null);

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
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("backToHome")}</span>
          </Link>
        </FadeIn>

        {/* Card */}
        <FadeIn
          delay={0.1}
          className="rounded-2xl border border-white/10 bg-[#121215]/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/80 ring-1 ring-white/5"
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
              <span className="font-bold text-xl tracking-tight text-white">
                Plafon
              </span>
            </Link>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {t("loginTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t("loginSubtitle")}
            </p>
          </div>

          {/* Verified success banner */}
          {isVerified && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-accent-green/30 bg-accent-green/10 p-4 text-xs text-accent-green animate-in fade-in duration-200">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white mb-0.5">
                  {t("verifiedTitle")}
                </p>
                <p className="leading-relaxed text-zinc-300">
                  {t("verifiedMessage")}
                </p>
              </div>
            </div>
          )}

          {/* Password reset success banner */}
          {isPasswordReset && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-accent-green/30 bg-accent-green/10 p-4 text-xs text-accent-green animate-in fade-in duration-200">
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white mb-0.5">
                  {t("passwordResetSuccessTitle")}
                </p>
                <p className="leading-relaxed text-zinc-300">
                  {t("passwordResetSuccessMessage")}
                </p>
              </div>
            </div>
          )}

          {/* Expired verification link error */}
          {isExpired && !state?.error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-400 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{t("expiredError")}</p>
            </div>
          )}

          {/* Error notice */}
          {state?.error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-accent-red/30 bg-accent-red/10 p-3.5 text-xs text-accent-red animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{state.error}</p>
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="space-y-4">
            {/* Email input */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                {t("emailLabel")}
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder={t("emailPlaceholder")}
                  className="w-full rounded-xl border border-white/10 bg-background pl-10 pr-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  {t("passwordLabel")}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-accent-blue transition-colors cursor-pointer"
                >
                  {t("forgotPasswordLink")}
                </Link>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder={t("passwordPlaceholder")}
                  className="w-full rounded-xl border border-white/10 bg-background pl-10 pr-11 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30"
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

            {/* Submit button */}
            <button
              type="submit"
              disabled={isPending}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-accent-blue px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("loggingIn")}</span>
                </>
              ) : (
                <span>{t("loginButton")}</span>
              )}
            </button>
          </form>

          {/* Footer link to register */}
          <div className="mt-6 pt-5 border-t border-white/5 text-center text-xs text-muted-foreground">
            <span>{t("noAccount")} </span>
            <Link
              href="/register"
              className="font-medium text-accent-blue hover:underline cursor-pointer ml-1"
            >
              {t("createAccountLink")}
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
