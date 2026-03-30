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

        // 메뉴 기준 기존 매핑 제거
        const { error: deleteError } = await supabase
            .from("menu_external_item_maps")
            .delete()
            .eq("menu_id", menuId);

        if (deleteError) {
            throw new Error(deleteError.message);
        }

        const { data, error } = await supabase
            .from("menu_external_item_maps")
            .insert({
                menu_id: menuId,
                external_catalog_item_id: externalCatalogItemId,
            })
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

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const menuId = String(searchParams.get("menuId") ?? "");

        if (!menuId) {
            return NextResponse.json(
                { ok: false, message: "menuId is required" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { error } = await supabase
            .from("menu_external_item_maps")
            .delete()
            .eq("menu_id", menuId);

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({ ok: true });
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