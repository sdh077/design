"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@workspace/ui";

type StoreOption = {
  id: string;
  name: string;
};

type CompareItem = {
  inventoryItemId: string;
  inventoryItemName: string;
  baseUnit: string;
  expectedQuantity: number;
  actualQuantity: number;
  wasteQuantity: number;
  adjustmentQuantity: number;
  difference: number;
  varianceRate: number | null;
};

type CompareResponse = {
  ok: boolean;
  range?: {
    from: string;
    to: string;
    days: number;
  };
  items?: CompareItem[];
  message?: string;
};

export function ConsumptionClient({
  stores,
}: {
  stores: StoreOption[];
}) {
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [days, setDays] = useState("7");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CompareItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<CompareResponse["range"] | null>(null);
  const [keyword, setKeyword] = useState("");

  const filteredItems = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) =>
      item.inventoryItemName.toLowerCase().includes(q)
    );
  }, [items, keyword]);

  const summary = useMemo(() => {
    return filteredItems.reduce(
      (acc, item) => {
        acc.expected += item.expectedQuantity;
        acc.actual += item.actualQuantity;
        acc.waste += item.wasteQuantity;
        acc.adjustment += item.adjustmentQuantity;
        return acc;
      },
      { expected: 0, actual: 0, waste: 0, adjustment: 0 }
    );
  }, [filteredItems]);

  const onFetch = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `/api/consumption/compare?storeId=${encodeURIComponent(storeId)}&days=${encodeURIComponent(days)}`
      );

      const json = (await res.json()) as CompareResponse;

      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "소모량 비교 조회 실패");
      }

      setItems(json.items ?? []);
      setRange(json.range ?? null);
    } catch (err) {
      setItems([]);
      setRange(null);
      setError(err instanceof Error ? err.message : "소모량 비교 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_140px]">
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
          <CardHeader><CardTitle>예상 소모량</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-zinc-100">
              {summary.expected.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>실제 사용량</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-zinc-100">
              {summary.actual.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>폐기량</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-zinc-100">
              {summary.waste.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>조정량</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-zinc-100">
              {summary.adjustment.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <Input
          placeholder="품목명 검색"
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
        <div className="grid grid-cols-[minmax(0,1.5fr)_120px_140px_140px_120px_120px_120px] border-b border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-500">
          <div className="px-4 py-3">품목명</div>
          <div className="px-4 py-3">단위</div>
          <div className="px-4 py-3 text-right">예상</div>
          <div className="px-4 py-3 text-right">실제</div>
          <div className="px-4 py-3 text-right">폐기</div>
          <div className="px-4 py-3 text-right">차이</div>
          <div className="px-4 py-3 text-right">오차율</div>
        </div>

        {filteredItems.map((item) => (
          <div
            key={item.inventoryItemId}
            className="grid grid-cols-[minmax(0,1.5fr)_120px_140px_140px_120px_120px_120px] border-b border-zinc-800 bg-zinc-900 last:border-b-0"
          >
            <div className="px-4 py-3 font-medium text-zinc-100">
              {item.inventoryItemName}
            </div>
            <div className="px-4 py-3 text-sm text-zinc-400">
              {item.baseUnit}
            </div>
            <div className="px-4 py-3 text-right text-sm text-zinc-100">
              {item.expectedQuantity.toLocaleString()}
            </div>
            <div className="px-4 py-3 text-right text-sm text-zinc-100">
              {item.actualQuantity.toLocaleString()}
            </div>
            <div className="px-4 py-3 text-right text-sm text-zinc-400">
              {item.wasteQuantity.toLocaleString()}
            </div>
            <div
              className={`px-4 py-3 text-right text-sm ${
                item.difference > 0
                  ? "text-red-400"
                  : item.difference < 0
                  ? "text-emerald-400"
                  : "text-zinc-300"
              }`}
            >
              {item.difference.toLocaleString()}
            </div>
            <div className="px-4 py-3 text-right text-sm text-zinc-300">
              {item.varianceRate !== null ? `${item.varianceRate}%` : "-"}
            </div>
          </div>
        ))}

        {!loading && !filteredItems.length ? (
          <div className="bg-zinc-900 px-4 py-10 text-center text-sm text-zinc-500">
            조회 결과가 없다.
          </div>
        ) : null}
      </div>
    </div>
  );
}