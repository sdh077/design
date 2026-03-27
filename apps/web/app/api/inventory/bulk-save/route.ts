import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type CreatePayload = {
    name: string;
    base_unit: string;
    safety_stock: number;
    current_stock: number;
    is_active: boolean;
};

type UpdatePayload = {
    id: string;
    name: string;
    base_unit: string;
    safety_stock: number;
    current_stock: number;
    is_active: boolean;
};

type DeactivatePayload = {
    id: string;
};

function toNumber(value: unknown) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function getSignedQuantity(type: string, quantity: number) {
    if (type === "OUT" || type === "WASTE") {
        return -quantity;
    }
    return quantity;
}

async function getCurrentStock(
    supabase: ReturnType<typeof createAdminClient>,
    storeId: string,
    itemId: string
) {
    const { data, error } = await supabase
        .from("inventory_txns")
        .select("type, quantity")
        .eq("store_id", storeId)
        .eq("inventory_item_id", itemId);

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []).reduce((sum, row) => {
        const type = String(row.type ?? "");
        const quantity = toNumber(row.quantity);
        return sum + getSignedQuantity(type, quantity);
    }, 0);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const storeId = String(body?.storeId ?? "").trim();
        const note = String(body?.note ?? "실사 반영").trim();
        const creates = (body?.creates ?? []) as CreatePayload[];
        const updates = (body?.updates ?? []) as UpdatePayload[];
        const deactivates = (body?.deactivates ?? []) as DeactivatePayload[];

        if (!storeId) {
            return NextResponse.json(
                { ok: false, message: "storeId가 필요합니다." },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        for (const item of creates) {
            const name = String(item.name ?? "").trim();
            const baseUnit = String(item.base_unit ?? "").trim();
            const safetyStock = toNumber(item.safety_stock);
            const currentStock = toNumber(item.current_stock);
            const isActive = Boolean(item.is_active);

            if (!name || !baseUnit) {
                return NextResponse.json(
                    { ok: false, message: "신규 품목은 품목명과 단위가 필수입니다." },
                    { status: 400 }
                );
            }

            const { data: createdItem, error: createError } = await supabase
                .from("inventory_items")
                .insert({
                    store_id: storeId,
                    name,
                    base_unit: baseUnit,
                    safety_stock: safetyStock,
                    is_active: isActive,
                })
                .select("id, base_unit")
                .single();

            if (createError) {
                throw new Error(createError.message);
            }

            if (currentStock !== 0) {
                const { error: txnError } = await supabase.from("inventory_txns").insert({
                    store_id: storeId,
                    inventory_item_id: createdItem.id,
                    type: "IN",
                    quantity: currentStock,
                    unit: createdItem.base_unit,
                    note,
                    occurred_at: new Date().toISOString(),
                });

                if (txnError) {
                    throw new Error(txnError.message);
                }
            }
        }

        for (const item of updates) {
            const itemId = String(item.id ?? "").trim();
            const name = String(item.name ?? "").trim();
            const baseUnit = String(item.base_unit ?? "").trim();
            const safetyStock = toNumber(item.safety_stock);
            const targetCurrentStock = toNumber(item.current_stock);
            const isActive = Boolean(item.is_active);

            if (!itemId || !name || !baseUnit) {
                return NextResponse.json(
                    { ok: false, message: "수정 품목에 필수값이 누락되었습니다." },
                    { status: 400 }
                );
            }

            const { data: existingItem, error: existingItemError } = await supabase
                .from("inventory_items")
                .select("id, store_id")
                .eq("id", itemId)
                .eq("store_id", storeId)
                .single();

            if (existingItemError || !existingItem) {
                throw new Error(existingItemError?.message ?? "재고 품목을 찾을 수 없습니다.");
            }

            const currentStock = await getCurrentStock(supabase, storeId, itemId);
            const delta = targetCurrentStock - currentStock;

            const { error: updateError } = await supabase
                .from("inventory_items")
                .update({
                    name,
                    base_unit: baseUnit,
                    safety_stock: safetyStock,
                    is_active: isActive,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", itemId)
                .eq("store_id", storeId);

            if (updateError) {
                throw new Error(updateError.message);
            }

            if (delta !== 0) {
                const { error: txnError } = await supabase.from("inventory_txns").insert({
                    store_id: storeId,
                    inventory_item_id: itemId,
                    type: delta > 0 ? "IN" : "OUT",
                    quantity: Math.abs(delta),
                    unit: baseUnit,
                    note,
                    occurred_at: new Date().toISOString(),
                });

                if (txnError) {
                    throw new Error(txnError.message);
                }
            }
        }

        for (const item of deactivates) {
            const itemId = String(item.id ?? "").trim();
            if (!itemId) continue;

            const { error } = await supabase
                .from("inventory_items")
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", itemId)
                .eq("store_id", storeId);

            if (error) {
                throw new Error(error.message);
            }
        }

        return NextResponse.json({
            ok: true,
            message: "재고가 저장되었습니다.",
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "재고 저장 중 오류가 발생했습니다.",
            },
            { status: 500 }
        );
    }
}