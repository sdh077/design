"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "@workspace/ui";

type CatalogRow = {
    id: string;
    store_id: string;
    provider: string;
    external_item_id: string;
    title: string;
    code: string | null;
    description: string | null;
    image_url: string | null;
    synced_at: string;
};

type Props = {
    open: boolean;
    onClose: () => void;
    storeId: string;
    menuId: string;
    menuName: string;
    currentMappingTitle?: string | null;
    onMapped: () => void;
};

export function MenuMappingDialog({
    open,
    onClose,
    storeId,
    menuId,
    menuName,
    currentMappingTitle,
    onMapped,
}: Props) {
    const [rows, setRows] = useState<CatalogRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        if (!open) return;

        const run = async () => {
            try {
                setLoading(true);
                const qs = new URLSearchParams({ storeId });
                if (keyword.trim()) qs.set("keyword", keyword.trim());

                const res = await fetch(`/api/external-catalog-items/list?${qs.toString()}`);
                const json = await res.json();

                if (!res.ok || !json.ok) {
                    throw new Error(json.message ?? "카탈로그 조회 실패");
                }

                setRows(json.rows ?? []);
            } catch (error) {
                alert(error instanceof Error ? error.message : "카탈로그 조회 실패");
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [open, storeId, keyword]);

    const handleMap = async (externalCatalogItemId: string) => {
        try {
            setSavingId(externalCatalogItemId);

            const res = await fetch("/api/menu-external-item-maps", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    menuId,
                    externalCatalogItemId,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "매핑 저장 실패");
            }

            onMapped();
            onClose();
        } catch (error) {
            alert(error instanceof Error ? error.message : "매핑 저장 실패");
        } finally {
            setSavingId(null);
        }
    };

    const handleUnmap = async () => {
        try {
            const res = await fetch(`/api/menu-external-item-maps?menuId=${menuId}`, {
                method: "DELETE",
            });

            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "매핑 해제 실패");
            }

            onMapped();
            onClose();
        } catch (error) {
            alert(error instanceof Error ? error.message : "매핑 해제 실패");
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-background shadow-xl">
                <div className="flex items-start justify-between border-b p-5">
                    <div>
                        <h2 className="text-lg font-semibold">POS 메뉴 연동</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            내 메뉴 <span className="font-medium text-foreground">{menuName}</span> 에 연결할
                            POS 상품을 선택하세요.
                        </p>
                        {currentMappingTitle ? (
                            <p className="mt-2 text-sm text-blue-600">
                                현재 연결됨: {currentMappingTitle}
                            </p>
                        ) : null}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted"
                    >
                        닫기
                    </button>
                </div>

                <div className="p-5">
                    <div className="mb-4 flex gap-2">
                        <Input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="POS 상품명 검색"
                        />
                        {currentMappingTitle ? (
                            <Button variant="outline" onClick={handleUnmap}>
                                연결 해제
                            </Button>
                        ) : null}
                    </div>

                    <div className="max-h-[420px] overflow-y-auto rounded-lg border">
                        {loading ? (
                            <div className="p-6 text-sm text-muted-foreground">불러오는 중...</div>
                        ) : rows.length === 0 ? (
                            <div className="p-6 text-sm text-muted-foreground">
                                불러온 POS 상품이 없습니다.
                            </div>
                        ) : (
                            <table className="min-w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-left font-medium">상품명</th>
                                        <th className="px-4 py-3 text-left font-medium">외부 ID</th>
                                        <th className="px-4 py-3 text-left font-medium">코드</th>
                                        <th className="px-4 py-3 text-left font-medium">액션</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr key={row.id} className="border-b">
                                            <td className="px-4 py-3">{row.title}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {row.external_item_id}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {row.code ?? "-"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleMap(row.id)}
                                                    disabled={savingId === row.id}
                                                >
                                                    {savingId === row.id ? "연결 중..." : "선택"}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}