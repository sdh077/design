import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type CreatePayload = {
    name: string;
    is_active: boolean;
    pos_mapping_disabled?: boolean;
};

type UpdatePayload = {
    id: string;
    name: string;
    is_active: boolean;
    pos_mapping_disabled?: boolean;
};

type DeactivatePayload = {
    id: string;
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const storeId = String(body?.storeId ?? "").trim();
        const creates = (body?.creates ?? []) as CreatePayload[];
        const updates = (body?.updates ?? []) as UpdatePayload[];
        const deactivates = (body?.deactivates ?? []) as DeactivatePayload[];

        if (!storeId) {
            return NextResponse.json(
                { ok: false, message: "storeId가 필요합니다." },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        for (const item of creates) {
            const name = String(item.name ?? "").trim();
            const isActive = Boolean(item.is_active);
            const posMappingDisabled = Boolean(item.pos_mapping_disabled ?? false);

            if (!name) {
                return NextResponse.json(
                    { ok: false, message: "신규 메뉴명은 필수입니다." },
                    { status: 400 }
                );
            }

            const { error } = await supabase.from("menus").insert({
                store_id: storeId,
                name,
                is_active: isActive,
                pos_mapping_disabled: posMappingDisabled,
            });

            if (error) {
                throw new Error(error.message);
            }
        }

        for (const item of updates) {
            const id = String(item.id ?? "").trim();
            const name = String(item.name ?? "").trim();
            const isActive = Boolean(item.is_active);
            const posMappingDisabled = Boolean(item.pos_mapping_disabled ?? false);

            if (!id || !name) {
                return NextResponse.json(
                    { ok: false, message: "수정 메뉴에 필수값이 누락되었습니다." },
                    { status: 400 }
                );
            }

            const { error } = await supabase
                .from("menus")
                .update({
                    name,
                    is_active: isActive,
                    pos_mapping_disabled: posMappingDisabled,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id)
                .eq("store_id", storeId);

            if (error) {
                throw new Error(error.message);
            }

            if (posMappingDisabled) {
                const { error: deleteMapError } = await supabase
                    .from("menu_external_item_maps")
                    .delete()
                    .eq("menu_id", id);

                if (deleteMapError) {
                    throw new Error(deleteMapError.message);
                }
            }
        }

        for (const item of deactivates) {
            const id = String(item.id ?? "").trim();
            if (!id) continue;

            const { error } = await supabase
                .from("menus")
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", id)
                .eq("store_id", storeId);

            if (error) {
                throw new Error(error.message);
            }
        }

        return NextResponse.json({
            ok: true,
            message: "메뉴가 저장되었습니다.",
        });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "메뉴 저장 실패",
            },
            { status: 500 }
        );
    }
}