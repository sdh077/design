"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@workspace/ui";

type StoreRow = {
    id: string;
    name: string;
};

type ExternalMenuRow = {
    id: string;
    store_id: string;
    provider: string;
    external_item_id: string;
    title: string;
    code: string | null;
    description: string | null;
    image_url: string | null;
    raw_json: unknown;
    synced_at: string;
    menu_external_item_maps?:
    | {
        id: string;
        menu_id: string;
        menus:
        | {
            id: string;
            name: string;
        }
        | {
            id: string;
            name: string;
        }[]
        | null;
    }
    | Array<{
        id: string;
        menu_id: string;
        menus:
        | {
            id: string;
            name: string;
        }
        | {
            id: string;
            name: string;
        }[]
        | null;
    }>;
};

type ApiResponse = {
    ok: boolean;
    rows?: ExternalMenuRow[];
    message?: string;
};

type SortKey =
    | "title_asc"
    | "title_desc"
    | "price_asc"
    | "price_desc"
    | "mapped_first"
    | "unmapped_first";

function getPriceValue(rawJson: unknown): number | null {
    if (!rawJson || typeof rawJson !== "object") return null;

    const obj = rawJson as Record<string, unknown>;
    const price =
        obj.price && typeof obj.price === "object"
            ? (obj.price as Record<string, unknown>)
            : null;

    const value = Number(price?.priceValue ?? null);
    return Number.isFinite(value) ? value : null;
}

function formatPrice(value: number | null) {
    if (value == null) return "-";
    return `${value.toLocaleString("ko-KR")}원`;
}

function extractMappedMenuNames(row: ExternalMenuRow): string[] {
    const maps = Array.isArray(row.menu_external_item_maps)
        ? row.menu_external_item_maps
        : row.menu_external_item_maps
            ? [row.menu_external_item_maps]
            : [];

    return maps.flatMap((mapRow) => {
        const menus = mapRow.menus;

        if (!menus) return [];
        if (Array.isArray(menus)) {
            return menus.map((menu) => menu.name).filter(Boolean);
        }

        return menus.name ? [menus.name] : [];
    });
}

export function ExternalMenusClient({ stores }: { stores: StoreRow[] }) {
    const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
    const [rows, setRows] = useState<ExternalMenuRow[]>([]);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showMappedOnly, setShowMappedOnly] = useState(false);
    const [showUnmappedOnly, setShowUnmappedOnly] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>("title_asc");

    const loadRows = async (nextStoreId: string) => {
        if (!nextStoreId) return;

        try {
            setLoading(true);

            const res = await fetch(
                `/api/external-menus/list?storeId=${encodeURIComponent(nextStoreId)}`
            );
            const json = (await res.json()) as ApiResponse;

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "외부 메뉴 조회 실패");
            }

            setRows(json.rows ?? []);
        } catch (error) {
            alert(error instanceof Error ? error.message : "외부 메뉴 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRows(storeId);
    }, [storeId]);

    const filteredRows = useMemo(() => {
        const q = keyword.trim().toLowerCase();

        let next = rows.filter((row) => {
            const priceValue = getPriceValue(row.raw_json);
            const mappedMenuNames = extractMappedMenuNames(row).join(" ").toLowerCase();
            const isMapped = extractMappedMenuNames(row).length > 0;

            if (showMappedOnly && !isMapped) return false;
            if (showUnmappedOnly && isMapped) return false;

            if (!q) return true;

            return (
                row.title.toLowerCase().includes(q) ||
                String(row.external_item_id).toLowerCase().includes(q) ||
                String(row.code ?? "").toLowerCase().includes(q) ||
                String(priceValue ?? "").includes(q) ||
                mappedMenuNames.includes(q)
            );
        });

        next.sort((a, b) => {
            const aPrice = getPriceValue(a.raw_json) ?? -1;
            const bPrice = getPriceValue(b.raw_json) ?? -1;
            const aMapped = extractMappedMenuNames(a).length > 0 ? 1 : 0;
            const bMapped = extractMappedMenuNames(b).length > 0 ? 1 : 0;

            switch (sortKey) {
                case "title_desc":
                    return b.title.localeCompare(a.title, "ko");
                case "price_asc":
                    return aPrice - bPrice;
                case "price_desc":
                    return bPrice - aPrice;
                case "mapped_first":
                    return bMapped - aMapped || a.title.localeCompare(b.title, "ko");
                case "unmapped_first":
                    return aMapped - bMapped || a.title.localeCompare(b.title, "ko");
                case "title_asc":
                default:
                    return a.title.localeCompare(b.title, "ko");
            }
        });

        return next;
    }, [rows, keyword, showMappedOnly, showUnmappedOnly, sortKey]);

    const summary = useMemo(() => {
        const mappedCount = rows.filter(
            (row) => extractMappedMenuNames(row).length > 0
        ).length;

        return {
            total: rows.length,
            mapped: mappedCount,
            unmapped: rows.length - mappedCount,
        };
    }, [rows]);

    if (stores.length === 0) {
        return (
            <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
                먼저 매장을 생성해야 합니다.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border bg-card p-4">
                <div className="grid gap-3 lg:grid-cols-[220px_1fr_180px_auto]">
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

                    <Input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="외부 메뉴명 / 코드 / 외부 ID / 가격 / 연결 메뉴 검색"
                    />

                    <select
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value as SortKey)}
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                    >
                        <option value="title_asc">이름 오름차순</option>
                        <option value="title_desc">이름 내림차순</option>
                        <option value="price_asc">가격 낮은순</option>
                        <option value="price_desc">가격 높은순</option>
                        <option value="mapped_first">연동 우선</option>
                        <option value="unmapped_first">미연동 우선</option>
                    </select>

                    <Button variant="outline" onClick={() => loadRows(storeId)} disabled={loading}>
                        {loading ? "조회 중..." : "새로고침"}
                    </Button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={showMappedOnly}
                            onChange={(e) => {
                                setShowMappedOnly(e.target.checked);
                                if (e.target.checked) setShowUnmappedOnly(false);
                            }}
                        />
                        연동된 메뉴만
                    </label>

                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={showUnmappedOnly}
                            onChange={(e) => {
                                setShowUnmappedOnly(e.target.checked);
                                if (e.target.checked) setShowMappedOnly(false);
                            }}
                        />
                        미연동 메뉴만
                    </label>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">전체 외부 메뉴</div>
                        <div className="mt-2 text-2xl font-semibold">{summary.total}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">연동됨</div>
                        <div className="mt-2 text-2xl font-semibold">{summary.mapped}</div>
                    </div>
                    <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">미연동</div>
                        <div className="mt-2 text-2xl font-semibold">{summary.unmapped}</div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card">
                <div className="border-b p-4 font-semibold">
                    외부 메뉴 목록 ({filteredRows.length})
                </div>

                {loading ? (
                    <div className="p-6 text-sm text-muted-foreground">불러오는 중...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr className="border-b">
                                    <th className="px-4 py-3 text-left">메뉴명</th>
                                    <th className="px-4 py-3 text-left">가격</th>
                                    <th className="px-4 py-3 text-left">연동 상태</th>
                                    <th className="px-4 py-3 text-left">연동된 내 메뉴</th>
                                    <th className="px-4 py-3 text-left">외부 ID</th>
                                    <th className="px-4 py-3 text-left">코드</th>
                                    <th className="px-4 py-3 text-left">동기화 시각</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.map((row) => {
                                    const mappedMenuNames = extractMappedMenuNames(row);
                                    const isMapped = mappedMenuNames.length > 0;

                                    return (
                                        <tr key={row.id} className="border-b">
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{row.title}</div>
                                                {row.description ? (
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        {row.description}
                                                    </div>
                                                ) : null}
                                            </td>

                                            <td className="px-4 py-3 text-muted-foreground">
                                                {formatPrice(getPriceValue(row.raw_json))}
                                            </td>

                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${isMapped
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-amber-100 text-amber-700"
                                                        }`}
                                                >
                                                    {isMapped ? "연동됨" : "미연동"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-muted-foreground">
                                                {isMapped ? mappedMenuNames.join(", ") : "-"}
                                            </td>

                                            <td className="px-4 py-3 text-muted-foreground">
                                                {row.external_item_id}
                                            </td>

                                            <td className="px-4 py-3 text-muted-foreground">
                                                {row.code ?? "-"}
                                            </td>

                                            <td className="px-4 py-3 text-muted-foreground">
                                                {row.synced_at
                                                    ? new Date(row.synced_at).toLocaleString("ko-KR")
                                                    : "-"}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredRows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-6 text-center text-muted-foreground"
                                        >
                                            표시할 외부 메뉴가 없습니다.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
