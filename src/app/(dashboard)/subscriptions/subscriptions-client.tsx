"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  CreditCard,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  Power,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { resolveCategoryName } from "@/lib/finance";
import { CategoryIcon } from "@/lib/icons";
import {
  deleteSubscriptionAction,
  toggleSubscriptionAction,
  type SubscriptionWithCategory,
} from "@/app/(dashboard)/actions";
import { FadeIn } from "@/components/ui/fade-in";
import { SubscriptionDrawer } from "@/components/subscription-drawer";

const SERVICE_ICON_NAME: Record<string, string> = {
  Netflix: "Tv",
  Spotify: "Music",
  "Spotify Family": "Music",
  "Academia Smart Fit": "Dumbbell",
  "Smart Fit Gym": "Dumbbell",
  Academia: "Dumbbell",
  Gym: "Dumbbell",
  "iCloud 200GB": "Cloud",
  "iCloud / Google": "Cloud",
  "Amazon Prime": "ShoppingBag",
};

type OptimisticAction =
  | { type: "toggle"; id: string; isActive: boolean }
  | { type: "delete"; id: string }
  | { type: "add"; sub: SubscriptionWithCategory };

function subscriptionsReducer(
  state: SubscriptionWithCategory[],
  action: OptimisticAction
): SubscriptionWithCategory[] {
  switch (action.type) {
    case "toggle":
      return state.map((s) =>
        s.id === action.id ? { ...s, is_active: action.isActive } : s
      );
    case "delete":
      return state.filter((s) => s.id !== action.id);
    case "add":
      return [action.sub, ...state];
  }
}

interface SubscriptionsClientProps {
  initialSubscriptions: SubscriptionWithCategory[];
  locale: string;
  currency: string;
  currentDay: number;
  daysInCurrentMonth: number;
}

export function SubscriptionsClient({
  initialSubscriptions,
  locale,
  currency,
  currentDay,
  daysInCurrentMonth,
}: SubscriptionsClientProps) {
  const t = useTranslations("Subscriptions");
  const isEn = locale.startsWith("en");

  const [subscriptions, applyOptimistic] = useOptimistic(
    initialSubscriptions,
    subscriptionsReducer
  );
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeSubs = subscriptions.filter((s) => s.is_active);
  const inactiveSubs = subscriptions.filter((s) => !s.is_active);

  const totalMonthly = activeSubs.reduce((acc, curr) => acc + curr.amount, 0);

  const filteredList = subscriptions.filter((s) => {
    if (filter === "active") return s.is_active;
    if (filter === "inactive") return !s.is_active;
    return true;
  });

  function getDueStatus(dueDay: number) {
    let daysRemaining = dueDay - currentDay;
    if (daysRemaining < 0) {
      daysRemaining = daysInCurrentMonth - currentDay + dueDay;
    }

    if (daysRemaining === 0) {
      return { label: t("dueToday"), urgency: "high" as const, daysRemaining };
    }
    if (daysRemaining <= 5) {
      return {
        label: t("dueInDays", { days: daysRemaining }),
        urgency: "warning" as const,
        daysRemaining,
      };
    }
    return {
      label: t("everyDay", { day: dueDay }),
      urgency: "normal" as const,
      daysRemaining,
    };
  }

  const nextDueSub =
    activeSubs.length > 0
      ? [...activeSubs].sort(
          (a, b) =>
            getDueStatus(a.due_day).daysRemaining -
            getDueStatus(b.due_day).daysRemaining
        )[0]
      : null;

  function handleToggle(sub: SubscriptionWithCategory) {
    const nextActive = !sub.is_active;
    startTransition(async () => {
      applyOptimistic({ type: "toggle", id: sub.id, isActive: nextActive });
      await toggleSubscriptionAction(sub.id, nextActive);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      applyOptimistic({ type: "delete", id });
      await deleteSubscriptionAction(id);
    });
  }

  return (
    <>
      <SubscriptionDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        currency={currency}
      />

      <div className="mx-auto w-full max-w-lg md:max-w-6xl px-4 md:px-8 py-6 md:py-8 space-y-6">
        {/* Top Header */}
        <FadeIn
          delay={0.1}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("subtitle")}
            </p>
          </div>

          <button
            type="button"
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
            className="rounded-2xl border border-border dark:border-white/10 bg-card p-5 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard className="h-16 w-16" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {t("monthlyTotal")}
            </p>
            <p
              data-testid="subscriptions-monthly-total"
              className="text-2xl md:text-3xl font-bold text-foreground tabular-nums tracking-tight mt-1"
            >
              {formatCurrency(totalMonthly, currency, locale)}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block size-2 rounded-full bg-accent-green" />
              <span>
                {t("activeSubsCount", { count: activeSubs.length })}
              </span>
            </div>
          </FadeIn>

          {/* Active Subscriptions */}
          <FadeIn
            delay={0.25}
            className="rounded-2xl border border-border dark:border-white/10 bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {t("status")}
              </p>
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
            className="rounded-2xl border border-border dark:border-white/10 bg-card p-5 shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {t("nextDue")}
              </p>
              <Calendar className="h-4 w-4 text-accent-blue" />
            </div>
            <div>
              {nextDueSub ? (
                <>
                  <p className="text-lg font-bold text-foreground truncate mt-1">
                    {nextDueSub.name}
                  </p>
                  <p className="text-xs font-medium text-accent-blue">
                    {t("everyDay", { day: nextDueSub.due_day })} •{" "}
                    {formatCurrency(nextDueSub.amount, currency, locale)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {t("noneActive")}
                </p>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Filters Tab & List Section */}
        <FadeIn delay={0.35} className="space-y-4">
          <div className="flex items-center justify-center sm:justify-between border-b border-border dark:border-white/10 pb-3">
            <div className="flex items-center justify-center gap-1 rounded-xl bg-muted/60 p-1 mx-auto sm:mx-0">
              {(
                [
                  {
                    key: "all",
                    label: t("all"),
                    count: subscriptions.length,
                  },
                  {
                    key: "active",
                    label: t("active"),
                    count: activeSubs.length,
                  },
                  {
                    key: "inactive",
                    label: t("inactive"),
                    count: inactiveSubs.length,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                    filter === tab.key
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{tab.label}</span>
                  <span className="rounded-full bg-muted dark:bg-white/5 px-1.5 py-0.2 text-[10px]">
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
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border dark:border-white/15 bg-card/40 py-16 px-4 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-base font-semibold text-foreground">
                {t("noSubscriptions")}
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
                {t("noSubscriptionsDesc")}
              </p>
              <button
                type="button"
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
                const iconName =
                  SERVICE_ICON_NAME[sub.name] ||
                  sub.category_icon ||
                  "CreditCard";
                const catLabel = resolveCategoryName(
                  sub.category_name,
                  isEn,
                  sub.category_name_en
                );

                return (
                  <div
                    key={sub.id}
                    data-testid={`subscription-card-${sub.id}`}
                    className={cn(
                      "group relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200",
                      sub.is_active
                        ? "border-border dark:border-white/10 bg-card hover:border-foreground/20 dark:hover:border-white/20 hover:bg-card/80"
                        : "border-border/60 dark:border-white/5 bg-card/40 opacity-60 hover:opacity-80"
                    )}
                  >
                    {/* Top Row: Icon + Title/Category + Monthly Amount */}
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Service / Category Icon */}
                        <div
                          className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl shadow-xs"
                          style={{
                            backgroundColor: `${sub.category_color}18`,
                            border: `1px solid ${sub.category_color}30`,
                          }}
                        >
                          <CategoryIcon
                            name={iconName}
                            className="h-5 w-5"
                            style={{ color: sub.category_color }}
                          />
                        </div>

                        {/* Title & Category */}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm sm:text-base text-foreground truncate">
                            {sub.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {catLabel}
                          </p>
                        </div>
                      </div>

                      {/* Monthly Amount */}
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-sm sm:text-base font-bold text-foreground tabular-nums tracking-tight whitespace-nowrap">
                          {formatCurrency(sub.amount, currency, locale)}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {t("perMonth")}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Due Status / Paused Badge + Action Controls */}
                    <div className="mt-3 pt-2.5 border-t border-border/60 dark:border-white/5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <span
                          className={cn(
                            "text-xs font-medium whitespace-nowrap",
                            dueStatus.urgency === "high" &&
                              "text-accent-red font-bold",
                            dueStatus.urgency === "warning" &&
                              "text-amber-500 dark:text-amber-400 font-semibold",
                            dueStatus.urgency === "normal" &&
                              "text-muted-foreground"
                          )}
                        >
                          {dueStatus.label}
                        </span>
                        {!sub.is_active && (
                          <span className="rounded-md bg-muted dark:bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                            {t("paused")}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Quick Toggle Active Button */}
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleToggle(sub)}
                          title={
                            sub.is_active
                              ? t("pauseSubscription")
                              : t("reactivateSubscription")
                          }
                          aria-label={
                            sub.is_active
                              ? t("pauseSubscription")
                              : t("reactivateSubscription")
                          }
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg border transition-all cursor-pointer",
                            sub.is_active
                              ? "border-accent-green/30 bg-accent-green/10 text-accent-green hover:bg-accent-green/20"
                              : "border-border dark:border-white/10 bg-muted dark:bg-white/5 text-muted-foreground hover:bg-muted/80 dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white"
                          )}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleDelete(sub.id)}
                          title={t("deleteSubscription")}
                          aria-label={t("deleteSubscription")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground/60 transition-all hover:border-accent-red/20 hover:bg-accent-red/10 hover:text-accent-red cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
