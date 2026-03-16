"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@workspace/ui";

type RecipeLine = {
  id: string;
  recipe_id: string;
  inventory_item_id: string;
  quantity: number;
  unit: string;
};

type InventoryItem = {
  id: string;
  name: string;
  base_unit: string;
};

export function RecipeLineManager({
  recipeId,
  storeId,
}: {
  recipeId: string;
  storeId: string;
}) {
  const [lines, setLines] = useState<RecipeLine[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryItemId, setInventoryItemId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const [linesRes, inventoryRes] = await Promise.all([
      fetch(`/api/recipes/${recipeId}/lines`),
      fetch(`/api/inventory-items?storeId=${storeId}`),
    ]);

    const linesJson = await linesRes.json();
    const inventoryJson = await inventoryRes.json();

    if (linesJson.ok) {
      setLines(linesJson.lines ?? []);
    }

    if (inventoryJson.ok) {
      setInventoryItems(inventoryJson.items ?? []);
    }
  }

  useEffect(() => {
    load();
  }, [recipeId, storeId]);

  async function addLine() {
    try {
      setLoading(true);

      const res = await fetch(`/api/recipes/${recipeId}/lines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inventoryItemId,
          quantity: Number(quantity),
          unit,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "레시피 라인 추가 실패");
      }

      setInventoryItemId("");
      setQuantity("1");
      setUnit("");
      await load();
    } catch (error) {
      alert(error instanceof Error ? error.message : "레시피 라인 추가 실패");
    } finally {
      setLoading(false);
    }
  }

  async function removeLine(lineId: string) {
    try {
      setLoading(true);

      const res = await fetch(`/api/recipes/${recipeId}/lines`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lineId,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "레시피 라인 삭제 실패");
      }

      await load();
    } catch (error) {
      alert(error instanceof Error ? error.message : "레시피 라인 삭제 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/70 p-4">
      <div className="space-y-2">
        {lines.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            등록된 재료가 없습니다.
          </div>
        ) : (
          lines.map((line) => {
            const item = inventoryItems.find(
              (inventoryItem) => inventoryItem.id === line.inventory_item_id
            );

            return (
              <div
                key={line.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium text-foreground">
                    {item?.name ?? "재고 품목"}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {line.quantity} {line.unit}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  className="text-sm text-red-400"
                  disabled={loading}
                >
                  삭제
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <select
          value={inventoryItemId}
          onChange={(e) => {
            const nextId = e.target.value;
            setInventoryItemId(nextId);

            const selected = inventoryItems.find((item) => item.id === nextId);
            setUnit(selected?.base_unit ?? "");
          }}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
        >
          <option value="">재고 품목 선택</option>
          {inventoryItems.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <Input
          type="number"
          placeholder="수량"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <Input
          placeholder="단위"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
      </div>

      <Button
        onClick={addLine}
        disabled={loading || !inventoryItemId || !quantity || !unit}
      >
        {loading ? "처리 중..." : "재료 추가"}
      </Button>
    </div>
  );
}