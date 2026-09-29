"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  CreditCard,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  Power,
  Tv,
  Music,
  Dumbbell,
  Cloud,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { FadeIn } from "@/components/ui/fade-in";
import {
  SubscriptionDrawer,
  type SubscriptionItem,
} from "@/components/subscription-drawer";

// Initial realistic subscriptions matching Plafon landing page showcase
const INITIAL_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: "sub-1",
    name: "Netflix",
    amount: 55.9,
    due_day: 10,
    payment_method: "credit",
    category_name: "Lazer",
    category_icon: "Tv",
    category_color: "#E50914",
    is_active: true,
  },
  {
    id: "sub-2",
    name: "Spotify Family",
    amount: 34.9,
    due_day: 15,
    payment_method: "credit",
    category_name: "Lazer",
    category_icon: "Music",
    category_color: "#1DB954",
    is_active: true,
  },
  {
    id: "sub-3",
    name: "Academia Smart Fit",
    amount: 99.9,
    due_day: 1,
    payment_method: "debit",
    category_name: "Saúde",
    category_icon: "Dumbbell",
    category_color: "#EAB308",
    is_active: true,
  },
  {
    id: "sub-4",
    name: "iCloud 200GB",
    amount: 14.9,
    due_day: 20,
    payment_method: "credit",
    category_name: "Serviços",
    category_icon: "Cloud",
    category_color: "#3B82F6",
    is_active: true,
  },
];

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Netflix: Tv,
  Spotify: Music,
  "Spotify Family": Music,
  "Academia Smart Fit": Dumbbell,
  "Smart Fit Gym": Dumbbell,
  "iCloud 200GB": Cloud,
  "Amazon Prime": ShoppingBag,
};

export function SubscriptionsClient() {
  const t = useTranslations("Subscriptions");
  const locale = useLocale();
  const isEn = locale.startsWith("en");

  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(INITIAL_SUBSCRIPTIONS);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Derived metrics
  const activeSubs = subscriptions.filter((s) => s.is_active);
  const inactiveSubs = subscriptions.filter((s) => !s.is_active);

  const totalMonthly = activeSubs.reduce((acc, curr) => acc + curr.amount, 0);

  // Filtered list
  const filteredList = subscriptions.filter((s) => {
    if (filter === "active") return s.is_active;
    if (filter === "inactive") return !s.is_active;
    return true;
  });

  // Calculate days remaining until due date
  const today = new Date();
  const currentDay = today.getDate();

  function getDueStatus(dueDay: number) {
    let daysRemaining = dueDay - currentDay;
    if (daysRemaining < 0) {
      // Due next month
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      daysRemaining = daysInMonth - currentDay + dueDay;
    }

    if (daysRemaining === 0) {
      return { label: t("dueToday"), urgency: "high" };
    }
    if (daysRemaining <= 5) {
      return {
        label: t("dueInDays", { days: daysRemaining }),
        urgency: "warning",
      };
    }
    return {
      label: t("everyDay", { day: dueDay }),
      urgency: "normal",
    };
  }

  function getCategoryLabel(categoryName: string) {
    if (!isEn) return categoryName;
    const match = DEFAULT_CATEGORIES.find(
      (c) =>
        c.name.toLowerCase() === categoryName.toLowerCase() ||
        c.nameEn.toLowerCase() === categoryName.toLowerCase()
    );
    return match ? match.nameEn : categoryName;
  }

  function handleToggle(id: string) {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s))
    );
  }

  function handleDelete(id: string) {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }

  function handleCreated(newSub: SubscriptionItem) {
    setSubscriptions((prev) => [newSub, ...prev]);
  }

  return (
    <>
      <SubscriptionDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onCreated={handleCreated}
      />

      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-8 space-y-6">
        {/* Top Header */}
        <FadeIn delay={0.1} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("subtitle")}
            </p>
          </div>

          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>{t("newSubscription")}</span>
          </button>
        </FadeIn>

        {/* Highlight Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Monthly */}
          <FadeIn
            delay={0.2}
            className="rounded-2xl border border-white/10 bg-card p-5 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard className="h-16 w-16" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {t("monthlyTotal")}
            </p>
            <p className="text-2xl md:text-3xl font-bold text-foreground tabular-nums tracking-tight mt-1">
              {formatCurrency(totalMonthly, isEn ? "USD" : "BRL", locale)}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block size-2 rounded-full bg-accent-green" />
              <span>{t("activeSubsCount", { count: activeSubs.length })}</span>
            </div>
          </FadeIn>

          {/* Active Subscriptions */}
          <FadeIn
            delay={0.25}
            className="rounded-2xl border border-white/10 bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{t("status")}</p>
              <CheckCircle2 className="h-4 w-4 text-accent-green" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-foreground tabular-nums tracking-tight mt-1">
              {activeSubs.length}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {subscriptions.length}
              </span>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("pausedSubsCount", { count: inactiveSubs.length })}
            </p>
          </FadeIn>

          {/* Next Due Insight */}
          <FadeIn
            delay={0.3}
            className="rounded-2xl border border-white/10 bg-card p-5 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{t("nextDue")}</p>
              <Calendar className="h-4 w-4 text-accent-blue" />
            </div>
            <div>
              {activeSubs.length > 0 ? (
                <>
                  <p className="text-lg font-bold text-foreground truncate mt-1">
                    {activeSubs[0].name}
                  </p>
                  <p className="text-xs font-medium text-accent-blue">
                    {t("everyDay", { day: activeSubs[0].due_day })} • {formatCurrency(activeSubs[0].amount, isEn ? "USD" : "BRL", locale)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{t("noneActive")}</p>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Filters Tab & List Section */}
        <FadeIn delay={0.35} className="space-y-4">
          <div className="flex items-center justify-center sm:justify-between border-b border-white/10 pb-3">
            <div className="flex items-center justify-center gap-1 rounded-xl bg-muted/60 p-1 mx-auto sm:mx-0">
              {(
                [
                  { key: "all", label: t("all"), count: subscriptions.length },
                  { key: "active", label: t("active"), count: activeSubs.length },
                  { key: "inactive", label: t("inactive"), count: inactiveSubs.length },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                    filter === tab.key
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{tab.label}</span>
                  <span className="rounded-full bg-white/5 px-1.5 py-0.2 text-[10px]">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <span className="text-xs text-muted-foreground hidden sm:inline-block">
              {t("resultsCount", { count: filteredList.length })}
            </span>
          </div>

          {/* Subscriptions Cards List */}
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-card/40 py-16 px-4 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-base font-semibold text-foreground">
                {t("noSubscriptions")}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
                {t("noSubscriptionsDesc")}
              </p>
              <button
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-accent-blue px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-accent-blue/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{t("addFirstSubscription")}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredList.map((sub) => {
                const dueStatus = getDueStatus(sub.due_day);
                const IconComponent = SERVICE_ICONS[sub.name] || CreditCard;
                const displayName = isEn && sub.name === "Academia Smart Fit" ? "Smart Fit Gym" : sub.name;

                return (
                  <div
                    key={sub.id}
                    className={cn(
                      "group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                      sub.is_active
                        ? "border-white/10 bg-card hover:border-white/20 hover:bg-card/80"
                        : "border-white/5 bg-card/40 opacity-60 hover:opacity-80"
                    )}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Service / Category Icon */}
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs"
                        style={{
                          backgroundColor: `${sub.category_color}18`,
                          border: `1px solid ${sub.category_color}30`,
                        }}
                      >
                        <IconComponent
                          className="h-5 w-5"
                          style={{ color: sub.category_color }}
                        />
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm md:text-base text-foreground truncate">
                            {displayName}
                          </p>
                          {!sub.is_active && (
                            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {t("paused")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                          <span>{getCategoryLabel(sub.category_name)}</span>
                          <span>•</span>
                          <span
                            className={cn(
                              "font-medium",
                              dueStatus.urgency === "high" && "text-accent-red font-bold",
                              dueStatus.urgency === "warning" && "text-amber-400 font-semibold"
                            )}
                          >
                            {dueStatus.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side: Amount & Controls */}
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <div className="text-right">
                        <p className="text-base font-bold text-foreground tabular-nums tracking-tight">
                          {formatCurrency(sub.amount, isEn ? "USD" : "BRL", locale)}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {t("perMonth")}
                        </p>
                      </div>

                      {/* Quick Toggle Active Button */}
                      <button
                        type="button"
                        onClick={() => handleToggle(sub.id)}
                        title={sub.is_active ? t("pauseSubscription") : t("reactivateSubscription")}
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg border transition-all cursor-pointer",
                          sub.is_active
                            ? "border-accent-green/30 bg-accent-green/10 text-accent-green hover:bg-accent-green/20"
                            : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(sub.id)}
                        title={t("deleteSubscription")}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground/60 transition-all hover:border-accent-red/20 hover:bg-accent-red/10 hover:text-accent-red cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </FadeIn>
      </div>
    </>
  );
}
