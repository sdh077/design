import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getDefaultRouteForRole, getProfileByUserId } from "@/lib/db/profile";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const profile = await getProfileByUserId(user.id);
    redirect(getDefaultRouteForRole(profile?.role));
  }

  const params = (await searchParams) ?? {};
  const error =
    typeof params.error === "string" ? decodeURIComponent(params.error) : null;
  const signedUp = params.signedUp === "1";
  const loggedOut = params.loggedOut === "1";
  const next = typeof params.next === "string" ? params.next : "";
  const inviteCode =
    typeof params.inviteCode === "string" ? params.inviteCode : undefined;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 items-center">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex flex-col justify-center space-y-5">
          <div className="kurly-kicker">Sign In</div>
          <h1 className="text-5xl text-slate-900">다시 이어가는 소개</h1>
          <p className="max-w-md text-base leading-8 text-slate-600">
            theLove 계정으로 로그인하고 온보딩이나 현재 진행 중인 소개 화면으로
            바로 이동하세요.
          </p>
        </section>

        <section className="kurly-panel rounded-[2rem] p-8">
          <h2 className="mb-2 text-3xl text-slate-900">로그인</h2>
          <p className="mb-6 text-sm text-slate-600">
            이메일과 비밀번호를 입력해 계속 진행합니다.
          </p>

          {error ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {signedUp ? (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              회원가입이 완료되었습니다. 로그인해서 계속 진행해 주세요.
            </div>
          ) : null}

          {loggedOut ? (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              로그아웃되었습니다.
            </div>
          ) : null}

          <div className="rounded-[1.6rem] border border-white/8 bg-white/4 p-6">
            <LoginForm next={next} inviteCode={inviteCode} />
          </div>

          <p className="mt-5 text-center text-sm text-slate-600">
            계정이 없으면{" "}
            <Link
              href={
                inviteCode
                  ? `/signup?inviteCode=${encodeURIComponent(inviteCode)}`
                  : "/signup"
              }
              className="font-medium text-slate-900 underline"
            >
              회원가입
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
