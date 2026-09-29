"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Receipt,
  Plus,
  CreditCard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TransactionDrawer } from "@/components/transaction-drawer";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "dashboard" as const },
  { href: "/transactions", icon: Receipt, labelKey: "transactions" as const },
  { href: "#add", icon: Plus, labelKey: "add" as const, isCenter: true },
  { href: "/subscriptions", icon: CreditCard, labelKey: "subscriptions" as const },
  { href: "/settings", icon: Settings, labelKey: "settings" as const },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("BottomNav");
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <TransactionDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center px-1">
          {navItems.map((item) => {
            const isActive =
              !item.isCenter && pathname.startsWith(item.href);
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <div
                  key={item.labelKey}
                  className="flex items-center justify-center w-full"
                >
                  <button
                    id="btn-new-transaction"
                    onClick={() => setDrawerOpen(true)}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-blue text-white shadow-lg shadow-accent-blue/25 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label={t(item.labelKey)}
                  >
                    <Icon className="h-6 w-6" />
                  </button>
                </div>
              );
            }

            return (
              <Link
                key={item.labelKey}
                href={item.href}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-1 py-1 text-[10px] sm:text-[11px] transition-colors",
                  isActive
                    ? "text-accent-blue font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate max-w-[62px] text-center leading-tight">
                  {t(item.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
