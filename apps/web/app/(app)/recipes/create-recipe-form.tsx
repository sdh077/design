"use client";

import { useMemo, useState } from "react";
import { Button } from "@workspace/ui";

type StoreOption = {
  id: string;
  name: string;
};

type MenuOption = {
  id: string;
  store_id: string;
  name: string;
  is_active: boolean;
};

interface CreateRecipeFormProps {
  stores: StoreOption[];
  menus: MenuOption[];
}

export function CreateRecipeForm({
  stores,
  menus,
}: CreateRecipeFormProps) {
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [menuId, setMenuId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => menu.store_id === storeId);
  }, [menus, storeId]);

  async function onSubmit() {
    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId,
          menuId,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "레시피 생성 실패");
      }

      setMenuId("");
      setMessage("레시피가 생성되었습니다.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "레시피 생성 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <select
        value={storeId}
        onChange={(e) => {
          setStoreId(e.target.value);
          setMenuId("");
        }}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
      >
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>

      <select
        value={menuId}
        onChange={(e) => setMenuId(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
      >
        <option value="">메뉴를 선택하세요</option>
        {filteredMenus.map((menu) => (
          <option key={menu.id} value={menu.id}>
            {menu.name}
          </option>
        ))}
      </select>

      {message ? (
        <div className="rounded-xl border border-border p-3 text-sm text-muted-foreground">
          {message}
        </div>
      ) : null}

      <Button
        onClick={onSubmit}
        disabled={loading || !storeId || !menuId}
      >
        {loading ? "생성 중..." : "레시피 생성"}
      </Button>
    </div>
  );
}