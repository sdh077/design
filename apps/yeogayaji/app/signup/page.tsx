import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupForm } from "@/components/auth-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(next || "/places");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          회원가입
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          계정을 만들고 네이버 지도 링크를 탭별로 저장해보세요.
        </p>
        <div className="mt-5">
          <SignupForm next={next || "/login"} />
        </div>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          이미 계정이 있나요?{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="font-semibold text-zinc-900 underline dark:text-zinc-100"
          >
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
