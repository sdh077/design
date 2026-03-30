import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type TossOrderState =
    | "REQUESTED"
    | "OPENED"
    | "COMPLETED"
    | "CANCELLED"
    | "UNDEFINED";

type TossOrderOptionChoice = {
    title: string;
    code?: string;
    priceValue?: number;
    quantity?: number;
    option?: {
        title: string;
    };
};

type TossOrderLineItem = {
    diningOption?: "HERE" | "TOGO" | "DELIVERY" | "PICKUP" | "UNDEFINED";
    item: {
        title: string;
        code?: string;
        category?: {
            title: string;
            code?: string;
        };
    };
    itemPrice?: {
        title?: string;
        priceType?: "FIXED" | "VARIABLE" | "UNIT" | "UNDEFINED";
        priceUnit?: number;
        priceValue?: number;
        isTaxFree?: boolean;
        taxPercentage?: number;
        taxInclusive?: boolean;
    };
    optionChoices?: TossOrderOptionChoice[];
    appliedDiscounts?: unknown[];
    quantity: number;
};

type TossOrder = {
    id: string;
    merchantId: number;
    source?: string;
    orderState: TossOrderState;
    createdAt: string;
    updatedAt?: string;
    openedAt?: string | null;
    completedAt?: string | null;
    cancelledAt?: string | null;
    lineItems: TossOrderLineItem[];
    payments?: unknown[];
    discounts?: unknown[];
    chargePrice?: {
        listPrice?: number;
        discountAmount?: number;
        tipAmount?: number;
        serviceChargeAmount?: number;
        taxAmount?: number;
        supplyAmount?: number;
        taxExemptAmount?: number;
        totalAmount?: number;
    };
};

type TossSuccessResponse<T> = {
    resultType: "SUCCESS";
    success: T;
};

type TossFailResponse = {
    resultType: "FAIL";
    error?: {
        errorCode?: string;
        reason?: string;
        data?: unknown;
    };
};

const DEFAULT_SYNC_STATES: TossOrderState[] = [
    "REQUESTED",
    "OPENED",
    "COMPLETED",
    "CANCELLED",
];

function getOptionPayload(optionChoices: TossOrderOptionChoice[] | undefined) {
    if (!optionChoices?.length) return null;

    return optionChoices.map((choice) => ({
        title: choice.title,
        code: choice.code ?? null,
        priceValue: choice.priceValue ?? null,
        quantity: choice.quantity ?? null,
        optionTitle: choice.option?.title ?? null,
    }));
}

async function fetchTossOrdersPage(params: {
    merchantId: string | number;
    accessKey: string;
    secretKey: string;
    page: number;
    size: number;
    from?: string;
    to?: string;
    orderStates?: TossOrderState[];
    sources?: string[];
}) {
    const url = new URL(
        `https://open-api.tossplace.com/api-public/openapi/v1/merchants/${params.merchantId}/order/orders`
    );

    url.searchParams.set("page", String(params.page));
    url.searchParams.set("size", String(params.size));
    url.searchParams.set("sortOrder", "DESC");

    // if (params.from) url.searchParams.set("from", params.from);
    // if (params.to) url.searchParams.set("to", params.to);

    // for (const state of params.orderStates ?? []) {
    //     url.searchParams.append("orderStates", state);
    // }

    for (const source of params.sources ?? []) {
        url.searchParams.append("sources", source);
    }

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "x-access-key": params.accessKey,
            "x-secret-key": params.secretKey,
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    const tossEventId = response.headers.get("x-toss-event-id");

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `토스 주문 조회 실패(${response.status})${tossEventId ? ` [eventId=${tossEventId}]` : ""
            }: ${text}`
        );
    }

    const json = (await response.json()) as
        | TossSuccessResponse<TossOrder[]>
        | TossFailResponse;
    console.log(json, url)
    if (json.resultType !== "SUCCESS") {
        throw new Error(
            `토스 주문 조회 실패${tossEventId ? ` [eventId=${tossEventId}]` : ""
            }: ${json.error?.reason ?? "unknown error"}`
        );
    }

    return json.success ?? [];
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const storeId = String(body.storeId ?? "");
        const from = body.from ? String(body.from) : undefined;
        const to = body.to ? String(body.to) : undefined;
        const orderStates = Array.isArray(body.orderStates)
            ? (body.orderStates as TossOrderState[])
            : DEFAULT_SYNC_STATES;

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

        const pageSize = 100;
        const fetchedOrders: TossOrder[] = [];
        let page = 1;

        while (true) {
            const pageOrders = await fetchTossOrdersPage({
                merchantId: connection.merchant_id,
                accessKey: connection.access_key,
                secretKey: connection.secret_key,
                page,
                size: pageSize,
                from:
                    from ??
                    connection.last_order_sync_at ??
                    undefined,
                to,
                orderStates,
            });

            if (!pageOrders.length) break;

            fetchedOrders.push(...pageOrders);

            if (pageOrders.length < pageSize) break;
            page += 1;
        }

        for (const order of fetchedOrders) {
            const totalAmount = order.chargePrice?.totalAmount ?? null;

            const { data: savedOrder, error: orderError } = await admin
                .from("external_orders")
                .upsert(
                    {
                        store_id: storeId,
                        provider: "toss_pos",
                        external_order_id: order.id,
                        order_state: order.orderState,
                        ordered_at: order.createdAt,
                        completed_at: order.completedAt ?? null,
                        cancelled_at: order.cancelledAt ?? null,
                        total_amount: totalAmount,
                        raw_json: order,
                        synced_at: new Date().toISOString(),
                    },
                    { onConflict: "store_id,provider,external_order_id" }
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

            for (const lineItem of order.lineItems ?? []) {
                const { error: itemError } = await admin
                    .from("external_order_items")
                    .insert({
                        external_order_row_id: savedOrder.id,
                        external_item_id: lineItem.item?.code ?? null,
                        title: lineItem.item?.title ?? "이름 없는 상품",
                        quantity: lineItem.quantity ?? 1,
                        raw_options_json: getOptionPayload(lineItem.optionChoices),
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
            count: fetchedOrders.length,
            message: "주문 동기화가 완료되었습니다.",
        });
    } catch (error) {
        console.error("[/api/toss/orders/sync] error", error);

        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "unknown error",
            },
            { status: 500 }
        );
    }
}