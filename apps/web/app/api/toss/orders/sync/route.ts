import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TossClient } from "@/lib/toss-client";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const storeId = String(body.storeId ?? "");
        const days = Number(body.days ?? 2);

        if (!storeId) {
            return NextResponse.json(
                { ok: false, message: "storeId is required" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data: connection, error: connectionError } = await supabase
            .from("pos_connections")
            .select("*")
            .eq("store_id", storeId)
            .eq("provider", "TOSS_PLACE")
            .eq("is_active", true)
            .single();

        if (connectionError || !connection) {
            return NextResponse.json(
                { ok: false, message: "POS connection not found" },
                { status: 404 }
            );
        }

        const client = new TossClient(
            process.env.TOSS_BASE_URL!,
            connection.access_key,
            connection.secret_key,
            connection.merchant_id
        );

        const to = new Date();
        const from = new Date();
        from.setDate(to.getDate() - days);

        let page = 1;
        const size = 100;
        let syncedCount = 0;

        while (true) {
            const orders = await client.getOrders({
                from: from.toISOString(),
                to: to.toISOString(),
                page,
                size,
            });

            if (orders.length === 0) break;

            for (const order of orders) {
                const orderPayload = {
                    store_id: storeId,
                    provider: "TOSS_PLACE",
                    external_order_id: order.id,
                    order_state: order.orderState,
                    ordered_at: order.createdAt,
                    completed_at: order.completedAt ?? null,
                    cancelled_at: order.cancelledAt ?? null,
                    total_amount: order.chargePrice?.totalAmount ?? null,
                    raw_json: order,
                    synced_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };

                const { data: savedOrder, error: orderError } = await supabase
                    .from("external_orders")
                    .upsert(orderPayload, {
                        onConflict: "store_id,provider,external_order_id",
                    })
                    .select("*")
                    .single();

                if (orderError || !savedOrder) {
                    throw new Error(orderError?.message ?? "failed to save order");
                }

                const { error: deleteError } = await supabase
                    .from("external_order_items")
                    .delete()
                    .eq("external_order_row_id", savedOrder.id);

                if (deleteError) {
                    throw new Error(deleteError.message);
                }

                if (order.lineItems.length > 0) {
                    const itemRows = order.lineItems.map((line) => ({
                        external_order_row_id: savedOrder.id,
                        external_item_id: line.item.id ?? null,
                        title: line.item.title,
                        quantity: line.quantity,
                        raw_options_json: line.optionChoices ?? [],
                    }));

                    const { error: itemsInsertError } = await supabase
                        .from("external_order_items")
                        .insert(itemRows);

                    if (itemsInsertError) {
                        throw new Error(itemsInsertError.message);
                    }
                }

                syncedCount += 1;
            }

            if (orders.length < size) break;
            page += 1;
        }

        const { error: updateError } = await supabase
            .from("pos_connections")
            .update({
                last_order_sync_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("id", connection.id);

        if (updateError) {
            throw new Error(updateError.message);
        }

        return NextResponse.json({
            ok: true,
            syncedCount,
            from: from.toISOString(),
            to: to.toISOString(),
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "unknown error",
            },
            { status: 500 }
        );
    }
}