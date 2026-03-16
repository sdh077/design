"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@workspace/ui";

type StoreOption = {
  id: string;
  name: string;
};

type CalibrationItem = {
  menuId: string;
  menuName: string;
  recipeId: string;
  inventoryItemId: string;
  inventoryItemName: string;
  unit: string;
  soldCount: number;
  currentQuantity: number;
  expectedTotalQuantity: number;
  allocatedActualQuantity: number;
  suggestedQuantity: number | null;
  differencePerMenu: number | null;
  varianceRate: number | null;
  confidence: "HIGH" | "MEDIUM" | "LOW";
};

type CalibrationResponse = {
  ok: boolean;
  range?: {
    from: string;
    to: string;
    days: number;
  };
  items?: CalibrationItem[];
  message?: string;
};

export function RecipeCalibrationClient({
  stores,
}: {
  stores: StoreOption[];
}) {
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [days, setDays] = useState("14");
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [items, setItems] = useState<CalibrationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [range, setRange] = useState<CalibrationResponse["range"] | null>(null);

  const filteredItems = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return items;

    return items.filter(
      (item) =>
        item.menuName.toLowerCase().includes(q) ||
        item.inventoryItemName.toLowerCase().includes(q)
    );
  }, [items, keyword]);

  const summary = useMemo(() => {
    const candidates = filteredItems.filter((item) => item.suggestedQuantity !== null);
    const changed = candidates.filter(
      (item) => Number(item.currentQuantity) !== Number(item.suggestedQuantity)
    );

    return {
      total: filteredItems.length,
      changed: changed.length,
      high: filteredItems.filter((item) => item.confidence === "HIGH").length,
      medium: filteredItems.filter((item) => item.confidence === "MEDIUM").length,
    };
  }, [filteredItems]);

  const onFetch = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/recipe-calibration?storeId=${encodeURIComponent(storeId)}&days=${encodeURIComponent(days)}`
      );

      const json = (await res.json()) as CalibrationResponse;

      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "레시피 보정 조회 실패");
      }

      setItems(json.items ?? []);
      setRange(json.range ?? null);
    } catch (err) {
      setItems([]);
      setRange(null);
      setError(err instanceof Error ? err.message : "레시피 보정 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = async (item: CalibrationItem) => {
    try {
      if (item.suggestedQuantity === null) {
        throw new Error("추천값이 없습니다.");
      }

      setSavingKey(`${item.menuId}:${item.inventoryItemId}`);

      const recipeLineId = await findRecipeLineId(item);
      if (!recipeLineId) {
        throw new Error("해당 레시피 라인을 찾지 못했습니다.");
      }

      const res = await fetch(`/api/recipe-lines/${recipeLineId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: item.suggestedQuantity,
          unit: item.unit,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "레시피 반영 실패");
      }

      setItems((prev) =>
        prev.map((prevItem) =>
          prevItem.menuId === item.menuId &&
          prevItem.inventoryItemId === item.inventoryItemId
            ? {
                ...prevItem,
                currentQuantity: item.suggestedQuantity ?? prevItem.currentQuantity,
                differencePerMenu: 0,
                varianceRate: 0,
              }
            : prevItem
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "레시피 반영 실패");
    } finally {
      setSavingKey(null);
    }
  };

  const findRecipeLineId = async (item: CalibrationItem) => {
    const res = await fetch(
      `/api/recipe-lines/find?recipeId=${encodeURIComponent(item.recipeId)}&inventoryItemId=${encodeURIComponent(item.inventoryItemId)}`
    );
    const json = await res.json();

    if (!res.ok || !json.ok) {
      throw new Error(json.message ?? "레시피 라인 조회 실패");
    }

    return json.recipeLineId as string | null;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_140px]">
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

        <select
          className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-600"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        >
          <option value="7">최근 7일</option>
          <option value="14">최근 14일</option>
          <option value="30">최근 30일</option>
        </select>

        <Button onClick={onFetch} disabled={loading || !storeId}>
          {loading ? "조회 중..." : "조회"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>전체 후보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-zinc-100">{summary.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>변경 추천</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-zinc-100">{summary.changed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>HIGH 신뢰도</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-zinc-100">{summary.high}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MEDIUM 신뢰도</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-zinc-100">{summary.medium}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
        <Input
          placeholder="메뉴명 또는 품목명 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-400">
          {range
            ? `${range.days}일 기준 ${new Date(range.from).toLocaleDateString("ko-KR")} ~ ${new Date(range.to).toLocaleDateString("ko-KR")}`
            : "조회 범위를 선택해라"}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-zinc-800">
        <div className="grid grid-cols-[160px_160px_80px_120px_120px_120px_100px_100px_120px_120px] border-b border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-500">
          <div className="px-4 py-3">메뉴</div>
          <div className="px-4 py-3">품목</div>
          <div className="px-4 py-3">단위</div>
          <div className="px-4 py-3 text-right">판매수량</div>
          <div className="px-4 py-3 text-right">현재값</div>
          <div className="px-4 py-3 text-right">추천값</div>
          <div className="px-4 py-3 text-right">차이</div>
          <div className="px-4 py-3 text-right">오차율</div>
          <div className="px-4 py-3">신뢰도</div>
          <div className="px-4 py-3">작업</div>
        </div>

        {filteredItems.map((item) => {
          const rowKey = `${item.menuId}:${item.inventoryItemId}`;
          const changed =
            item.suggestedQuantity !== null &&
            Number(item.currentQuantity) !== Number(item.suggestedQuantity);

          return (
            <div
              key={rowKey}
              className="grid grid-cols-[160px_160px_80px_120px_120px_120px_100px_100px_120px_120px] border-b border-zinc-800 bg-zinc-900 last:border-b-0"
            >
              <div className="px-4 py-3 font-medium text-zinc-100">{item.menuName}</div>
              <div className="px-4 py-3 text-zinc-300">{item.inventoryItemName}</div>
              <div className="px-4 py-3 text-sm text-zinc-400">{item.unit}</div>
              <div className="px-4 py-3 text-right text-sm text-zinc-100">
                {item.soldCount.toLocaleString()}
              </div>
              <div className="px-4 py-3 text-right text-sm text-zinc-100">
                {item.currentQuantity.toLocaleString()}
              </div>
              <div className="px-4 py-3 text-right text-sm text-zinc-100">
                {item.suggestedQuantity !== null
                  ? item.suggestedQuantity.toLocaleString()
                  : "-"}
              </div>
              <div
                className={`px-4 py-3 text-right text-sm ${
                  (item.differencePerMenu ?? 0) > 0
                    ? "text-red-400"
                    : (item.differencePerMenu ?? 0) < 0
                    ? "text-emerald-400"
                    : "text-zinc-300"
                }`}
              >
                {item.differencePerMenu !== null
                  ? item.differencePerMenu.toLocaleString()
                  : "-"}
              </div>
              <div className="px-4 py-3 text-right text-sm text-zinc-300">
                {item.varianceRate !== null ? `${item.varianceRate}%` : "-"}
              </div>
              <div className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    item.confidence === "HIGH"
                      ? "bg-emerald-950 text-emerald-300"
                      : item.confidence === "MEDIUM"
                      ? "bg-amber-950 text-amber-300"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {item.confidence}
                </span>
              </div>
              <div className="px-4 py-3">
                <Button
                  onClick={() => applySuggestion(item)}
                  disabled={!changed || savingKey === rowKey}
                >
                  {savingKey === rowKey ? "반영 중..." : "반영"}
                </Button>
              </div>
            </div>
          );
        })}

        {!loading && !filteredItems.length ? (
          <div className="bg-zinc-900 px-4 py-10 text-center text-sm text-zinc-500">
            조회 결과가 없다.
          </div>
        ) : null}
      </div>
    </div>
  );
}