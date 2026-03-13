import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const menuId = String(body.menuId ?? "");
        const name = String(body.name ?? "").trim();

        if (!menuId || !name) {
            return NextResponse.json(
                { ok: false, message: "menuId, name are required" },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data, error } = await supabase
            .from("recipes")
            .insert({
                menu_id: menuId,
                name,
                version: 1,
                is_active: true,
            })
            .select("*")
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return NextResponse.json({
            ok: true,
            recipe: data,
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