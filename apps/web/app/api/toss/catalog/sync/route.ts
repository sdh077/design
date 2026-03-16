import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type TossCatalogItem = {
    itemId: string;
    title: string;
    code?: string;
    description?: string;
    imageUrl?: string;
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
            .eq("provider", "TOSS")
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
            `https://api.tossplace.com/api-public/openapi/v1/merchants/${connection.merchant_id}/catalog/items`,
            {
                headers: {
                    Authorization: `Bearer ${connection.access_key}`,
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`토스 카탈로그 조회 실패: ${text}`);
        }

        const result = await response.json();
        const items: TossCatalogItem[] = result.items ?? result.data ?? [];

        for (const item of items) {
            const { error } = await admin.from("external_catalog_items").upsert(
                {
                    store_id: storeId,
                    provider: "TOSS",
                    external_item_id: item.itemId,
                    title: item.title,
                    code: item.code ?? null,
                    description: item.description ?? null,
                    image_url: item.imageUrl ?? null,
                    raw_json: item,
                    synced_at: new Date().toISOString(),
                },
                {
                    onConflict: "store_id,provider,external_item_id",
                }
            );

            if (error) {
                throw new Error(error.message);
            }
        }

        const { error: updateError } = await admin
            .from("pos_connections")
            .update({
                last_catalog_sync_at: new Date().toISOString(),
            })
            .eq("id", connection.id);

        if (updateError) {
            throw new Error(updateError.message);
        }

        return NextResponse.json({
            ok: true,
            count: items.length,
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