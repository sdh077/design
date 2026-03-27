import { redirect } from "next/navigation";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // 회원가입은 제거하고 로그인만 사용합니다.
  redirect(next || "/login");
}

