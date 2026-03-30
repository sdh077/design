"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@workspace/ui";

type StoreRow = {
    id: string;
    name: string;
};

type SnapshotRow = {
    id: string;
    snapshot_at: string;
    item_count: number;
};

type DailyRow = {
    inventory_item_id: string;
    inventory_item_name: string;
    unit: string;
    opening_quantity: number;
    inbound_quantity: number;
    closing_quantity: number;
    actual_quantity: number;
    expected_quantity: number;
    gap_quantity: number;
    gap_rate: number | null;
};

type MenuUsageRow = {
    menu_id: string;
    menu_name: string;
    inventory_item_id: string;
    inventory_item_name: string;
    unit: string;
    sold_quantity: number;
    current_recipe_quantity: number;
    expected_quantity: number;
};

type SuggestionRow = {
    menu_id: string;
    menu_name: string;
    inventory_item_id: string;
    inventory_item_name: string;
    unit: string;
    current_recipe_quantity: number;
    suggested_recipe_quantity: number;
    expected_quantity: number;
    actual_quantity: number;
    gap_quantity: number;
    confidence_score: number;
    ratio: number;
};

function formatDateTime(v?: string) {
    if (!v) return "-";
    return new Date(v).toLocaleString("ko-KR");
}

export function ConsumptionIntervalAnalysisClient({
    stores,
}: {
    stores: StoreRow[];
}) {
    const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
    const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
    const [fromSnapshotId, setFromSnapshotId] = useState("");
    const [toSnapshotId, setToSnapshotId] = useState("");
    const [dailyRows, setDailyRows] = useState<DailyRow[]>([]);
    const [menuRows, setMenuRows] = useState<MenuUsageRow[]>([]);
    const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
    const [fromAt, setFromAt] = useState("");
    const [toAt, setToAt] = useState("");
    const [loading, setLoading] = useState(false);

    const loadSnapshots = async (nextStoreId: string) => {
        if (!nextStoreId) return;

        const res = await fetch(`/api/inventory-snapshots/list?storeId=${nextStoreId}`);
        const json = await res.json();

        if (!res.ok || !json.ok) {
            throw new Error(json.message ?? "스냅샷 목록 조회 실패");
        }

        const rows = (json.rows ?? []) as SnapshotRow[];
        const ordered = [...rows].sort(
            (a, b) =>
                new Date(a.snapshot_at).getTime() - new Date(b.snapshot_at).getTime()
        );

        setSnapshots(ordered);

        if (ordered.length >= 2) {
            const fromSnapshot = ordered.at(-2);
            const toSnapshot = ordered.at(-1);

            if (fromSnapshot && toSnapshot) {
                setFromSnapshotId(fromSnapshot.id);
                setToSnapshotId(toSnapshot.id);
            } else {
                setFromSnapshotId("");
                setToSnapshotId("");
            }
        } else {
            setFromSnapshotId("");
            setToSnapshotId("");
        }
    };

    const loadAnalysis = async () => {
        if (!storeId || !fromSnapshotId || !toSnapshotId) return;

        try {
            setLoading(true);

            const [intervalRes, suggestRes] = await Promise.all([
                fetch(
                    `/api/consumption/interval?storeId=${storeId}&fromSnapshotId=${fromSnapshotId}&toSnapshotId=${toSnapshotId}`
                ),
                fetch(
                    `/api/recipe-calibration/suggest?storeId=${storeId}&intervalCount=3`
                ),
            ]);

            const intervalJson = await intervalRes.json();
            const suggestJson = await suggestRes.json();

            if (!intervalRes.ok || !intervalJson.ok) {
                throw new Error(intervalJson.message ?? "구간 분석 실패");
            }

            if (!suggestRes.ok || !suggestJson.ok) {
                throw new Error(suggestJson.message ?? "보정 추천 조회 실패");
            }

            setDailyRows(intervalJson.dailyRows ?? []);
            setMenuRows(intervalJson.menuUsageRows ?? []);
            setSuggestions(suggestJson.rows ?? []);
            setFromAt(intervalJson.from_snapshot_at ?? "");
            setToAt(intervalJson.to_snapshot_at ?? "");
        } catch (error) {
            alert(error instanceof Error ? error.message : "분석 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSnapshots(storeId).catch((error) => {
            alert(error instanceof Error ? error.message : "스냅샷 목록 조회 실패");
        });
    }, [storeId]);

    useEffect(() => {
        if (fromSnapshotId && toSnapshotId) {
            loadAnalysis();
        }
    }, [fromSnapshotId, toSnapshotId]);

    const summary = useMemo(() => {
        const expected = dailyRows.reduce((sum, row) => sum + Number(row.expected_quantity ?? 0), 0);
        const actual = dailyRows.reduce((sum, row) => sum + Number(row.actual_quantity ?? 0), 0);
        const gap = actual - expected;

        return { expected, actual, gap };
    }, [dailyRows]);

    if (stores.length === 0) {
        return (
            <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
                먼저 매장을 생성해야 합니다.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-xl border bg-card p-4">
                <div className="grid gap-3 md:grid-cols-[220px_1fr_1fr_auto]">
                    <select
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                    >
                        {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={fromSnapshotId}
                        onChange={(e) => setFromSnapshotId(e.target.value)}
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                    >
                        <option value="">시작 스냅샷 선택</option>
                        {snapshots.map((snapshot) => (
                            <option key={snapshot.id} value={snapshot.id}>
                                {formatDateTime(snapshot.snapshot_at)} ({snapshot.item_count}개)
                            </option>
                        ))}
                    </select>

                    <select
                        value={toSnapshotId}
                        onChange={(e) => setToSnapshotId(e.target.value)}
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                    >
                        <option value="">종료 스냅샷 선택</option>
                        {snapshots.map((snapshot) => (
                            <option key={snapshot.id} value={snapshot.id}>
                                {formatDateTime(snapshot.snapshot_at)} ({snapshot.item_count}개)
                            </option>
                        ))}
                    </select>

                    <Button onClick={loadAnalysis} disabled={loading || !fromSnapshotId || !toSnapshotId}>
                        {loading ? "조회 중..." : "조회"}
                    </Button>
                </div>

                <div className="mt-3 text-sm text-muted-foreground">
                    분석 구간: {formatDateTime(fromAt)} ~ {formatDateTime(toAt)}
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">예상 소모</div>
                        <div className="mt-2 text-2xl font-semibold">{summary.expected.toFixed(2)}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">실제 소모</div>
                        <div className="mt-2 text-2xl font-semibold">{summary.actual.toFixed(2)}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">차이</div>
                        <div className="mt-2 text-2xl font-semibold">{summary.gap.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-xl border bg-card">
                    <div className="border-b p-4 font-semibold">재료별 구간 분석</div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr className="border-b">
                                    <th className="px-4 py-3 text-left">재료</th>
                                    <th className="px-4 py-3 text-right">시작</th>
                                    <th className="px-4 py-3 text-right">입고</th>
                                    <th className="px-4 py-3 text-right">종료</th>
                                    <th className="px-4 py-3 text-right">예상</th>
                                    <th className="px-4 py-3 text-right">실제</th>
                                    <th className="px-4 py-3 text-right">차이</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyRows.map((row) => (
                                    <tr key={row.inventory_item_id} className="border-b">
                                        <td className="px-4 py-3">
                                            <div>{row.inventory_item_name}</div>
                                            <div className="text-xs text-muted-foreground">{row.unit}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">{row.opening_quantity.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">{row.inbound_quantity.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">{row.closing_quantity.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">{row.expected_quantity.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">{row.actual_quantity.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">{row.gap_quantity.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {dailyRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                                            분석 데이터가 없습니다.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-xl border bg-card">
                    <div className="border-b p-4 font-semibold">메뉴별 예상 소모 기여</div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr className="border-b">
                                    <th className="px-4 py-3 text-left">메뉴</th>
                                    <th className="px-4 py-3 text-left">재료</th>
                                    <th className="px-4 py-3 text-right">판매수량</th>
                                    <th className="px-4 py-3 text-right">레시피</th>
                                    <th className="px-4 py-3 text-right">예상소모</th>
                                </tr>
                            </thead>
                            <tbody>
                                {menuRows.map((row, idx) => (
                                    <tr key={`${row.menu_id}-${row.inventory_item_id}-${idx}`} className="border-b">
                                        <td className="px-4 py-3">{row.menu_name}</td>
                                        <td className="px-4 py-3">{row.inventory_item_name}</td>
                                        <td className="px-4 py-3 text-right">{row.sold_quantity}</td>
                                        <td className="px-4 py-3 text-right">
                                            {row.current_recipe_quantity} {row.unit}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {row.expected_quantity.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {menuRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                                            기여 데이터가 없습니다.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card">
                <div className="border-b p-4 font-semibold">최근 스냅샷 구간 기준 레시피 보정 추천</div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr className="border-b">
                                <th className="px-4 py-3 text-left">메뉴</th>
                                <th className="px-4 py-3 text-left">재료</th>
                                <th className="px-4 py-3 text-right">현재</th>
                                <th className="px-4 py-3 text-right">권장</th>
                                <th className="px-4 py-3 text-right">예상</th>
                                <th className="px-4 py-3 text-right">실제</th>
                                <th className="px-4 py-3 text-right">신뢰도</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suggestions.map((row, idx) => (
                                <tr key={`${row.menu_id}-${row.inventory_item_id}-${idx}`} className="border-b">
                                    <td className="px-4 py-3">{row.menu_name}</td>
                                    <td className="px-4 py-3">{row.inventory_item_name}</td>
                                    <td className="px-4 py-3 text-right">
                                        {row.current_recipe_quantity} {row.unit}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {row.suggested_recipe_quantity} {row.unit}
                                    </td>
                                    <td className="px-4 py-3 text-right">{row.expected_quantity.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">{row.actual_quantity.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right">
                                        {(row.confidence_score * 100).toFixed(0)}%
                                    </td>
                                </tr>
                            ))}
                            {suggestions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                                        추천할 보정값이 없습니다.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}