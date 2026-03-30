"use client";

import { useEffect, useState } from "react";
import { MenusEditor } from "@/components/menus/menus-editor";

type StoreOption = {
    id: string;
    name: string;
};

type MenuRow = {
    id: string;
    store_id: string;
    name: string;
    is_active: boolean;
    updated_at: string;
    has_recipe: boolean;
    has_external_mapping: boolean;
    external_mapping: {
        external_catalog_item_id: string | null;
        external_title: string | null;
        external_item_id: string | null;
        external_code: string | null;
    } | null;
};

type MenusListResponse = {
    ok: boolean;
    rows?: MenuRow[];
    message?: string;
};

export function MenusClient({ stores }: { stores: StoreOption[] }) {
    const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
    const [rows, setRows] = useState<MenuRow[]>([]);
    const [loading, setLoading] = useState(false);

    const loadMenus = async (nextStoreId: string) => {
        if (!nextStoreId) return;

        try {
            setLoading(true);

            const res = await fetch(`/api/menus/list?storeId=${nextStoreId}`);
            const json = (await res.json()) as MenusListResponse;

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "메뉴 조회 실패");
            }

            setRows(json.rows ?? []);
        } catch (error) {
            alert(error instanceof Error ? error.message : "메뉴 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMenus(storeId);
    }, [storeId]);

    if (stores.length === 0) {
        return (
            <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                먼저 매장을 생성해야 메뉴를 관리할 수 있습니다.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <label className="text-sm font-medium">지점 선택</label>
                <select
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm md:max-w-sm"
                >
                    {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                            {store.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
                    불러오는 중...
                </div>
            ) : (
                <MenusEditor
                    storeId={storeId}
                    storeName={stores.find((store) => store.id === storeId)?.name ?? ""}
                    initialRows={rows}
                    onRefresh={() => loadMenus(storeId)}
                />
            )}
        </div>
    );
}