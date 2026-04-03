import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query")?.trim();
  if (!query) return NextResponse.json({ documents: [] });

  const key = process.env.KAKAO_REST_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "KAKAO_REST_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=15`;
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${key}` },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
