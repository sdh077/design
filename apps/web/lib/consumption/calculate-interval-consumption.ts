import { createAdminClient } from "@/lib/supabase/admin";

type IntervalDailyRow = {
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

type IntervalMenuUsageRow = {
    menu_id: string;
    menu_name: string;
    inventory_item_id: string;
    inventory_item_name: string;
    unit: string;
    sold_quantity: number;
    current_recipe_quantity: number;
    expected_quantity: number;
};

function num(v: unknown) {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
}

export async function calculateIntervalConsumption(params: {
    storeId: string;
    fromSnapshotId: string;
    toSnapshotId: string;
}) {
    const { storeId, fromSnapshotId, toSnapshotId } = params;
    const supabase = createAdminClient();

    const { data: selectedSnapshots, error: selectedSnapshotsError } = await supabase
        .from("inventory_snapshots")
        .select("id, store_id, inventory_item_id, snapshot_at, quantity, unit")
        .in("id", [fromSnapshotId, toSnapshotId]);

    if (selectedSnapshotsError) {
        throw new Error(selectedSnapshotsError.message);
    }

    const fromSnapshotRows = (selectedSnapshots ?? []).filter(
        (row) => String(row.id) === fromSnapshotId
    );
    const toSnapshotRows = (selectedSnapshots ?? []).filter(
        (row) => String(row.id) === toSnapshotId
    );

    if (fromSnapshotRows.length === 0 || toSnapshotRows.length === 0) {
        throw new Error("시작/종료 스냅샷을 찾을 수 없습니다.");
    }

    const fromAt = String(fromSnapshotRows[0]?.snapshot_at);
    const toAt = String(toSnapshotRows[0]?.snapshot_at);

    if (new Date(fromAt).getTime() >= new Date(toAt).getTime()) {
        throw new Error("종료 스냅샷은 시작 스냅샷보다 뒤여야 합니다.");
    }

    const [
        inventoryItemsRes,
        inboundTxnsRes,
        menusRes,
        recipeLinesRes,
        mappingsRes,
        externalOrdersRes,
        externalOrderItemsRes,
    ] = await Promise.all([
        supabase
            .from("inventory_items")
            .select("id, name, base_unit")
            .eq("store_id", storeId)
            .eq("is_active", true),

        supabase
            .from("inventory_txns")
            .select("inventory_item_id, quantity, unit, type, occurred_at")
            .eq("store_id", storeId)
            .eq("type", "IN")
            .gt("occurred_at", fromAt)
            .lte("occurred_at", toAt),

        supabase
            .from("menus")
            .select("id, name")
            .eq("store_id", storeId),

        supabase
            .from("recipe_lines")
            .select(`
        id,
        inventory_item_id,
        quantity,
        unit,
        recipes!inner(
          id,
          menu_id
        )
      `),

        supabase
            .from("menu_external_item_maps")
            .select(`
        menu_id,
        external_catalog_item_id,
        external_catalog_items!inner(
          id,
          external_item_id,
          store_id
        )
      `),

        supabase
            .from("external_orders")
            .select("id, external_order_id, ordered_at, order_state")
            .eq("store_id", storeId)
            .gt("ordered_at", fromAt)
            .lte("ordered_at", toAt)
            .in("order_state", ["COMPLETED"]),

        supabase
            .from("external_order_items")
            .select("external_order_row_id, external_item_id, title, quantity"),
    ]);

    const errors = [
        inventoryItemsRes.error,
        inboundTxnsRes.error,
        menusRes.error,
        recipeLinesRes.error,
        mappingsRes.error,
        externalOrdersRes.error,
        externalOrderItemsRes.error,
    ].filter(Boolean);

    if (errors.length > 0) {
        throw new Error(errors[0]?.message ?? "구간 분석 중 오류가 발생했습니다.");
    }

    const inventoryItems = inventoryItemsRes.data ?? [];
    const inboundTxns = inboundTxnsRes.data ?? [];
    const menus = menusRes.data ?? [];
    const recipeLines = recipeLinesRes.data ?? [];
    const mappings = mappingsRes.data ?? [];
    const externalOrders = externalOrdersRes.data ?? [];
    const externalOrderItems = externalOrderItemsRes.data ?? [];

    const inventoryMap = new Map(
        inventoryItems.map((item) => [
            String(item.id),
            {
                id: String(item.id),
                name: String(item.name),
                unit: String(item.base_unit),
            },
        ])
    );

    const menuMap = new Map(
        menus.map((menu) => [
            String(menu.id),
            {
                id: String(menu.id),
                name: String(menu.name),
            },
        ])
    );

    const openingMap = new Map<string, number>();
    for (const row of fromSnapshotRows) {
        openingMap.set(String(row.inventory_item_id), num(row.quantity));
    }

    const closingMap = new Map<string, number>();
    for (const row of toSnapshotRows) {
        closingMap.set(String(row.inventory_item_id), num(row.quantity));
    }

    const inboundMap = new Map<string, number>();
    for (const row of inboundTxns) {
        const key = String(row.inventory_item_id);
        inboundMap.set(key, num(inboundMap.get(key)) + num(row.quantity));
    }

    const externalItemToMenuMap = new Map<string, string>();
    for (const row of mappings as any[]) {
        const externalItemId = row?.external_catalog_items?.external_item_id;
        const menuId = row?.menu_id;

        if (!externalItemId || !menuId) continue;
        externalItemToMenuMap.set(String(externalItemId), String(menuId));
    }

    const validOrderIds = new Set(externalOrders.map((order) => String(order.id)));

    const menuSoldMap = new Map<string, number>();
    for (const item of externalOrderItems) {
        if (!validOrderIds.has(String(item.external_order_row_id))) continue;
        if (!item.external_item_id) continue;

        const menuId = externalItemToMenuMap.get(String(item.external_item_id));
        if (!menuId) continue;

        menuSoldMap.set(menuId, num(menuSoldMap.get(menuId)) + num(item.quantity));
    }

    const expectedMap = new Map<string, number>();
    const menuUsageRows: IntervalMenuUsageRow[] = [];

    for (const line of recipeLines as any[]) {
        const menuId = String(line.recipes?.menu_id ?? "");
        if (!menuId) continue;

        const soldQuantity = num(menuSoldMap.get(menuId));
        if (soldQuantity <= 0) continue;

        const inventoryItemId = String(line.inventory_item_id);
        const recipeQty = num(line.quantity);
        const expectedQty = soldQuantity * recipeQty;

        expectedMap.set(
            inventoryItemId,
            num(expectedMap.get(inventoryItemId)) + expectedQty
        );

        const menu = menuMap.get(menuId);
        const inventoryItem = inventoryMap.get(inventoryItemId);
        if (!menu || !inventoryItem) continue;

        menuUsageRows.push({
            menu_id: menuId,
            menu_name: menu.name,
            inventory_item_id: inventoryItemId,
            inventory_item_name: inventoryItem.name,
            unit: String(line.unit ?? inventoryItem.unit),
            sold_quantity: soldQuantity,
            current_recipe_quantity: recipeQty,
            expected_quantity: expectedQty,
        });
    }

    const dailyRows: IntervalDailyRow[] = inventoryItems.map((item) => {
        const inventoryItemId = String(item.id);
        const opening = num(openingMap.get(inventoryItemId));
        const inbound = num(inboundMap.get(inventoryItemId));
        const closing = num(closingMap.get(inventoryItemId));
        const expected = num(expectedMap.get(inventoryItemId));
        const actual = opening + inbound - closing;
        const gap = actual - expected;
        const gapRate = expected > 0 ? gap / expected : null;

        return {
            inventory_item_id: inventoryItemId,
            inventory_item_name: String(item.name),
            unit: String(item.base_unit),
            opening_quantity: opening,
            inbound_quantity: inbound,
            closing_quantity: closing,
            actual_quantity: actual,
            expected_quantity: expected,
            gap_quantity: gap,
            gap_rate: gapRate,
        };
    });

    return {
        from_snapshot_id: fromSnapshotId,
        to_snapshot_id: toSnapshotId,
        from_snapshot_at: fromAt,
        to_snapshot_at: toAt,
        dailyRows,
        menuUsageRows,
    };
}