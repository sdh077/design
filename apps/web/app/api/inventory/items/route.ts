import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function signedQuantity(type: string, quantity: number) {
    if (type === "IN") return quantity;
    if (type === "OUT") return -quantity;
    if (type === "ADJUST") return quantity;
    return 0;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const storeId = String(searchParams.get("storeId") ?? "").trim();

        if (!storeId) {
            return NextResponse.json(
                { ok: false, message: "storeId가 필요합니다." },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const [
            { data: items, error: itemsError },
            { data: txns, error: txnsError },
        ] = await Promise.all([
            supabase
                .from("inventory_items")
                .select("id, name, base_unit")
                .eq("store_id", storeId)
                .eq("is_active", true)
                .order("name", { ascending: true }),

            supabase
                .from("inventory_txns")
                .select("inventory_item_id, type, quantity")
                .eq("store_id", storeId),
        ]);
        console.log('%capps/web/app/api/inventory/items/route.ts:41 items, txns', 'color: #007acc;', items);
        if (itemsError) {
            throw new Error(itemsError.message);
        }

        if (txnsError) {
            throw new Error(txnsError.message);
        }

        const currentQuantityMap = new Map<string, number>();

        for (const item of items ?? []) {
            currentQuantityMap.set(String(item.id), 0);
        }

        for (const txn of txns ?? []) {
            const itemId = String(txn.inventory_item_id);
            const prev = currentQuantityMap.get(itemId) ?? 0;
            const next =
                prev + signedQuantity(String(txn.type), Number(txn.quantity ?? 0));

            currentQuantityMap.set(itemId, next);
        }

        const rows = (items ?? []).map((item) => ({
            id: item.id,
            name: item.name,
            base_unit: item.base_unit,
            current_quantity: currentQuantityMap.get(String(item.id)) ?? 0,
        }));

        return NextResponse.json({
            ok: true,
            rows,
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message:
                    error instanceof Error ? error.message : "재고 항목 조회 실패",
            },
            { status: 500 }
        );
    }
}