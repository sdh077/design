import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type TossOrderItem = {
    itemId?: string;
    title: string;
    quantity: number;
    options?: unknown;
};

type TossOrder = {
    orderId: string;
    orderState: string;
    orderedAt: string;
    completedAt?: string | null;
    cancelledAt?: string | null;
    totalAmount?: number | null;
    lineItems?: TossOrderItem[];
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const storeId = String(body.storeId ?? "");

        if (!storeId) {
            return NextResponse.json(
                { ok: false, message: "storeId is required" },
                { status: 400 }
            );
        }

        const supabase = await createClient();
        const admin = createAdminClient();

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { ok: false, message: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        const { data: merchantAccount, error: accountError } = await admin
            .from("merchant_accounts")
            .select("merchant_id")
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (accountError || !merchantAccount?.merchant_id) {
            return NextResponse.json(
                { ok: false, message: "가맹점 계정 정보가 없습니다." },
                { status: 403 }
            );
        }

        const { data: store, error: storeError } = await admin
            .from("stores")
            .select("id, merchant_id")
            .eq("id", storeId)
            .maybeSingle();

        if (storeError || !store) {
            return NextResponse.json(
                { ok: false, message: "매장을 찾을 수 없습니다." },
                { status: 404 }
            );
        }

        if (store.merchant_id !== merchantAccount.merchant_id) {
            return NextResponse.json(
                { ok: false, message: "해당 매장에 접근할 수 없습니다." },
                { status: 403 }
            );
        }

        const { data: connection, error: connectionError } = await admin
            .from("pos_connections")
            .select("*")
            .eq("store_id", storeId)
            .eq("provider", "TOSS_PLACE")
            .maybeSingle();

        if (connectionError) {
            throw new Error(connectionError.message);
        }
        if (!connection) {
            return NextResponse.json(
                { ok: false, message: "POS 연결 정보가 없습니다." },
                { status: 404 }
            );
        }

        const response = await fetch(
            `https://open-api.tossplace.com/api-public/openapi/v1/merchants/${connection.merchant_id}/order/orders`,
            {
                headers: {
                    "x-access-key": connection.access_key,
                    "x-secret-key": connection.secret_key,
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            }
        );
        console.log(response)
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`토스 주문 조회 실패: ${text}`);
        }

        const result = await response.json();
        const orders: TossOrder[] = result.orders ?? result.data ?? [];

        for (const order of orders) {
            const { data: savedOrder, error: orderError } = await admin
                .from("external_orders")
                .upsert(
                    {
                        store_id: storeId,
                        provider: "TOSS_PLACE",
                        external_order_id: order.orderId,
                        order_state: order.orderState,
                        ordered_at: order.orderedAt,
                        completed_at: order.completedAt ?? null,
                        cancelled_at: order.cancelledAt ?? null,
                        total_amount: order.totalAmount ?? null,
                        raw_json: order,
                        synced_at: new Date().toISOString(),
                    },
                    {
                        onConflict: "store_id,provider,external_order_id",
                    }
                )
                .select("*")
                .single();

            if (orderError) {
                throw new Error(orderError.message);
            }

            await admin
                .from("external_order_items")
                .delete()
                .eq("external_order_row_id", savedOrder.id);

            for (const item of order.lineItems ?? []) {
                const { error: itemError } = await admin
                    .from("external_order_items")
                    .insert({
                        external_order_row_id: savedOrder.id,
                        external_item_id: item.itemId ?? null,
                        title: item.title,
                        quantity: item.quantity,
                        raw_options_json: item.options ?? null,
                    });

                if (itemError) {
                    throw new Error(itemError.message);
                }
            }
        }

        const { error: updateError } = await admin
            .from("pos_connections")
            .update({
                last_order_sync_at: new Date().toISOString(),
            })
            .eq("id", connection.id);

        if (updateError) {
            throw new Error(updateError.message);
        }

        return NextResponse.json({
            ok: true,
            count: orders.length,
        });
    } catch (error) {
        console.log('error', error)
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "unknown error",
            },
            { status: 500 }
        );
    }
}