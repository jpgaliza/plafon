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
  { href: "/subscriptions", icon: CreditCard, labelKey: "subscriptions" as const },
  { href: "/settings", icon: Settings, labelKey: "settings" as const },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("BottomNav");
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <TransactionDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />

      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-background/80 backdrop-blur-xl h-screen sticky top-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="relative flex h-8 w-8 items-center justify-center font-bold text-xl">
              <span className="absolute top-0 right-1 h-[3px] w-4 bg-accent-blue" />
              <span className="absolute left-1 bottom-1 h-6 w-[3px] bg-foreground" />
              <span className="absolute left-1 top-1 h-[3px] w-4 bg-foreground" />
              <span className="absolute right-1 top-1 h-4 w-[3px] bg-foreground" />
              <span className="absolute left-1 bottom-[10px] h-[3px] w-4 bg-foreground" />
            </div>
            <span className="font-semibold text-lg tracking-tight">Plafon</span>
          </div>
          
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent-blue px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent-blue/25 mb-8"
          >
            <Plus className="h-5 w-5" />
            Nova Transação
          </button>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.labelKey}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent-blue/10 text-accent-blue"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
