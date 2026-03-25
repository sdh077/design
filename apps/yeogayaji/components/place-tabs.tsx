"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlaceTab } from "@/types/place-tab";

export function PlaceTabs({
  tabs,
  selectedTabId,
}: {
  tabs: PlaceTab[];
  selectedTabId: string;
}) {
  const router = useRouter();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const selected = useMemo(
    () => tabs.find((t) => t.id === selectedTabId) ?? tabs[0],
    [tabs, selectedTabId]
  );

  const goToTab = (tabId: string) => {
    router.push(`/places?tab=${encodeURIComponent(tabId)}`);
  };

  const onAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    const res = await fetch("/api/place-tabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });

    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as
        | { message?: string }
        | null;
      alert(payload?.message ?? "탭 생성 실패");
      return;
    }

    const payload = (await res.json().catch(() => ({}))) as
      | { tab?: PlaceTab }
      | undefined;
    const tabId = payload?.tab?.id;
    setIsAdding(false);
    setNewName("");

    if (tabId) goToTab(tabId);
    else router.refresh();
  };

  const onRename = async (tabId: string) => {
    const trimmed = renameValue.trim();
    if (!trimmed) return;

    const res = await fetch(`/api/place-tabs/${tabId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });

    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as
        | { message?: string }
        | null;
      alert(payload?.message ?? "탭 이름 변경 실패");
      return;
    }

    setRenamingId(null);
    setRenameValue("");
    router.refresh();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => {
          const isSelected = t.id === selected?.id;
          return (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-800 dark:bg-zinc-950"
            >
              {renamingId === t.id ? (
                <>
                  <input
                    className="w-28 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => onRename(t.id)}
                    className="rounded-lg bg-zinc-900 px-2 py-1 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRenamingId(null);
                      setRenameValue("");
                    }}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    취소
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => goToTab(t.id)}
                    className={
                      isSelected
                        ? "rounded-lg bg-zinc-900 px-2 py-1 text-xs font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                        : "rounded-lg px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    }
                  >
                    {t.name}
                  </button>

                  {!t.is_default ? (
                    <button
                      type="button"
                      onClick={() => {
                        setRenamingId(t.id);
                        setRenameValue(t.name);
                      }}
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      이름변경
                    </button>
                  ) : null}
                </>
              )}
            </div>
          );
        })}

        <div className="flex items-center gap-2">
          {isAdding ? (
            <>
              <input
                className="w-40 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                placeholder="탭 이름 입력"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button
                type="button"
                onClick={onAdd}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                disabled={!newName.trim()}
              >
                생성
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewName("");
                }}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                취소
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              + 탭 추가
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

