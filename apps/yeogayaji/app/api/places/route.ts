import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  extractNaverMeCode,
  normalizeNaverMeLink,
} from "@/lib/naver";

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
    .from("places")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ places: data ?? [] });
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
  const naver_map_link_raw = body?.naver_map_link;
  const tab_id = body?.tab_id;
  const place_name = body?.place_name;
  if (typeof naver_map_link_raw !== "string") {
    return NextResponse.json(
      { message: "`naver_map_link` 문자열을 보내주세요." },
      { status: 400 }
    );
  }

  if (typeof tab_id !== "string") {
    return NextResponse.json(
      { message: "`tab_id`를 보내주세요." },
      { status: 400 }
    );
  }

  if (
    !(
      place_name === null ||
      typeof place_name === "string" ||
      typeof place_name === "undefined"
    )
  ) {
    return NextResponse.json(
      { message: "`place_name`은 문자열 또는 null이어야 합니다." },
      { status: 400 }
    );
  }

  const normalized = normalizeNaverMeLink(naver_map_link_raw);
  const code = normalized ? extractNaverMeCode(normalized) : null;

  if (!normalized || !code) {
    return NextResponse.json(
      { message: "유효한 네이버 지도 링크가 아닙니다." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("places")
    .upsert(
      {
        user_id: user.id,
        tab_id,
        naver_map_link: normalized,
        naver_map_code: code,
        place_name: typeof place_name === "string" ? place_name.trim() || null : null,
      },
      {
        // Unique constraint: (user_id, naver_map_code)
        onConflict: "user_id,naver_map_code",
      }
    );

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

