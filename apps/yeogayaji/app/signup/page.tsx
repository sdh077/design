import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupForm } from "@/components/auth-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { next } = await searchParams;

  if (user) redirect(next || "/places");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          회원가입
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          이메일/비밀번호로 가입한 뒤 저장/조회할 수 있습니다.
        </p>
        <div className="mt-5">
          <SignupForm next={next || "/places"} />
        </div>
      </div>
    </main>
  );
}

