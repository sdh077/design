import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const body = await req.json();

        const disabled = Boolean(body?.disabled);

        if (!id) {
            return NextResponse.json(
                { ok: false, message: "menu id가 필요합니다." },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data: menu, error: menuError } = await supabase
            .from("menus")
            .select("id, store_id")
            .eq("id", id)
            .maybeSingle();

        if (menuError) {
            throw new Error(menuError.message);
        }

        if (!menu) {
            return NextResponse.json(
                { ok: false, message: "메뉴를 찾을 수 없습니다." },
                { status: 404 }
            );
        }

        const { error: updateError } = await supabase
            .from("menus")
            .update({
                pos_mapping_disabled: disabled,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (updateError) {
            throw new Error(updateError.message);
        }

        if (disabled) {
            const { error: deleteMapError } = await supabase
                .from("menu_external_item_maps")
                .delete()
                .eq("menu_id", id);

            if (deleteMapError) {
                throw new Error(deleteMapError.message);
            }
        }

        return NextResponse.json({
            ok: true,
            disabled,
            message: disabled
                ? "POS 매핑 안 함으로 변경했습니다."
                : "POS 매핑 안 함을 해제했습니다.",
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "POS 매핑 안 함 상태 변경 실패",
            },
            { status: 500 }
        );
    }
}