"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@workspace/ui";
import { SyncButtons } from "@/components/pos/SyncButtons";

type StoreRow = {
    id: string;
    name: string;
};

type ExternalOrderRow = {
    id: string;
    store_id: string;
    provider: string;
    external_order_id: string;
    order_state: string;
    ordered_at: string;
    completed_at: string | null;
    cancelled_at: string | null;
    total_amount: number | null;
    raw_json: unknown;
    synced_at: string;
    created_at: string;
    updated_at: string;
};

type MenuListRow = {
    id: string;
    store_id: string;
    name: string;
    is_active: boolean;
    updated_at: string;
};

type MappingRow = {
    menu_id: string;
    external_catalog_item_id: string;
    external_catalog_items: {
        id: string;
        title: string;
        external_item_id: string;
        code: string | null;
    } | null;
};

type RecipeRow = {
    menu_id: string;
};

type MenuViewRow = {
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

function extractOrderItems(rawJson: unknown): Array<{
    title: string;
    quantity: number;
}> {
    if (!rawJson || typeof rawJson !== "object") return [];

    const obj = rawJson as Record<string, unknown>;
    const lineItems = obj.lineItems;

    if (!Array.isArray(lineItems)) return [];

    return lineItems
        .map((item) => {
            if (!item || typeof item !== "object") return null;
            const row = item as Record<string, unknown>;
            const itemObj =
                row.item && typeof row.item === "object"
                    ? (row.item as Record<string, unknown>)
                    : null;

            return {
                title: String(itemObj?.title ?? row.title ?? "이름 없음"),
                quantity: Number(row.quantity ?? 1),
            };
        })
        .filter(Boolean) as Array<{ title: string; quantity: number }>;
}

function badgeClass(type: "green" | "gray" | "amber" | "blue") {
    if (type === "green") return "bg-green-100 text-green-700";
    if (type === "gray") return "bg-gray-100 text-gray-600";
    if (type === "amber") return "bg-amber-100 text-amber-700";
    return "bg-blue-100 text-blue-700";
}

function Badge({
    children,
    type = "gray",
}: {
    children: React.ReactNode;
    type?: "green" | "gray" | "amber" | "blue";
}) {
    return (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${badgeClass(type)}`}>
            {children}
        </span>
    );
}

export function ExternalOrdersClient({
    stores,
    initialOrders,
    initialMenus,
    initialMappings,
    initialRecipes,
}: {
    stores: StoreRow[];
    initialOrders: ExternalOrderRow[];
    initialMenus: MenuListRow[];
    initialMappings: MappingRow[];
    initialRecipes: RecipeRow[];
}) {
    const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
    const [menuKeyword, setMenuKeyword] = useState("");
    const [orderKeyword, setOrderKeyword] = useState("");
    const [showUnmappedOnly, setShowUnmappedOnly] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    const storeNameById = useMemo(
        () => new Map(stores.map((store) => [String(store.id), String(store.name)])),
        [stores]
    );

    const menuRows = useMemo<MenuViewRow[]>(() => {
        const recipeSet = new Set(initialRecipes.map((row) => String(row.menu_id)));
        const mappingMap = new Map<
            string,
            {
                external_catalog_item_id: string | null;
                external_title: string | null;
                external_item_id: string | null;
                external_code: string | null;
            }
        >();

        for (const row of initialMappings) {
            mappingMap.set(String(row.menu_id), {
                external_catalog_item_id: row.external_catalog_item_id ?? null,
                external_title: row.external_catalog_items?.title ?? null,
                external_item_id: row.external_catalog_items?.external_item_id ?? null,
                external_code: row.external_catalog_items?.code ?? null,
            });
        }

        return initialMenus.map((menu) => {
            const mapping = mappingMap.get(String(menu.id)) ?? null;
            return {
                ...menu,
                has_recipe: recipeSet.has(String(menu.id)),
                has_external_mapping: Boolean(mapping),
                external_mapping: mapping,
            };
        });
    }, [initialMenus, initialMappings, initialRecipes]);

    const filteredMenus = useMemo(() => {
        const keyword = menuKeyword.trim().toLowerCase();

        return menuRows.filter((menu) => {
            if (storeId && menu.store_id !== storeId) return false;
            if (showUnmappedOnly && menu.has_external_mapping) return false;
            if (keyword && !menu.name.toLowerCase().includes(keyword)) return false;
            return true;
        });
    }, [menuRows, menuKeyword, storeId, showUnmappedOnly]);

    const filteredOrders = useMemo(() => {
        const keyword = orderKeyword.trim().toLowerCase();

        return initialOrders.filter((order) => {
            if (storeId && order.store_id !== storeId) return false;

            if (!keyword) return true;

            const items = extractOrderItems(order.raw_json);
            const joinedTitles = items.map((item) => item.title).join(" ").toLowerCase();

            return (
                String(order.external_order_id).toLowerCase().includes(keyword) ||
                String(order.order_state).toLowerCase().includes(keyword) ||
                joinedTitles.includes(keyword)
            );
        });
    }, [initialOrders, orderKeyword, storeId]);

    const selectedOrder =
        filteredOrders.find((order) => order.id === selectedOrderId) ?? filteredOrders[0] ?? null;

    const summary = useMemo(() => {
        const scopedOrders = initialOrders.filter((order) =>
            storeId ? order.store_id === storeId : true
        );
        const scopedMenus = menuRows.filter((menu) => (storeId ? menu.store_id === storeId : true));

        return {
            orderCount: scopedOrders.length,
            completedCount: scopedOrders.filter((order) => order.order_state === "COMPLETED").length,
            menuCount: scopedMenus.length,
            mappedMenuCount: scopedMenus.filter((menu) => menu.has_external_mapping).length,
        };
    }, [initialOrders, menuRows, storeId]);

    if (stores.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                    먼저 매장을 생성해야 외부 주문을 볼 수 있습니다.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>상단 액션</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 lg:grid-cols-[240px_1fr_auto]">
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

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-lg border p-3">
                                <div className="text-xs text-muted-foreground">주문 수</div>
                                <div className="mt-1 text-xl font-semibold">{summary.orderCount}</div>
                            </div>
                            <div className="rounded-lg border p-3">
                                <div className="text-xs text-muted-foreground">완료 주문</div>
                                <div className="mt-1 text-xl font-semibold">{summary.completedCount}</div>
                            </div>
                        </div>

                        <div className="flex items-start justify-end">
                            <SyncButtons storeId={storeId} />
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-lg border p-3">
                            <div className="text-xs text-muted-foreground">메뉴 수</div>
                            <div className="mt-1 text-xl font-semibold">{summary.menuCount}</div>
                        </div>
                        <div className="rounded-lg border p-3">
                            <div className="text-xs text-muted-foreground">연동된 메뉴</div>
                            <div className="mt-1 text-xl font-semibold">{summary.mappedMenuCount}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
                <Card className="min-h-[700px]">
                    <CardHeader>
                        <CardTitle>메뉴 리스트</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Input
                            value={menuKeyword}
                            onChange={(e) => setMenuKeyword(e.target.value)}
                            placeholder="메뉴명 검색"
                        />

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={showUnmappedOnly}
                                onChange={(e) => setShowUnmappedOnly(e.target.checked)}
                            />
                            미연동 메뉴만 보기
                        </label>

                        <div className="max-h-[560px] overflow-y-auto rounded-lg border">
                            {filteredMenus.length === 0 ? (
                                <div className="p-4 text-sm text-muted-foreground">표시할 메뉴가 없습니다.</div>
                            ) : (
                                <div className="divide-y">
                                    {filteredMenus.map((menu) => (
                                        <div key={menu.id} className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="font-medium">{menu.name}</div>
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        {storeNameById.get(String(menu.store_id)) ?? "-"}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {menu.has_recipe ? (
                                                        <Badge type="blue">레시피 있음</Badge>
                                                    ) : (
                                                        <Badge type="gray">레시피 없음</Badge>
                                                    )}

                                                    {menu.has_external_mapping ? (
                                                        <Badge type="green">POS 연동됨</Badge>
                                                    ) : (
                                                        <Badge type="amber">POS 미연동</Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {menu.external_mapping?.external_title ? (
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    연결된 POS 메뉴: {menu.external_mapping.external_title}
                                                </div>
                                            ) : (
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    아직 연결된 POS 메뉴가 없습니다.
                                                </div>
                                            )}

                                            <div className="mt-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        window.location.href = "/menus";
                                                    }}
                                                >
                                                    메뉴 연동하러 가기
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="min-h-[700px]">
                    <CardHeader>
                        <CardTitle>주문 리스트</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Input
                            value={orderKeyword}
                            onChange={(e) => setOrderKeyword(e.target.value)}
                            placeholder="주문번호 / 상태 / 상품명 검색"
                        />

                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                            <div className="max-h-[560px] overflow-y-auto rounded-lg border">
                                {filteredOrders.length === 0 ? (
                                    <div className="p-4 text-sm text-muted-foreground">표시할 주문이 없습니다.</div>
                                ) : (
                                    <div className="divide-y">
                                        {filteredOrders.map((order) => {
                                            const items = extractOrderItems(order.raw_json);

                                            return (
                                                <button
                                                    key={order.id}
                                                    type="button"
                                                    onClick={() => setSelectedOrderId(order.id)}
                                                    className={`block w-full p-4 text-left transition hover:bg-muted/40 ${selectedOrder?.id === order.id ? "bg-muted/50" : ""
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <div className="font-medium">
                                                                주문번호: {order.external_order_id}
                                                            </div>
                                                            <div className="mt-1 text-xs text-muted-foreground">
                                                                {storeNameById.get(String(order.store_id)) ?? "-"} ·{" "}
                                                                {new Date(order.ordered_at).toLocaleString("ko-KR")}
                                                            </div>
                                                        </div>

                                                        <Badge
                                                            type={
                                                                order.order_state === "COMPLETED"
                                                                    ? "green"
                                                                    : order.order_state === "CANCELLED"
                                                                        ? "gray"
                                                                        : "amber"
                                                            }
                                                        >
                                                            {order.order_state}
                                                        </Badge>
                                                    </div>

                                                    <div className="mt-2 text-sm text-muted-foreground">
                                                        {items.length > 0
                                                            ? items
                                                                .slice(0, 3)
                                                                .map((item) => `${item.title} x${item.quantity}`)
                                                                .join(", ")
                                                            : "주문 상품 정보 없음"}
                                                    </div>

                                                    <div className="mt-2 text-sm">
                                                        {order.total_amount != null
                                                            ? `${order.total_amount.toLocaleString("ko-KR")}원`
                                                            : "-"}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-lg border p-4">
                                <div className="text-sm font-semibold">주문 상세</div>

                                {!selectedOrder ? (
                                    <div className="mt-3 text-sm text-muted-foreground">
                                        주문을 선택하세요.
                                    </div>
                                ) : (
                                    <div className="mt-3 space-y-3">
                                        <div>
                                            <div className="text-xs text-muted-foreground">주문번호</div>
                                            <div className="font-medium">{selectedOrder.external_order_id}</div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-muted-foreground">상태</div>
                                            <div>{selectedOrder.order_state}</div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-muted-foreground">주문시각</div>
                                            <div>{new Date(selectedOrder.ordered_at).toLocaleString("ko-KR")}</div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-muted-foreground">총액</div>
                                            <div>
                                                {selectedOrder.total_amount != null
                                                    ? `${selectedOrder.total_amount.toLocaleString("ko-KR")}원`
                                                    : "-"}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-muted-foreground">주문 상품</div>
                                            <div className="mt-2 space-y-2">
                                                {extractOrderItems(selectedOrder.raw_json).length === 0 ? (
                                                    <div className="text-sm text-muted-foreground">
                                                        상품 정보가 없습니다.
                                                    </div>
                                                ) : (
                                                    extractOrderItems(selectedOrder.raw_json).map((item, index) => (
                                                        <div
                                                            key={`${item.title}-${index}`}
                                                            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                                                        >
                                                            <span>{item.title}</span>
                                                            <span className="text-muted-foreground">x{item.quantity}</span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}