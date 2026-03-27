import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getSignedQuantity(type: string, quantity: number) {
    if (type === "OUT" || type === "WASTE") {
        return -quantity;
    }
    return quantity;
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

        const { data: itemRows, error: itemError } = await supabase
            .from("inventory_items")
            .select("id, store_id, name, base_unit, safety_stock, is_active")
            .eq("store_id", storeId)
            .order("name", { ascending: true });

        if (itemError) {
            throw new Error(itemError.message);
        }

        const { data: txnRows, error: txnError } = await supabase
            .from("inventory_txns")
            .select("inventory_item_id, type, quantity")
            .eq("store_id", storeId);

        if (txnError) {
            throw new Error(txnError.message);
        }

        const stockMap = new Map<string, number>();

        for (const txn of txnRows ?? []) {
            const itemId = String(txn.inventory_item_id);
            const quantity = Number(txn.quantity ?? 0);
            const signed = getSignedQuantity(String(txn.type ?? ""), quantity);
            stockMap.set(itemId, (stockMap.get(itemId) ?? 0) + signed);
        }

        const rows = (itemRows ?? []).map((row) => ({
            id: String(row.id),
            store_id: String(row.store_id),
            name: String(row.name),
            base_unit: String(row.base_unit),
            safety_stock: Number(row.safety_stock ?? 0),
            is_active: Boolean(row.is_active),
            current_stock: stockMap.get(String(row.id)) ?? 0,
        }));

        return NextResponse.json({
            ok: true,
            rows,
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "재고 조회 실패",
            },
            { status: 500 }
        );
    }
}