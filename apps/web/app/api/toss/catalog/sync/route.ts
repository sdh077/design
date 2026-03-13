import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TossClient } from "@/lib/toss-client";

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

        let page = 1;
        const size = 100;
        let syncedCount = 0;

        while (true) {
            const items = await client.getCatalogItems(page, size);
            if (items.length === 0) break;

            for (const item of items) {
                const payload = {
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
                };

                const { error } = await supabase
                    .from("external_catalog_items")
                    .upsert(payload, {
                        onConflict: "store_id,provider,external_item_id",
                    });

                if (error) {
                    throw new Error(error.message);
                }

                syncedCount += 1;
            }

            if (items.length < size) break;
            page += 1;
        }

        const { error: updateError } = await supabase
            .from("pos_connections")
            .update({
                last_catalog_sync_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("id", connection.id);

        if (updateError) {
            throw new Error(updateError.message);
        }

        return NextResponse.json({
            ok: true,
            syncedCount,
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