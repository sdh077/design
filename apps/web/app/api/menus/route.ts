import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const storeId = String(body.storeId ?? "");
    const name = String(body.name ?? "").trim();
    const isActive = Boolean(body.isActive ?? true);

    if (!storeId || !name) {
      return NextResponse.json(
        { ok: false, message: "storeId, name are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { ok: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { data: merchantAccount, error: accountError } = await admin
      .from("merchant_accounts")
      .select("merchant_id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (accountError || !merchantAccount?.merchant_id) {
      return NextResponse.json(
        { ok: false, message: "가맹점 계정 정보가 없습니다." },
        { status: 403 }
      );
    }

    const { data: store, error: storeError } = await admin
      .from("stores")
      .select("id, merchant_id")
      .eq("id", storeId)
      .maybeSingle();

    if (storeError || !store) {
      return NextResponse.json(
        { ok: false, message: "매장을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (store.merchant_id !== merchantAccount.merchant_id) {
      return NextResponse.json(
        { ok: false, message: "해당 매장에 접근할 수 없습니다." },
        { status: 403 }
      );
    }

    const { data, error } = await admin
      .from("menus")
      .insert({
        store_id: storeId,
        name,
        is_active: isActive,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true, menu: data });
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