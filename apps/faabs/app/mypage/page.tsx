import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import SiteLayout from "../components/SiteLayout";

export const metadata = {
  title: "마이페이지 — FAABS Coffee",
};

export default async function MyPage() {
  const supabase = await createClient("public");
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/signin");

  const name = user.user_metadata?.name ?? user.email?.split("@")[0] ?? "멤버";

  return (
    <SiteLayout>
      <div className="min-h-screen bg-[#f5f5f0] pt-28 pb-20 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* 인사 */}
          <div className="mb-12">
            <p className="text-xs tracking-[0.4em] uppercase text-black/60 mb-2">My Page</p>
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-black uppercase text-[#0a0a0a] leading-none">
              안녕하세요,<br />
              <span className="text-black/20">{name}</span> 님
            </h1>
          </div>

          {/* 정보 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-black/5 mb-px">
            <div className="bg-white p-8">
              <p className="text-xs tracking-widest uppercase text-black/60 mb-4">계정 정보</p>
              <dl className="flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-black/5 pb-3">
                  <dt className="text-sm text-black/60">이메일</dt>
                  <dd className="text-sm font-medium text-[#0a0a0a]">{user.email}</dd>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-3">
                  <dt className="text-sm text-black/60">이름</dt>
                  <dd className="text-sm font-medium text-[#0a0a0a]">{name}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-sm text-black/60">가입일</dt>
                  <dd className="text-sm font-medium text-[#0a0a0a]">
                    {new Date(user.created_at).toLocaleDateString("ko-KR")}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white p-8">
              <p className="text-xs tracking-widest uppercase text-black/60 mb-4">빠른 링크</p>
              <div className="flex flex-col gap-3">
                <a
                  href="https://smartstore.naver.com/faabscoffee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between border-b border-black/5 pb-3 text-sm hover:text-black/60 transition-colors"
                >
                  <span>네이버 스토어</span>
                  <span className="text-black/30">→</span>
                </a>
                <a
                  href="/wholesale"
                  className="flex items-center justify-between border-b border-black/5 pb-3 text-sm hover:text-black/60 transition-colors"
                >
                  <span>납품 문의</span>
                  <span className="text-black/30">→</span>
                </a>
                <a
                  href="/#products"
                  className="flex items-center justify-between text-sm hover:text-black/60 transition-colors"
                >
                  <span>원두 보기</span>
                  <span className="text-black/30">→</span>
                </a>
              </div>
            </div>
          </div>

          {/* 로그아웃 */}
          <div className="bg-white p-8 flex items-center justify-between">
            <p className="text-sm text-black/60">더 이상 세션이 필요하지 않으신가요?</p>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm tracking-widest uppercase border border-black/20 px-6 py-2.5 hover:bg-black hover:text-white transition-all"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
