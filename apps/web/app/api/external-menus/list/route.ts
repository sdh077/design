import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

        const { data, error } = await supabase
            .from("external_catalog_items")
            .select(`
        id,
        store_id,
        provider,
        external_item_id,
        title,
        code,
        description,
        image_url,
        raw_json,
        synced_at,
        menu_external_item_maps (
          id,
          menu_id,
          menus (
            id,
            name
          )
        )
      `)
            .eq("store_id", storeId)
            .order("title", { ascending: true });

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            ok: true,
            rows: data ?? [],
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "외부 메뉴 조회 실패",
            },
            { status: 500 }
        );
    }
}