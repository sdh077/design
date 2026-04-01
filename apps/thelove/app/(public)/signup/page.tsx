import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { getDefaultRouteForRole, getProfileByUserId } from "@/lib/db/profile";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage({
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
  const inviteCode =
    typeof params.inviteCode === "string" ? params.inviteCode : undefined;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 items-center">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex flex-col justify-center space-y-5">
          <div className="kurly-kicker">Join theLove</div>
          <h1 className="text-5xl text-slate-900">신중한 만남을 위한 가입</h1>
          <p className="max-w-md text-base leading-8 text-slate-600">
            소개글부터 사진, 연락처까지 중매자의 판단 아래 단계적으로 공개되는
            흐름을 시작합니다.
          </p>
        </section>

        <section className="kurly-panel rounded-[2rem] p-8">
          <h2 className="mb-2 text-3xl text-slate-900">회원가입</h2>
          <p className="mb-6 text-sm text-slate-600">
            일반 회원가입과 중매자 링크 가입을 여기서 처리합니다.
          </p>

          {error ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="rounded-[1.6rem] border border-white/8 bg-white/4 p-6">
            <SignupForm inviteCode={inviteCode} />
          </div>

          <p className="mt-5 text-center text-sm text-slate-600">
            이미 계정이 있으면{" "}
            <Link
              href={
                inviteCode
                  ? `/login?inviteCode=${encodeURIComponent(inviteCode)}`
                  : "/login"
              }
              className="font-medium text-slate-900 underline"
            >
              로그인
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
