import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const storeId = String(body.storeId ?? "");
        const menuId = String(body.menuId ?? "");

        if (!storeId || !menuId) {
            return NextResponse.json(
                { ok: false, message: "storeId, menuId required" },
                { status: 400 }
            );
        }

        const supabase = await createClient();
        const admin = createAdminClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { ok: false, message: "로그인이 필요합니다" },
                { status: 401 }
            );
        }

        const { data: account } = await admin
            .from("merchant_accounts")
            .select("merchant_id")
            .eq("auth_user_id", user.id)
            .maybeSingle();

        if (!account) {
            return NextResponse.json(
                { ok: false, message: "merchant account 없음" },
                { status: 403 }
            );
        }

        const { data: store } = await admin
            .from("stores")
            .select("id, merchant_id")
            .eq("id", storeId)
            .maybeSingle();

        if (!store || store.merchant_id !== account.merchant_id) {
            return NextResponse.json(
                { ok: false, message: "해당 매장 접근 불가" },
                { status: 403 }
            );
        }

        const { data, error } = await admin
            .from("recipes")
            .insert({
                store_id: storeId,
                menu_id: menuId,
            })
            .select("*")
            .single();

        if (error) throw new Error(error.message);

        return NextResponse.json({ ok: true, recipe: data });
    } catch (error) {
        return NextResponse.json(
            { ok: false, message: String(error) },
            { status: 500 }
        );
    }
}