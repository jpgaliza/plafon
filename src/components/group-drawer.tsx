"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Drawer } from "vaul";
import { FolderKanban, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Group } from "@/lib/types";
import { createGroupAction, updateGroupAction } from "@/app/(dashboard)/actions";

interface GroupDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: Pick<Group, "id" | "name"> | null;
  onSaved?: (group: Pick<Group, "id" | "name">) => void;
}

export function GroupDrawer({
  open,
  onOpenChange,
  group,
  onSaved,
}: GroupDrawerProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 md:left-64 md:bottom-4 z-50 mx-auto flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden no-scrollbar rounded-t-2xl md:rounded-2xl border-t md:border border-border dark:border-white/10 bg-card md:shadow-2xl outline-none">
          <Drawer.Handle className="mx-auto mb-2 mt-3 h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          {open ? (
            <GroupDrawerForm
              key={group?.id ?? "new-group"}
              group={group}
              onClose={() => onOpenChange(false)}
              onSaved={onSaved}
            />
          ) : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function GroupDrawerForm({
  group,
  onClose,
  onSaved,
}: {
  group?: Pick<Group, "id" | "name"> | null;
  onClose: () => void;
  onSaved?: (group: Pick<Group, "id" | "name">) => void;
}) {
  const t = useTranslations("Groups");
  const isEditing = Boolean(group);
  const [name, setName] = useState(() => group?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const trimmedName = name.trim();
  const isFormValid = trimmedName.length >= 1 && trimmedName.length <= 80;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid || isPending) return;
    setError(null);

    startTransition(async () => {
      if (isEditing && group) {
        const result = await updateGroupAction(group.id, trimmedName);
        if (result.success) {
          onSaved?.({ id: group.id, name: trimmedName });
          onClose();
        } else if (result.error) {
          setError(result.error);
        }
      } else {
        const result = await createGroupAction(trimmedName);
        if (result.success && result.group) {
          onSaved?.({ id: result.group.id, name: result.group.name });
          onClose();
        } else if (result.error) {
          setError(result.error);
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex items-center justify-between border-b border-border/60 dark:border-white/5 px-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue/10 text-accent-blue">
            <FolderKanban className="h-4 w-4" />
          </div>
          <Drawer.Title className="text-lg font-semibold text-foreground">
            {isEditing ? t("renameGroup") : t("newGroup")}
          </Drawer.Title>
        </div>

        <Drawer.Close asChild>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </Drawer.Close>
      </div>

      <div className="px-5 py-5 space-y-4">
        {error && (
          <div className="rounded-xl border border-accent-red/30 bg-accent-red/10 px-3.5 py-2.5 text-xs text-accent-red">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="group-name-input"
            className="text-xs font-medium text-muted-foreground"
          >
            {t("groupName")}
          </label>
          <input
            id="group-name-input"
            type="text"
            maxLength={80}
            placeholder={t("groupNamePlaceholder")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/30"
          />
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isPending}
          data-testid="group-drawer-submit"
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all cursor-pointer",
            isFormValid && !isPending
              ? "bg-accent-blue text-white shadow-lg shadow-accent-blue/25 hover:bg-accent-blue/90 active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>{isEditing ? t("saveSubmit") : t("createSubmit")}</span>
        </button>
      </div>
    </form>
  );
}
