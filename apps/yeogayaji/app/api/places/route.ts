import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractNaverMapCode, normalizeNaverMeLink } from "@/lib/naver";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
      place_name?: string | null;
      description?: string | null;
      naver_map_link?: string;
      tab_id?: string | null;
    }
    | null;

  const normalized = normalizeNaverMeLink(body?.naver_map_link ?? "");

  if (!normalized) {
    return NextResponse.json(
      { message: "올바른 네이버 지도 링크를 입력해 주세요." },
      { status: 400 }
    );
  }

  const naverMapCode = extractNaverMapCode(normalized);

  const payload = {
    user_id: user.id,
    tab_id: body?.tab_id ?? null,
    place_name: body?.place_name?.trim() || null,
    description: body?.description?.trim() || null,
    naver_map_link: normalized,
    naver_map_code: naverMapCode,
    is_recommended: true,
    sort_order: 0,
  };

  const { data, error } = await supabase
    .from("places")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { message: error.message ?? "장소 저장에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ place: data }, { status: 201 });
}