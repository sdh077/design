import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
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

  const { data, error } = await supabase
    .from("place_tabs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ tabs: data ?? [] });
}

export async function POST(req: Request) {
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

  const { data, error } = await supabase
    .from("place_tabs")
    .insert({
      user_id: user.id,
      name: name.trim(),
      is_default: false,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { message: error?.message ?? "탭 생성 실패" },
      { status: 500 }
    );
  }

  return NextResponse.json({ tab: data });
}

