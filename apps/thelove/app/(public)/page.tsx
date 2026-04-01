import Link from "next/link";

export default function HomePage() {
  return (
    <main className="kurly-shell flex flex-1 items-center py-12">
      <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <section className="space-y-8">
          <div className="space-y-4">
            <div className="kurly-kicker">Curated Introduction</div>
            <h1 className="max-w-3xl text-6xl leading-none font-semibold text-slate-900">
              진중한 만남을
              <br />
              더 우아하게 이어주는
              <br />
              <span className="text-fuchsia-200">theLove</span>
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              중매자가 연결하고, 소개글에서 사진과 연락처까지 단계적으로 열어가는
              프라이빗 소개 서비스입니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="kurly-button rounded-2xl px-6 py-3.5 text-sm font-semibold"
            >
              회원가입하고 시작하기
            </Link>
            <Link
              href="/login"
              className="kurly-outline rounded-2xl px-6 py-3.5 text-sm font-semibold"
            >
              기존 계정 로그인
            </Link>
          </div>
        </section>

        <section className="kurly-panel rounded-[2rem] p-7">
          <div className="grid gap-4">
            <div className="rounded-[1.6rem] border border-white/8 bg-white/4 p-5">
              <div className="kurly-kicker">Step 1</div>
              <h2 className="mt-3 text-3xl text-slate-900">소개글 공개</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                이름, 삶의 방향, 신앙, 연애관처럼 가장 본질적인 이야기부터 차분히
                확인합니다.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/8 bg-white/4 p-5">
                <div className="kurly-kicker">Step 2</div>
                <h3 className="mt-3 text-2xl text-slate-900">사진 공개</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  양측 반응을 확인한 뒤 다음 단계로 천천히 올라갑니다.
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/8 bg-white/4 p-5">
                <div className="kurly-kicker">Step 3</div>
                <h3 className="mt-3 text-2xl text-slate-900">연락처 공개</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  서로의 의사가 분명해졌을 때만 연결을 더 깊게 엽니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
