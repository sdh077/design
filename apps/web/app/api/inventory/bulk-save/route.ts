import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendGoogleChatWebhook } from "@/lib/google-chat/send";

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
    if (type === "OUT" || type === "WASTE") return -quantity;
    return quantity;
}

async function getCurrentStockMap(
    supabase: ReturnType<typeof createAdminClient>,
    storeId: string
) {
    const { data, error } = await supabase
        .from("inventory_txns")
        .select("inventory_item_id, type, quantity")
        .eq("store_id", storeId);

    if (error) {
        throw new Error(error.message);
    }

    const map = new Map<string, number>();

    for (const row of data ?? []) {
        const itemId = String(row.inventory_item_id);
        const quantity = toNumber(row.quantity);
        const signed = getSignedQuantity(String(row.type ?? ""), quantity);
        map.set(itemId, (map.get(itemId) ?? 0) + signed);
    }

    return map;
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

        // 매장 정보
        const { data: store, error: storeError } = await supabase
            .from("stores")
            .select("id, name, google_chat_webhook_url")
            .eq("id", storeId)
            .single();

        if (storeError || !store) {
            throw new Error(storeError?.message ?? "매장을 찾을 수 없습니다.");
        }

        // 기존 재고 맵
        let stockMap = await getCurrentStockMap(supabase, storeId);

        // 신규 생성
        for (const item of creates) {
            const name = String(item.name ?? "").trim();
            const baseUnit = String(item.base_unit ?? "").trim();
            const safetyStock = toNumber(item.safety_stock);
            const currentStock = toNumber(item.current_stock);
            const isActive = Boolean(item.is_active);

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

            if (createError || !createdItem) {
                throw new Error(createError?.message ?? "재고 품목 생성 실패");
            }

            if (currentStock > 0) {
                const { error: txnError } = await supabase.from("inventory_txns").insert({
                    store_id: storeId,
                    inventory_item_id: createdItem.id,
                    type: "INITIAL",
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

        // 수정
        for (const item of updates) {
            const itemId = String(item.id ?? "").trim();
            const name = String(item.name ?? "").trim();
            const baseUnit = String(item.base_unit ?? "").trim();
            const safetyStock = toNumber(item.safety_stock);
            const targetCurrentStock = toNumber(item.current_stock);
            const isActive = Boolean(item.is_active);

            const prevStock = stockMap.get(itemId) ?? 0;
            const diff = targetCurrentStock - prevStock;

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

            if (diff !== 0) {
                // ⚠️ DB constraint 맞춰서 IN / OUT 사용
                const { error: txnError } = await supabase.from("inventory_txns").insert({
                    store_id: storeId,
                    inventory_item_id: itemId,
                    type: diff > 0 ? "IN" : "OUT",
                    quantity: Math.abs(diff),
                    unit: baseUnit,
                    note,
                    occurred_at: new Date().toISOString(),
                });

                if (txnError) {
                    throw new Error(txnError.message);
                }
            }
        }

        // 비활성
        for (const item of deactivates) {
            const id = String(item.id ?? "").trim();
            if (!id) continue;

            const { error } = await supabase
                .from("inventory_items")
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id)
                .eq("store_id", storeId);

            if (error) {
                throw new Error(error.message);
            }
        }

        // 최신 품목 / 재고 조회
        const { data: items, error: itemsError } = await supabase
            .from("inventory_items")
            .select("id, name, base_unit, safety_stock, is_active")
            .eq("store_id", storeId)
            .eq("is_active", true);

        if (itemsError) {
            throw new Error(itemsError.message);
        }

        stockMap = await getCurrentStockMap(supabase, storeId);

        const lowStockItems = (items ?? [])
            .map((item) => ({
                name: String(item.name),
                currentStock: stockMap.get(String(item.id)) ?? 0,
                safetyStock: toNumber(item.safety_stock),
                unit: String(item.base_unit),
            }))
            .filter((item) => item.currentStock < item.safetyStock);

        if (store.google_chat_webhook_url && lowStockItems.length > 0) {
            await sendGoogleChatWebhook({
                webhookUrl: store.google_chat_webhook_url,
                storeName: String(store.name),
                items: lowStockItems,
            });
        }

        return NextResponse.json({
            ok: true,
            message: "재고가 저장되었습니다.",
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "재고 저장 실패",
            },
            { status: 500 }
        );
    }
}