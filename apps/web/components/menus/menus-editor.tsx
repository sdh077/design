"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@workspace/ui";

type MenuRow = {
    id: string;
    store_id: string;
    name: string;
    is_active: boolean;
    updated_at: string;
    has_recipe: boolean;
    has_external_mapping: boolean;
    isNew?: boolean;
    tempId?: string;
};

type StatusFilter = "all" | "active" | "inactive";
type LinkedFilter = "all" | "recipe" | "mapped" | "unlinked";
type SortKey = "name" | "updated_at";

type BulkSaveResponse = {
    ok: boolean;
    message?: string;
};

function makeTempId() {
    return `temp-${Math.random().toString(36).slice(2, 10)}`;
}

function getRowKey(row: MenuRow) {
    return row.id || row.tempId || "";
}

function Badge({
    children,
    tone = "default",
}: {
    children: React.ReactNode;
    tone?: "default" | "green" | "blue" | "gray";
}) {
    const className =
        tone === "green"
            ? "bg-green-100 text-green-700"
            : tone === "blue"
                ? "bg-blue-100 text-blue-700"
                : tone === "gray"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-slate-100 text-slate-700";

    return (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
            {children}
        </span>
    );
}

export function MenusEditor({
    storeId,
    storeName,
    initialRows,
}: {
    storeId: string;
    storeName: string;
    initialRows: MenuRow[];
}) {
    const [rows, setRows] = useState<MenuRow[]>(initialRows);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [linkedFilter, setLinkedFilter] = useState<LinkedFilter>("all");
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortAsc, setSortAsc] = useState(true);
    const [dirtyMap, setDirtyMap] = useState<Record<string, true>>({});
    const [deactivatedMap, setDeactivatedMap] = useState<Record<string, true>>({});
    const [newMenuName, setNewMenuName] = useState("");

    useEffect(() => {
        setRows(initialRows);
        setDirtyMap({});
        setDeactivatedMap({});
        setSearch("");
        setStatusFilter("all");
        setLinkedFilter("all");
    }, [initialRows]);

    const dirtyCount = useMemo(() => Object.keys(dirtyMap).length, [dirtyMap]);
    const deactivatedCount = useMemo(
        () => Object.keys(deactivatedMap).length,
        [deactivatedMap]
    );

    const summary = useMemo(() => {
        const total = rows.length;
        const active = rows.filter((row) => row.is_active).length;
        const withRecipe = rows.filter((row) => row.has_recipe).length;
        const withMapping = rows.filter((row) => row.has_external_mapping).length;

        return { total, active, withRecipe, withMapping };
    }, [rows]);

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

    const markDirty = (rowKey: string) => {
        setDirtyMap((prev) => ({
            ...prev,
            [rowKey]: true,
        }));
    };

    const updateRow = (rowKeyValue: string, patch: Partial<MenuRow>) => {
        setRows((prev) =>
            prev.map((row) =>
                getRowKey(row) === rowKeyValue ? { ...row, ...patch } : row
            )
        );
        markDirty(rowKeyValue);
    };

    const addRow = () => {
        const name = newMenuName.trim();
        if (!name) {
            alert("메뉴명을 입력해주세요.");
            return;
        }

        const tempId = makeTempId();

        setRows((prev) => [
            {
                id: "",
                tempId,
                store_id: storeId,
                name,
                is_active: true,
                updated_at: new Date().toISOString(),
                has_recipe: false,
                has_external_mapping: false,
                isNew: true,
            },
            ...prev,
        ]);

        setDirtyMap((prev) => ({
            ...prev,
            [tempId]: true,
        }));

        setNewMenuName("");
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

    const filteredRows = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        let next = [...rows];

        if (keyword) {
            next = next.filter((row) => row.name.toLowerCase().includes(keyword));
        }

        if (statusFilter === "active") {
            next = next.filter((row) => row.is_active);
        } else if (statusFilter === "inactive") {
            next = next.filter((row) => !row.is_active);
        }

        if (linkedFilter === "recipe") {
            next = next.filter((row) => row.has_recipe);
        } else if (linkedFilter === "mapped") {
            next = next.filter((row) => row.has_external_mapping);
        } else if (linkedFilter === "unlinked") {
            next = next.filter((row) => !row.has_recipe && !row.has_external_mapping);
        }

        next.sort((a, b) => {
            if (sortKey === "name") {
                const av = a.name.toLowerCase();
                const bv = b.name.toLowerCase();
                if (av < bv) return sortAsc ? -1 : 1;
                if (av > bv) return sortAsc ? 1 : -1;
                return 0;
            }

            const av = new Date(a.updated_at).getTime();
            const bv = new Date(b.updated_at).getTime();
            return sortAsc ? av - bv : bv - av;
        });

        return next;
    }, [rows, search, statusFilter, linkedFilter, sortKey, sortAsc]);

    const handleSave = async () => {
        try {
            const creates = rows
                .filter((row) => row.isNew && dirtyMap[getRowKey(row)] && !deactivatedMap[getRowKey(row)])
                .map((row) => ({
                    name: row.name.trim(),
                    is_active: row.is_active,
                }));

            const updates = rows
                .filter((row) => !row.isNew && dirtyMap[getRowKey(row)] && !deactivatedMap[getRowKey(row)])
                .map((row) => ({
                    id: row.id,
                    name: row.name.trim(),
                    is_active: row.is_active,
                }));

            const deactivates = rows
                .filter((row) => !row.isNew && deactivatedMap[getRowKey(row)])
                .map((row) => ({
                    id: row.id,
                }));

            for (const row of [...creates, ...updates]) {
                if (!row.name) {
                    throw new Error("메뉴명은 비워둘 수 없습니다.");
                }
            }

            setSaving(true);

            const res = await fetch("/api/menus/bulk-save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    storeId,
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
            <div className="space-y-1">
                <p className="font-medium">{storeName}</p>
                <p className="text-sm text-muted-foreground">
                    변경 {dirtyCount}건 · 비활성 예정 {deactivatedCount}건
                </p>
                {hasUnsavedChanges ? (
                    <p className="text-xs text-amber-600">저장되지 않은 변경사항이 있습니다.</p>
                ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">전체 메뉴</p>
                    <p className="mt-1 text-2xl font-semibold">{summary.total}</p>
                </div>
                <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">사용 중</p>
                    <p className="mt-1 text-2xl font-semibold">{summary.active}</p>
                </div>
                <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">레시피 연결</p>
                    <p className="mt-1 text-2xl font-semibold">{summary.withRecipe}</p>
                </div>
                <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">POS 매핑</p>
                    <p className="mt-1 text-2xl font-semibold">{summary.withMapping}</p>
                </div>
            </div>

            <div className="grid gap-3 xl:grid-cols-[1fr_160px_180px_180px_auto]">
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="메뉴 검색"
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="all">전체 상태</option>
                    <option value="active">사용만</option>
                    <option value="inactive">중지만</option>
                </select>

                <select
                    value={linkedFilter}
                    onChange={(e) => setLinkedFilter(e.target.value as LinkedFilter)}
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="all">전체 연결</option>
                    <option value="recipe">레시피 있음</option>
                    <option value="mapped">POS 매핑 있음</option>
                    <option value="unlinked">둘 다 없음</option>
                </select>

                <select
                    value={`${sortKey}:${sortAsc ? "asc" : "desc"}`}
                    onChange={(e) => {
                        const [nextKey, nextDirection] = e.target.value.split(":");
                        setSortKey(nextKey as SortKey);
                        setSortAsc(nextDirection === "asc");
                    }}
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                >
                    <option value="name:asc">이름 오름차순</option>
                    <option value="name:desc">이름 내림차순</option>
                    <option value="updated_at:desc">수정일 최신순</option>
                    <option value="updated_at:asc">수정일 오래된순</option>
                </select>

                <Button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !hasUnsavedChanges}
                >
                    {saving ? "저장 중..." : "저장"}
                </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto] rounded-xl border p-4">
                <Input
                    value={newMenuName}
                    onChange={(e) => setNewMenuName(e.target.value)}
                    placeholder="새 메뉴명 입력"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addRow();
                        }
                    }}
                />
                <Button type="button" variant="outline" onClick={addRow}>
                    메뉴 추가
                </Button>
            </div>

            <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="border-b px-3 py-2 text-left">메뉴명</th>
                            <th className="border-b px-3 py-2 text-left">연결 상태</th>
                            <th className="border-b px-3 py-2 text-left">상태</th>
                            <th className="border-b px-3 py-2 text-left">수정일</th>
                            <th className="border-b px-3 py-2 text-left">비활성</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                                    표시할 메뉴가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            filteredRows.map((row) => {
                                const rowKey = getRowKey(row);
                                const isDirty = Boolean(dirtyMap[rowKey]);
                                const isMarkedDeactivated = Boolean(deactivatedMap[rowKey]);

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
                                                    value={row.name}
                                                    onChange={(e) =>
                                                        updateRow(rowKey, {
                                                            name: e.target.value,
                                                            updated_at: new Date().toISOString(),
                                                        })
                                                    }
                                                    placeholder="메뉴명"
                                                />
                                                {row.isNew ? (
                                                    <Badge tone="blue">신규</Badge>
                                                ) : null}
                                            </div>
                                        </td>

                                        <td className="border-b px-3 py-2 align-top">
                                            <div className="flex flex-wrap gap-1">
                                                {row.has_recipe ? <Badge tone="green">레시피 있음</Badge> : <Badge tone="gray">레시피 없음</Badge>}
                                                {row.has_external_mapping ? <Badge tone="blue">POS 매핑 있음</Badge> : <Badge tone="gray">POS 매핑 없음</Badge>}
                                            </div>
                                        </td>

                                        <td className="border-b px-3 py-2 align-top">
                                            <label className="inline-flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={row.is_active}
                                                    onChange={(e) =>
                                                        updateRow(rowKey, {
                                                            is_active: e.target.checked,
                                                            updated_at: new Date().toISOString(),
                                                        })
                                                    }
                                                />
                                                <span>{row.is_active ? "사용" : "중지"}</span>
                                            </label>
                                        </td>

                                        <td className="border-b px-3 py-2 align-top text-muted-foreground">
                                            {row.updated_at
                                                ? new Date(row.updated_at).toLocaleString("ko-KR")
                                                : "-"}
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
        </div>
    );
}