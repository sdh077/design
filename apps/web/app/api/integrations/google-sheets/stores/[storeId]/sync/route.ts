import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

type SyncBody = {
    sheetName: "orders" | "order_items";
    rowNumber?: number;
    editedAt?: string;
    rowData?: Record<string, unknown>;
};

function asTrimmedString(value: unknown): string {
    return String(value ?? "").trim();
}

function asNullableString(value: unknown): string | null {
    const s = asTrimmedString(value);
    return s ? s : null;
}

function asNullableInt(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;

    const normalized =
        typeof value === "string" ? value.replace(/,/g, "").trim() : value;

    const n = Number(normalized);
    if (Number.isNaN(n)) return null;

    return Math.trunc(n);
}

function asIsoOrNull(value: unknown): string | null {
    const s = asTrimmedString(value);
    if (!s) return null;

    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;

    return d.toISOString();
}

function asJsonOrNull(value: unknown): Record<string, unknown> | unknown[] | null {
    if (value === null || value === undefined || value === "") return null;

    if (typeof value === "object") return value as Record<string, unknown> | unknown[];

    if (typeof value === "string") {
        try {
            return JSON.parse(value) as Record<string, unknown> | unknown[];
        } catch {
            return { raw: value };
        }
    }

    return { raw: value };
}

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ storeId: string }> }
) {
    const { storeId } = await context.params;
    const supabase = createAdminClient();

    let body: SyncBody;

    try {
        body = (await req.json()) as SyncBody;
    } catch {
        return NextResponse.json(
            { ok: false, message: "잘못된 JSON 요청입니다." },
            { status: 400 }
        );
    }

    const { sheetName, rowData, editedAt } = body;

    if (!sheetName || !rowData) {
        return NextResponse.json(
            { ok: false, message: "sheetName 또는 rowData가 없습니다." },
            { status: 400 }
        );
    }

    const incomingSecret = req.headers.get("x-sync-secret");
    if (!incomingSecret) {
        return NextResponse.json(
            { ok: false, message: "x-sync-secret 헤더가 없습니다." },
            { status: 401 }
        );
    }

    const { data: connection, error: connectionError } = await supabase
        .schema("fm")
        .from("sheet_connections")
        .select("id, store_id, shared_secret, is_active")
        .eq("store_id", storeId)
        .eq("provider", "google_sheets")
        .single();

    if (connectionError || !connection) {
        return NextResponse.json(
            { ok: false, message: "시트 연결 정보를 찾을 수 없습니다." },
            { status: 404 }
        );
    }

    if (!connection.is_active) {
        return NextResponse.json(
            { ok: false, message: "비활성화된 시트 연결입니다." },
            { status: 403 }
        );
    }

    if (incomingSecret !== connection.shared_secret) {
        return NextResponse.json(
            { ok: false, message: "시크릿이 일치하지 않습니다." },
            { status: 401 }
        );
    }

    try {
        if (sheetName === "orders") {
            const externalOrderId = asTrimmedString(rowData.external_order_id);
            const orderState = asTrimmedString(rowData.order_state);
            const orderedAt = asIsoOrNull(rowData.ordered_at);

            if (!externalOrderId || !orderState || !orderedAt) {
                return NextResponse.json(
                    { ok: false, message: "orders 필수값이 누락되었습니다." },
                    { status: 400 }
                );
            }

            const orderPayload = {
                store_id: storeId,
                provider: "google_sheets",
                external_order_id: externalOrderId,
                order_state: orderState,
                ordered_at: orderedAt,
                completed_at: asIsoOrNull(rowData.completed_at),
                cancelled_at: asIsoOrNull(rowData.cancelled_at),
                total_amount: asNullableInt(rowData.total_amount),
                raw_json: rowData,
                synced_at: editedAt ? new Date(editedAt).toISOString() : new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .schema("fm")
                .from("external_orders")
                .upsert(orderPayload, {
                    onConflict: "store_id,provider,external_order_id",
                    ignoreDuplicates: false,
                });

            if (error) {
                throw error;
            }

            await supabase
                .schema("fm")
                .from("sheet_connections")
                .update({
                    last_synced_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", connection.id);

            return NextResponse.json({ ok: true, type: "orders" });
        }

        if (sheetName === "order_items") {
            const externalOrderId = asTrimmedString(rowData.external_order_id);
            const externalLineNo = asNullableInt(rowData.line_no);
            const title = asTrimmedString(rowData.title);
            const quantity = asNullableInt(rowData.quantity);

            if (!externalOrderId || externalLineNo === null || !title || quantity === null) {
                return NextResponse.json(
                    { ok: false, message: "order_items 필수값이 누락되었습니다." },
                    { status: 400 }
                );
            }

            const { data: orderRow, error: orderLookupError } = await supabase
                .schema("fm")
                .from("external_orders")
                .select("id")
                .eq("store_id", storeId)
                .eq("provider", "google_sheets")
                .eq("external_order_id", externalOrderId)
                .single();

            if (orderLookupError || !orderRow) {
                return NextResponse.json(
                    {
                        ok: false,
                        message: "먼저 orders 시트의 해당 주문이 동기화되어야 합니다.",
                    },
                    { status: 400 }
                );
            }

            const itemPayload = {
                external_order_row_id: orderRow.id,
                external_item_id: asNullableString(rowData.external_item_id),
                title,
                quantity,
                raw_options_json: asJsonOrNull(rowData.raw_options_json),
                external_line_no: externalLineNo,
            };

            const { error } = await supabase
                .schema("fm")
                .from("external_order_items")
                .upsert(itemPayload, {
                    onConflict: "external_order_row_id,external_line_no",
                    ignoreDuplicates: false,
                });

            if (error) {
                throw error;
            }

            await supabase
                .schema("fm")
                .from("sheet_connections")
                .update({
                    last_synced_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", connection.id);

            return NextResponse.json({ ok: true, type: "order_items" });
        }

        return NextResponse.json(
            { ok: false, message: "지원하지 않는 sheetName입니다." },
            { status: 400 }
        );
    } catch (error) {
        console.error("[google-sheets-sync]", error);

        return NextResponse.json(
            { ok: false, message: "동기화 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}