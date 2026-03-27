"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@workspace/ui";

export type InventoryGridRow = {
    id: string;
    store_id: string;
    name: string;
    base_unit: string;
    safety_stock: number | string;
    is_active: boolean;
    current_stock: number | string;
    isNew?: boolean;
    tempId?: string;
};

type SortKey = "name" | "base_unit" | "safety_stock" | "current_stock";
type SortDirection = "asc" | "desc";

type InventoryHistoryRow = {
    id: string;
    type: string;
    quantity: number;
    unit: string;
    note: string | null;
    occurred_at: string;
};

type BulkSaveResponse = {
    ok: boolean;
    message?: string;
};

type HistoryResponse = {
    ok: boolean;
    message?: string;
    rows?: InventoryHistoryRow[];
};

type Props = {
    storeId: string;
    storeName: string;
    initialRows: InventoryGridRow[];
};

function toNumber(value: unknown) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function makeTempId() {
    return `temp-${Math.random().toString(36).slice(2, 10)}`;
}

function getRowKey(row: InventoryGridRow) {
    return row.id || row.tempId || "";
}

function parseClipboardLine(line: string) {
    const [name = "", base_unit = "", safety_stock = "0", current_stock = "0"] =
        line.split("\t");

    return {
        name: name.trim(),
        base_unit: base_unit.trim(),
        safety_stock: toNumber(safety_stock),
        current_stock: toNumber(current_stock),
    };
}

export function InventoryGrid({ storeId, storeName, initialRows }: Props) {
    const [rows, setRows] = useState<InventoryGridRow[]>(initialRows);
    const [saving, setSaving] = useState(false);
    const [note, setNote] = useState("실사 반영");
    const [search, setSearch] = useState("");
    const [showInactive, setShowInactive] = useState(true);
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
    const [dirtyMap, setDirtyMap] = useState<Record<string, true>>({});
    const [deactivatedMap, setDeactivatedMap] = useState<Record<string, true>>({});
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyTitle, setHistoryTitle] = useState("");
    const [historyRows, setHistoryRows] = useState<InventoryHistoryRow[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const dirtyCount = useMemo(() => Object.keys(dirtyMap).length, [dirtyMap]);
    const deactivatedCount = useMemo(
        () => Object.keys(deactivatedMap).length,
        [deactivatedMap]
    );

    useEffect(() => {
        const hasUnsavedChanges = dirtyCount > 0 || deactivatedCount > 0;

        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            if (!hasUnsavedChanges) return;
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", onBeforeUnload);
        return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [dirtyCount, deactivatedCount]);

    const visibleRows = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        let next = [...rows];

        if (!showInactive) {
            next = next.filter((row) => row.is_active);
        }

        if (keyword) {
            next = next.filter((row) => {
                return (
                    String(row.name).toLowerCase().includes(keyword) ||
                    String(row.base_unit).toLowerCase().includes(keyword)
                );
            });
        }

        next.sort((a, b) => {
            if (sortKey === "name" || sortKey === "base_unit") {
                const av = String(a[sortKey] ?? "").toLowerCase();
                const bv = String(b[sortKey] ?? "").toLowerCase();

                if (av < bv) return sortDirection === "asc" ? -1 : 1;
                if (av > bv) return sortDirection === "asc" ? 1 : -1;
                return 0;
            }

            const av = toNumber(a[sortKey]);
            const bv = toNumber(b[sortKey]);

            if (av < bv) return sortDirection === "asc" ? -1 : 1;
            if (av > bv) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return next;
    }, [rows, search, showInactive, sortKey, sortDirection]);

    const markDirty = (rowKey: string) => {
        setDirtyMap((prev) => ({
            ...prev,
            [rowKey]: true,
        }));
    };

    const updateCell = (
        rowKeyValue: string,
        field: keyof InventoryGridRow,
        value: string | boolean
    ) => {
        setRows((prev) =>
            prev.map((row) => {
                if (getRowKey(row) !== rowKeyValue) return row;
                return {
                    ...row,
                    [field]: value,
                };
            })
        );

        markDirty(rowKeyValue);
    };

    const addRow = () => {
        const tempId = makeTempId();

        setRows((prev) => [
            {
                id: "",
                tempId,
                store_id: storeId,
                name: "",
                base_unit: "",
                safety_stock: 0,
                is_active: true,
                current_stock: 0,
                isNew: true,
            },
            ...prev,
        ]);

        markDirty(tempId);
    };

    const toggleDeactivate = (rowKeyValue: string) => {
        setDeactivatedMap((prev) => {
            const next = { ...prev };
            if (next[rowKeyValue]) {
                delete next[rowKeyValue];
            } else {
                next[rowKeyValue] = true;
            }
            return next;
        });
    };

    const changeSort = (nextKey: SortKey) => {
        if (sortKey === nextKey) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
            return;
        }

        setSortKey(nextKey);
        setSortDirection("asc");
    };

    const handlePasteRows = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const lines = text
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);

            if (lines.length === 0) return;

            const newRows: InventoryGridRow[] = lines.map((line) => {
                const parsed = parseClipboardLine(line);

                return {
                    id: "",
                    tempId: makeTempId(),
                    store_id: storeId,
                    name: parsed.name,
                    base_unit: parsed.base_unit,
                    safety_stock: parsed.safety_stock,
                    is_active: true,
                    current_stock: parsed.current_stock,
                    isNew: true,
                };
            });

            setRows((prev) => [...newRows, ...prev]);

            setDirtyMap((prev) => {
                const next = { ...prev };
                for (const row of newRows) {
                    next[getRowKey(row)] = true;
                }
                return next;
            });
        } catch {
            alert("클립보드 붙여넣기에 실패했습니다.");
        }
    };

    const validateRows = () => {
        for (const row of rows) {
            const rowKey = getRowKey(row);

            if (!dirtyMap[rowKey]) continue;
            if (deactivatedMap[rowKey]) continue;

            if (!String(row.name).trim()) {
                throw new Error("품목명은 필수입니다.");
            }

            if (!String(row.base_unit).trim()) {
                throw new Error("단위는 필수입니다.");
            }

            if (toNumber(row.safety_stock) < 0) {
                throw new Error("안전재고는 0 이상이어야 합니다.");
            }

            if (toNumber(row.current_stock) < 0) {
                throw new Error("현재고는 0 이상이어야 합니다.");
            }
        }
    };

    const openHistory = async (row: InventoryGridRow) => {
        if (!row.id) return;

        try {
            setHistoryOpen(true);
            setHistoryLoading(true);
            setHistoryTitle(row.name);
            setHistoryRows([]);

            const res = await fetch(`/api/inventory/history?itemId=${row.id}`);
            const json = (await res.json()) as HistoryResponse;

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "이력 조회에 실패했습니다.");
            }

            setHistoryRows(json.rows ?? []);
        } catch (error) {
            alert(error instanceof Error ? error.message : "이력 조회에 실패했습니다.");
            setHistoryOpen(false);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            validateRows();
            setSaving(true);

            const creates = rows
                .filter((row) => row.isNew && dirtyMap[getRowKey(row)] && !deactivatedMap[getRowKey(row)])
                .map((row) => ({
                    name: String(row.name).trim(),
                    base_unit: String(row.base_unit).trim(),
                    safety_stock: toNumber(row.safety_stock),
                    current_stock: toNumber(row.current_stock),
                    is_active: Boolean(row.is_active),
                }));

            const updates = rows
                .filter((row) => !row.isNew && dirtyMap[getRowKey(row)] && !deactivatedMap[getRowKey(row)])
                .map((row) => ({
                    id: row.id,
                    name: String(row.name).trim(),
                    base_unit: String(row.base_unit).trim(),
                    safety_stock: toNumber(row.safety_stock),
                    current_stock: toNumber(row.current_stock),
                    is_active: Boolean(row.is_active),
                }));

            const deactivates = rows
                .filter((row) => !row.isNew && deactivatedMap[getRowKey(row)])
                .map((row) => ({
                    id: row.id,
                }));

            const res = await fetch("/api/inventory/bulk-save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    storeId,
                    note: note.trim() || "실사 반영",
                    creates,
                    updates,
                    deactivates,
                }),
            });

            const json = (await res.json()) as BulkSaveResponse;

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "저장에 실패했습니다.");
            }

            window.location.reload();
        } catch (error) {
            alert(error instanceof Error ? error.message : "저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    const hasUnsavedChanges = dirtyCount > 0 || deactivatedCount > 0;

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                <div className="space-y-1">
                    <p className="font-medium">{storeName}</p>
                    <p className="text-sm text-muted-foreground">
                        변경 {dirtyCount}건 · 비활성 예정 {deactivatedCount}건
                    </p>
                    {hasUnsavedChanges ? (
                        <p className="text-xs text-amber-600">저장되지 않은 변경사항이 있습니다.</p>
                    ) : null}
                </div>

                <div className="grid gap-2 md:grid-cols-2 xl:flex xl:flex-wrap">
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="품목명/단위 검색"
                        className="min-w-[220px]"
                    />

                    <label className="inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.target.checked)}
                        />
                        비활성 포함
                    </label>

                    <Button type="button" variant="outline" onClick={addRow}>
                        행 추가
                    </Button>
                    <Button type="button" variant="outline" onClick={handlePasteRows}>
                        엑셀 붙여넣기
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || !hasUnsavedChanges}
                    >
                        {saving ? "저장 중..." : "저장"}
                    </Button>
                </div>
            </div>

            <div className="max-w-sm">
                <label className="mb-2 block text-sm font-medium">저장 메모</label>
                <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="예: 실사 반영"
                />
            </div>

            <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="border-b px-3 py-2 text-left">
                                <button type="button" onClick={() => changeSort("name")}>
                                    품목명
                                </button>
                            </th>
                            <th className="border-b px-3 py-2 text-left">
                                <button type="button" onClick={() => changeSort("base_unit")}>
                                    단위
                                </button>
                            </th>
                            <th className="border-b px-3 py-2 text-left">
                                <button type="button" onClick={() => changeSort("safety_stock")}>
                                    안전재고
                                </button>
                            </th>
                            <th className="border-b px-3 py-2 text-left">
                                <button type="button" onClick={() => changeSort("current_stock")}>
                                    현재고
                                </button>
                            </th>
                            <th className="border-b px-3 py-2 text-left">상태</th>
                            <th className="border-b px-3 py-2 text-left">이력</th>
                            <th className="border-b px-3 py-2 text-left">비활성</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleRows.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                                    표시할 재고 품목이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            visibleRows.map((row) => {
                                const rowKey = getRowKey(row);
                                const isDirty = Boolean(dirtyMap[rowKey]);
                                const isMarkedDeactivated = Boolean(deactivatedMap[rowKey]);
                                const isLowStock = toNumber(row.current_stock) < toNumber(row.safety_stock);

                                return (
                                    <tr
                                        key={rowKey}
                                        className={[
                                            isDirty ? "bg-yellow-50/60" : "",
                                            isMarkedDeactivated ? "bg-red-50/60 opacity-60" : "",
                                            !row.is_active ? "opacity-60" : "",
                                        ].join(" ")}
                                    >
                                        <td className="border-b px-3 py-2 align-top">
                                            <div className="space-y-1">
                                                <Input
                                                    value={String(row.name ?? "")}
                                                    onChange={(e) => updateCell(rowKey, "name", e.target.value)}
                                                    placeholder="예: 에티오피아 원두"
                                                />
                                                {row.isNew ? (
                                                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                                                        신규
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>

                                        <td className="border-b px-3 py-2 align-top">
                                            <Input
                                                value={String(row.base_unit ?? "")}
                                                onChange={(e) => updateCell(rowKey, "base_unit", e.target.value)}
                                                placeholder="kg / bottle / pack"
                                            />
                                        </td>

                                        <td className="border-b px-3 py-2 align-top">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={String(row.safety_stock ?? 0)}
                                                onChange={(e) => updateCell(rowKey, "safety_stock", e.target.value)}
                                            />
                                        </td>

                                        <td className="border-b px-3 py-2 align-top">
                                            <div className="space-y-1">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={String(row.current_stock ?? 0)}
                                                    onChange={(e) => updateCell(rowKey, "current_stock", e.target.value)}
                                                />
                                                {isLowStock ? (
                                                    <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                                                        안전재고 미만
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>

                                        <td className="border-b px-3 py-2 align-top">
                                            <label className="inline-flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(row.is_active)}
                                                    onChange={(e) => updateCell(rowKey, "is_active", e.target.checked)}
                                                />
                                                <span>{row.is_active ? "사용" : "중지"}</span>
                                            </label>
                                        </td>

                                        <td className="border-b px-3 py-2 align-top">
                                            {row.id ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => openHistory(row)}
                                                >
                                                    보기
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">저장 후 가능</span>
                                            )}
                                        </td>

                                        <td className="border-b px-3 py-2 align-top">
                                            {!row.isNew ? (
                                                <Button
                                                    type="button"
                                                    variant={isMarkedDeactivated ? "default" : "outline"}
                                                    onClick={() => toggleDeactivate(rowKey)}
                                                >
                                                    {isMarkedDeactivated ? "취소" : "비활성"}
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setRows((prev) => prev.filter((r) => getRowKey(r) !== rowKey));
                                                        setDirtyMap((prev) => {
                                                            const next = { ...prev };
                                                            delete next[rowKey];
                                                            return next;
                                                        });
                                                    }}
                                                >
                                                    제거
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                붙여넣기 형식: <code>품목명[TAB]단위[TAB]안전재고[TAB]현재고</code>
            </div>

            {historyOpen ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl rounded-2xl bg-background p-5 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">재고 이력</h3>
                                <p className="text-sm text-muted-foreground">{historyTitle}</p>
                            </div>
                            <Button type="button" variant="outline" onClick={() => setHistoryOpen(false)}>
                                닫기
                            </Button>
                        </div>

                        {historyLoading ? (
                            <div className="py-10 text-center text-sm text-muted-foreground">
                                불러오는 중...
                            </div>
                        ) : historyRows.length === 0 ? (
                            <div className="py-10 text-center text-sm text-muted-foreground">
                                이력이 없습니다.
                            </div>
                        ) : (
                            <div className="max-h-[420px] overflow-auto rounded-xl border">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="border-b px-3 py-2 text-left">시각</th>
                                            <th className="border-b px-3 py-2 text-left">타입</th>
                                            <th className="border-b px-3 py-2 text-left">수량</th>
                                            <th className="border-b px-3 py-2 text-left">단위</th>
                                            <th className="border-b px-3 py-2 text-left">메모</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyRows.map((row) => (
                                            <tr key={row.id}>
                                                <td className="border-b px-3 py-2">
                                                    {new Date(row.occurred_at).toLocaleString("ko-KR")}
                                                </td>
                                                <td className="border-b px-3 py-2">{row.type}</td>
                                                <td className="border-b px-3 py-2">{row.quantity}</td>
                                                <td className="border-b px-3 py-2">{row.unit}</td>
                                                <td className="border-b px-3 py-2">{row.note ?? "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}