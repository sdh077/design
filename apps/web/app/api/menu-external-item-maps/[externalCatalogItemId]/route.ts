import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Context = {
    params: Promise<{
        externalCatalogItemId: string;
    }>;
};

export async function DELETE(_: NextRequest, context: Context) {
    try {
        const { externalCatalogItemId } = await context.params;

        const supabase = createAdminClient();

        const { error } = await supabase
            .from("menu_external_item_maps")
            .delete()
            .eq("external_catalog_item_id", externalCatalogItemId);

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