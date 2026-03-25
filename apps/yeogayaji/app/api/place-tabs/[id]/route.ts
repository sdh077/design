import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "로그인 필요" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const name = body?.name;

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      { message: "탭 이름은 문자열이어야 합니다." },
      { status: 400 }
    );
  }

  const { id } = await params;

  const { data: tab, error: tabError } = await supabase
    .from("place_tabs")
    .select("id,is_default")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (tabError) {
    return NextResponse.json(
      { message: tabError.message },
      { status: 500 }
    );
  }

  if (!tab) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (tab.is_default) {
    return NextResponse.json(
      { message: "기본탭은 이름을 변경할 수 없습니다." },
      { status: 400 }
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("place_tabs")
    .update({ name: name.trim() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { message: updateError?.message ?? "탭 이름 변경 실패" },
      { status: 500 }
    );
  }

  return NextResponse.json({ tab: updated });
}

