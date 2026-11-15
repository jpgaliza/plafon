import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] h-[300px] rounded-full bg-accent-blue/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-border dark:border-white/10 bg-card p-6 sm:p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-blue/10 text-accent-blue">
          <FileQuestion className="h-7 w-7" />
        </div>

        <span className="inline-flex items-center rounded-full border border-border dark:border-white/10 bg-muted px-3 py-1 text-xs font-semibold tabular-nums text-muted-foreground">
          {t("code")}
        </span>

        <h1 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {t("description")}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-accent-blue px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition-all hover:bg-accent-blue/90"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t("backToDashboard")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
