import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const menuId = String(body.menuId ?? "");
        const externalCatalogItemId = String(body.externalCatalogItemId ?? "");

        if (!menuId || !externalCatalogItemId) {
            return NextResponse.json(
                { ok: false, message: "menuId, externalCatalogItemId are required" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("menu_external_item_maps")
            .upsert(
                {
                    menu_id: menuId,
                    external_catalog_item_id: externalCatalogItemId,
                },
                {
                    onConflict: "external_catalog_item_id",
                }
            )
            .select("*")
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            ok: true,
            mapping: data,
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