"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Check,
  ChevronRight,
  FolderKanban,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import type { Group, GroupWithStats } from "@/lib/types";
import { deleteGroupAction } from "@/app/(dashboard)/actions";
import { FadeIn } from "@/components/ui/fade-in";
import { GroupDrawer } from "@/components/group-drawer";

interface GroupsClientProps {
  initialGroups: GroupWithStats[];
  locale: string;
  currency: string;
}

type OptimisticGroupAction = { type: "delete"; id: string };

function groupsReducer(
  state: GroupWithStats[],
  action: OptimisticGroupAction
): GroupWithStats[] {
  if (action.type === "delete") {
    return state.filter((g) => g.id !== action.id);
  }
  return state;
}

export function GroupsClient({
  initialGroups,
  locale,
  currency,
}: GroupsClientProps) {
  const t = useTranslations("Groups");
  const tCommon = useTranslations("Common");

  const [groups, applyOptimistic] = useOptimistic(initialGroups, groupsReducer);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Pick<
    Group,
    "id" | "name"
  > | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpenCreate() {
    setEditingGroup(null);
    setDrawerOpen(true);
  }

  function handleOpenRename(group: GroupWithStats) {
    setConfirmDeleteId(null);
    setEditingGroup({ id: group.id, name: group.name });
    setDrawerOpen(true);
  }

  function handleDelete(id: string) {
    setConfirmDeleteId(null);
    startTransition(async () => {
      applyOptimistic({ type: "delete", id });
      await deleteGroupAction(id);
    });
  }

  return (
    <>
      <GroupDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setEditingGroup(null);
        }}
        group={editingGroup}
      />

      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-8 space-y-6">
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
            onClick={handleOpenCreate}
            data-testid="new-group-button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>{t("newGroup")}</span>
          </button>
        </FadeIn>

        {groups.length === 0 ? (
          <FadeIn delay={0.2}>
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-card/50 px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-blue/10 text-accent-blue mb-4">
                <FolderKanban className="h-7 w-7" />
              </div>
              <h2 className="text-base font-semibold text-foreground">
                {t("noGroups")}
              </h2>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                {t("noGroupsDesc")}
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition-all hover:bg-accent-blue/90 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>{t("createFirstGroup")}</span>
              </button>
            </div>
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.map((group, index) => {
              const isConfirming = confirmDeleteId === group.id;
              return (
                <FadeIn
                  key={group.id}
                  delay={0.15 + index * 0.04}
                  className="rounded-2xl border border-white/10 bg-card p-5 shadow-sm transition-colors hover:border-white/20 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/groups/${group.id}`}
                      data-testid={`group-card-link-${group.id}`}
                      className="flex items-center gap-3 min-w-0 flex-1 group"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base font-semibold text-foreground truncate group-hover:text-accent-blue transition-colors">
                          {group.name}
                        </h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t("transactionCount", {
                            count: group.transaction_count,
                          })}
                        </p>
                      </div>
                    </Link>

                    <div className="flex items-center gap-1 shrink-0">
                      {!isConfirming ? (
                        <>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleOpenRename(group)}
                            title={t("renameGroup")}
                            aria-label={t("renameGroup")}
                            data-testid={`rename-group-${group.id}`}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-transparent text-muted-foreground/70 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-foreground cursor-pointer disabled:opacity-40"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setConfirmDeleteId(group.id)}
                            title={t("deleteGroup")}
                            aria-label={t("deleteGroup")}
                            data-testid={`delete-group-${group.id}`}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-transparent text-muted-foreground/70 transition-colors hover:border-accent-red/20 hover:bg-accent-red/10 hover:text-accent-red cursor-pointer disabled:opacity-40"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleDelete(group.id)}
                            title={tCommon("confirm")}
                            aria-label={tCommon("confirm")}
                            data-testid={`confirm-delete-group-${group.id}`}
                            className="flex h-11 items-center gap-1 rounded-xl border border-accent-red/30 bg-accent-red/15 px-3 text-xs font-medium text-accent-red hover:bg-accent-red/25 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            <Check className="h-4 w-4" />
                            <span>{t("confirmDelete")}</span>
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setConfirmDeleteId(null)}
                            title={tCommon("cancel")}
                            aria-label={tCommon("cancel")}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isConfirming && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {t("deleteGroupNote")}
                    </p>
                  )}

                  <Link
                    href={`/groups/${group.id}`}
                    className="mt-4 flex items-center justify-between border-t border-white/5 pt-3.5 group"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("totalSpent")}
                      </p>
                      <p className="text-lg font-bold tabular-nums text-foreground mt-0.5">
                        {formatCurrency(group.total_spent, currency, locale)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
