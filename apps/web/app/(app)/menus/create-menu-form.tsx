"use client";

import { useState } from "react";
import { Button, Input } from "@workspace/ui";

type StoreOption = {
  id: string;
  name: string;
};

interface CreateMenuFormProps {
  stores: StoreOption[];
}

export function CreateMenuForm({ stores }: CreateMenuFormProps) {
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch("/api/menus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId,
          name,
          isActive,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "메뉴 생성 실패");
      }

      setName("");
      setIsActive(true);
      setMessage("메뉴가 생성되었습니다.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "메뉴 생성 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <select
        value={storeId}
        onChange={(e) => setStoreId(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
      >
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </select>

      <Input
        placeholder="메뉴명"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        판매중으로 등록
      </label>

      {message ? (
        <div className="rounded-xl border border-border p-3 text-sm text-muted-foreground">
          {message}
        </div>
      ) : null}

      <Button
        onClick={onSubmit}
        disabled={loading || !storeId || !name.trim()}
      >
        {loading ? "생성 중..." : "메뉴 생성"}
      </Button>
    </div>
  );
}