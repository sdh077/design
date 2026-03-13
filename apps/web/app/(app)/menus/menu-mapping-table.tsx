"use client";

import { useMemo, useState } from "react";
import { Button } from "@workspace/ui";

export type MenuMappingRow = {
  id: string;
  storeId: string;
  title: string;
  code: string | null;
  provider: string;
  mappedMenu: {
    id: string;
    menuId: string;
    menuName: string;
  } | null;
};

export type MenuOption = {
  id: string;
  name: string;
  store_id: string;
};

export function MenuMappingTable({
  rows,
  menuOptions,
}: {
  rows: MenuMappingRow[];
  menuOptions: MenuOption[];
}) {
  const [savingId, setSavingId] = useState<string | null>(null);

  const optionsByStore = useMemo(() => {
    const map = new Map<string, MenuOption[]>();

    for (const menu of menuOptions) {
      const current = map.get(menu.store_id) ?? [];
      current.push(menu);
      map.set(menu.store_id, current);
    }

    return map;
  }, [menuOptions]);

  const onMap = async (externalCatalogItemId: string, menuId: string) => {
    try {
      setSavingId(externalCatalogItemId);

      const res = await fetch("/api/menu-external-item-maps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          externalCatalogItemId,
          menuId,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "매핑 실패");
      }

      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "매핑 실패");
    } finally {
      setSavingId(null);
    }
  };

  const onUnmap = async (externalCatalogItemId: string) => {
    try {
      setSavingId(externalCatalogItemId);

      const res = await fetch(`/api/menu-external-item-maps/${externalCatalogItemId}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "매핑 해제 실패");
      }

      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "매핑 해제 실패");
    } finally {
      setSavingId(null);
    }
  };

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
        외부 상품이 없다. 먼저 POS 카탈로그 sync를 실행해라.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      <div className="grid grid-cols-[minmax(0,1.5fr)_120px_minmax(0,1fr)_140px] border-b border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-500">
        <div className="px-4 py-3">외부 상품</div>
        <div className="px-4 py-3">코드</div>
        <div className="px-4 py-3">내부 메뉴</div>
        <div className="px-4 py-3">작업</div>
      </div>

      {rows.map((row) => {
        const storeMenus = optionsByStore.get(row.storeId) ?? [];

        return (
          <MappingRow
            key={row.id}
            row={row}
            storeMenus={storeMenus}
            loading={savingId === row.id}
            onMap={onMap}
            onUnmap={onUnmap}
          />
        );
      })}
    </div>
  );
}

function MappingRow({
  row,
  storeMenus,
  loading,
  onMap,
  onUnmap,
}: {
  row: MenuMappingRow;
  storeMenus: MenuOption[];
  loading: boolean;
  onMap: (externalCatalogItemId: string, menuId: string) => Promise<void>;
  onUnmap: (externalCatalogItemId: string) => Promise<void>;
}) {
  const [selectedMenuId, setSelectedMenuId] = useState(row.mappedMenu?.menuId ?? "");

  return (
    <div className="grid grid-cols-[minmax(0,1.5fr)_120px_minmax(0,1fr)_140px] items-center border-b border-zinc-800 bg-zinc-900 last:border-b-0">
      <div className="px-4 py-3">
        <div className="font-medium text-zinc-100">{row.title}</div>
        <div className="mt-1 text-xs text-zinc-500">{row.provider}</div>
      </div>

      <div className="px-4 py-3 text-sm text-zinc-400">{row.code ?? "-"}</div>

      <div className="px-4 py-3">
        <select
          className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-600"
          value={selectedMenuId}
          onChange={(e) => setSelectedMenuId(e.target.value)}
        >
          <option value="">선택 안 함</option>
          {storeMenus.map((menu) => (
            <option key={menu.id} value={menu.id}>
              {menu.name}
            </option>
          ))}
        </select>

        {row.mappedMenu ? (
          <div className="mt-2 text-xs text-zinc-500">
            현재 매핑: {row.mappedMenu.menuName}
          </div>
        ) : null}
      </div>

      <div className="px-4 py-3">
        <div className="flex gap-2">
          <Button
            onClick={() => onMap(row.id, selectedMenuId)}
            disabled={loading || !selectedMenuId}
          >
            {loading ? "저장 중..." : "저장"}
          </Button>

          {row.mappedMenu ? (
            <Button
              variant="outline"
              onClick={() => onUnmap(row.id)}
              disabled={loading}
            >
              해제
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}