"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from "@workspace/ui";

type RecipeCard = {
  id: string;
  name: string;
  version: number;
  menuName: string;
  menuId: string;
  inventoryOptions: {
    id: string;
    name: string;
    base_unit: string;
  }[];
  lines: {
    id: string;
    inventoryItemId: string;
    inventoryItemName: string;
    quantity: number;
    unit: string;
  }[];
};

export function RecipeLineManager({
  recipe,
}: {
  recipe: RecipeCard;
}) {
  const [inventoryItemId, setInventoryItemId] = useState(
    recipe.inventoryOptions[0]?.id ?? ""
  );
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState(recipe.inventoryOptions[0]?.base_unit ?? "");
  const [loading, setLoading] = useState(false);

  const onInventoryChange = (nextId: string) => {
    setInventoryItemId(nextId);
    const selected = recipe.inventoryOptions.find((item) => item.id === nextId);
    setUnit(selected?.base_unit ?? "");
  };

  const onAddLine = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/recipe-lines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeId: recipe.id,
          inventoryItemId,
          quantity: Number(quantity),
          unit,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "레시피 라인 추가 실패");
      }

      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "레시피 라인 추가 실패");
    } finally {
      setLoading(false);
    }
  };

  const onDeleteLine = async (id: string) => {
    try {
      setLoading(true);

      const res = await fetch(`/api/recipe-lines/${id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "레시피 라인 삭제 실패");
      }

      window.location.reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "레시피 라인 삭제 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{recipe.menuName}</CardTitle>
        <div className="text-sm text-zinc-400">
          {recipe.name} / v{recipe.version}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px_100px_100px]">
          <select
            className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-600"
            value={inventoryItemId}
            onChange={(e) => onInventoryChange(e.target.value)}
          >
            {recipe.inventoryOptions.map((item) => (
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

          <Button
            onClick={onAddLine}
            disabled={loading || !inventoryItemId || !quantity || !unit}
          >
            추가
          </Button>
        </div>

        <div className="space-y-2">
          {recipe.lines.map((line) => (
            <div
              key={line.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3"
            >
              <div>
                <div className="font-medium text-zinc-100">
                  {line.inventoryItemName}
                </div>
                <div className="text-sm text-zinc-400">
                  {line.quantity} {line.unit}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => onDeleteLine(line.id)}
                disabled={loading}
              >
                삭제
              </Button>
            </div>
          ))}

          {!recipe.lines.length ? (
            <div className="rounded-xl border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">
              아직 레시피 라인이 없다.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}