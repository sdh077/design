"use client";

import { useState } from "react";
import { Button, Input } from "@workspace/ui";

type StoreOption = {
  id: string;
  name: string;
};

export function CreateMenuForm({ stores }: { stores: StoreOption[] }) {
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/menus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId,
          name,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "메뉴 생성 실패");
      }

      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "메뉴 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <select
        className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-600"
        value={storeId}
        onChange={(e) => setStoreId(e.target.value)}
      >
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>

      <Input
        placeholder="내부 메뉴명"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <Button onClick={onSubmit} disabled={loading || !storeId || !name}>
        {loading ? "생성 중..." : "내부 메뉴 생성"}
      </Button>
    </div>
  );
}