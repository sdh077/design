import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getAuthorizedStore(storeId: string, userId: string) {
    const admin = createAdminClient();

    const { data: merchantAccount, error: accountError } = await admin
        .from("merchant_accounts")
        .select("merchant_id")
        .eq("auth_user_id", userId)
        .maybeSingle();

    if (accountError || !merchantAccount?.merchant_id) {
        throw new Error("가맹점 계정 정보가 없습니다.");
    }

    const { data: store, error: storeError } = await admin
        .from("stores")
        .select("*")
        .eq("id", storeId)
        .maybeSingle();

    if (storeError || !store) {
        throw new Error("매장을 찾을 수 없습니다.");
    }

    if (store.merchant_id !== merchantAccount.merchant_id) {
        throw new Error("해당 매장에 접근할 수 없습니다.");
    }

    return { admin, store };
}

export async function PATCH(
    req: NextRequest,
    ctx: RouteContext<"/api/stores/[storeId]">
) {
    try {
        const { storeId } = await ctx.params;

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { ok: false, message: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, code, timezone, address, phone, status } = body as {
            name?: string;
            code?: string | null;
            timezone?: string;
            address?: string | null;
            phone?: string | null;
            status?: string | null;
        };

        if (!name || !timezone) {
            return NextResponse.json(
                { ok: false, message: "name, timezone은 필수입니다." },
                { status: 400 }
            );
        }

        const { admin } = await getAuthorizedStore(storeId, user.id);

        const { data, error } = await admin
            .from("stores")
            .update({
                name,
                code: code || null,
                timezone,
                address: address || null,
                phone: phone || null,
                status: status || "ACTIVE",
            })
            .eq("id", storeId)
            .select("*")
            .single();

        if (error) throw new Error(error.message);

        return NextResponse.json({ ok: true, store: data });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "매장 수정 실패",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _req: NextRequest,
    ctx: RouteContext<"/api/stores/[storeId]">
) {
    try {
        const { storeId } = await ctx.params;

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { ok: false, message: "로그인이 필요합니다." },
                { status: 401 }
            );
        }

        const { admin } = await getAuthorizedStore(storeId, user.id);

        const { error } = await admin.from("stores").delete().eq("id", storeId);

        if (error) throw new Error(error.message);

        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json(
            {
                ok: false,
                message: error instanceof Error ? error.message : "매장 삭제 실패",
            },
            { status: 500 }
        );
    }
}