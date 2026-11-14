"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileHeader() {
  const pathname = usePathname();
  const t = useTranslations("BottomNav");
  const isSettingsActive = pathname.startsWith("/settings");

  return (
    <header className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="relative flex h-7 w-7 items-center justify-center font-bold text-lg">
          <span className="absolute top-0 right-1 h-[2.5px] w-3.5 bg-accent-blue" />
          <span className="absolute left-1 bottom-1 h-5 w-[2.5px] bg-foreground" />
          <span className="absolute left-1 top-1 h-[2.5px] w-3.5 bg-foreground" />
          <span className="absolute right-1 top-1 h-3.5 w-[2.5px] bg-foreground" />
          <span className="absolute left-1 bottom-[9px] h-[2.5px] w-3.5 bg-foreground" />
        </div>
        <span className="font-semibold text-base tracking-tight">Plafon</span>
      </Link>

      <Link
        href="/settings"
        aria-label={t("settings")}
        title={t("settings")}
        data-testid="mobile-settings-link"
        className={cn(
          "inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl transition-colors",
          isSettingsActive
            ? "bg-accent-blue/10 text-accent-blue"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <Settings className="h-5 w-5" />
      </Link>
    </header>
  );
}
