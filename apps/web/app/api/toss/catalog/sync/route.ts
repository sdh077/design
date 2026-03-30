import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type TossCatalogItemPriceType = "FIXED" | "VARIABLE" | "UNIT" | "UNDEFINED";

type TossCatalogItem = {
    id: string;
    merchantId: number;
    title: string;
    code?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    labels?: string[];
    price: {
        title: string;
        priceType: TossCatalogItemPriceType;
        priceUnit: number;
        priceValue: number;
        barcode?: string | null;
    };
    createdAt: string;
    updatedAt: string;
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

function parseCatalogItems(payload: unknown): TossCatalogItem[] {
    if (Array.isArray(payload)) {
        return payload as TossCatalogItem[];
    }

    if (payload && typeof payload === "object") {
        const obj = payload as Record<string, unknown>;

        // 혹시 공통 응답 래퍼가 있는 경우도 흡수
        if (obj.resultType === "SUCCESS" && Array.isArray(obj.success)) {
            return obj.success as TossCatalogItem[];
        }

        // 방어적으로 남겨둠
        if (Array.isArray(obj.items)) {
            return obj.items as TossCatalogItem[];
        }

        if (obj.success && typeof obj.success === "object") {
            const success = obj.success as Record<string, unknown>;
            if (Array.isArray(success.items)) {
                return success.items as TossCatalogItem[];
            }
            if (Array.isArray(success.data)) {
                return success.data as TossCatalogItem[];
            }
        }

        if (Array.isArray(obj.data)) {
            return obj.data as TossCatalogItem[];
        }
    }

    return [];
}

async function fetchTossCatalogPage(params: {
    merchantId: string | number;
    accessKey: string;
    secretKey: string;
    page: number;
    size: number;
}) {
    const url = new URL(
        `https://open-api.tossplace.com/api-public/openapi/v1/merchants/${params.merchantId}/catalog/items`
    );

    url.searchParams.set("page", String(params.page));
    url.searchParams.set("size", String(params.size));

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
            `토스 카탈로그 조회 실패(${response.status})${tossEventId ? ` [eventId=${tossEventId}]` : ""
            }: ${text}`
        );
    }

    const json = await response.json();
    const items = parseCatalogItems(json);

    return items;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const storeId = String(body.storeId ?? "").trim();

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
        const fetchedItems: TossCatalogItem[] = [];
        let page = 1;

        while (true) {
            const pageItems = await fetchTossCatalogPage({
                merchantId: connection.merchant_id,
                accessKey: connection.access_key,
                secretKey: connection.secret_key,
                page,
                size: pageSize,
            });

            if (!pageItems.length) {
                break;
            }

            fetchedItems.push(...pageItems);

            if (pageItems.length < pageSize) {
                break;
            }

            page += 1;
        }

        // 현재 내려온 상품 ID 목록
        const incomingExternalIds = new Set(
            fetchedItems.map((item) => String(item.id))
        );

        // 기존 카탈로그 조회
        const { data: existingItems, error: existingError } = await admin
            .from("external_catalog_items")
            .select("id, external_item_id")
            .eq("store_id", storeId)
            .eq("provider", "TOSS_PLACE");

        if (existingError) {
            throw new Error(existingError.message);
        }

        // upsert
        for (const item of fetchedItems) {
            const { error } = await admin.from("external_catalog_items").upsert(
                {
                    store_id: storeId,
                    provider: "TOSS_PLACE",
                    external_item_id: item.id,
                    title: item.title,
                    code: item.code ?? null,
                    description: item.description ?? null,
                    image_url: item.imageUrl ?? null,
                    raw_json: item,
                    synced_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: "store_id,provider,external_item_id",
                }
            );

            if (error) {
                throw new Error(error.message);
            }
        }

        // 토스에서 사라진 상품 정리
        const toDeleteIds =
            existingItems
                ?.filter(
                    (row) => !incomingExternalIds.has(String(row.external_item_id))
                )
                .map((row) => row.id) ?? [];

        if (toDeleteIds.length > 0) {
            // 먼저 이 상품에 연결된 메뉴 매핑 삭제
            const { error: deleteMapError } = await admin
                .from("menu_external_item_maps")
                .delete()
                .in("external_catalog_item_id", toDeleteIds);

            if (deleteMapError) {
                throw new Error(deleteMapError.message);
            }

            // 카탈로그 삭제
            const { error: deleteCatalogError } = await admin
                .from("external_catalog_items")
                .delete()
                .in("id", toDeleteIds);

            if (deleteCatalogError) {
                throw new Error(deleteCatalogError.message);
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
            count: fetchedItems.length,
            deletedCount: toDeleteIds.length,
            message: "카탈로그 동기화가 완료되었습니다.",
        });
    } catch (error) {
        console.error("[/api/toss/catalog/sync] error", error);

        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "unknown error",
            },
            { status: 500 }
        );
    }
}