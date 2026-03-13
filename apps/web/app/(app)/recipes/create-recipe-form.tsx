"use client";

import { useState } from "react";
import { Button, Input } from "@workspace/ui";

type MenuOption = {
  id: string;
  name: string;
};

export function CreateRecipeForm({
  menus,
}: {
  menus: MenuOption[];
}) {
  const [menuId, setMenuId] = useState(menus[0]?.id ?? "");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          menuId,
          name,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "레시피 생성 실패");
      }

      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "레시피 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <select
        className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-600"
        value={menuId}
        onChange={(e) => setMenuId(e.target.value)}
      >
        {menus.map((menu) => (
          <option key={menu.id} value={menu.id}>
            {menu.name}
          </option>
        ))}
      </select>

      <Input
        placeholder="레시피명"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Button onClick={onSubmit} disabled={loading || !menuId || !name}>
        {loading ? "생성 중..." : "레시피 생성"}
      </Button>
    </div>
  );
}