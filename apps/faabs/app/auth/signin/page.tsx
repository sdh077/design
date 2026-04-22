import SignInForm from "./SignInForm";

export const metadata = {
  title: "로그인 — FAABS Coffee",
};

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <a href="/" className="block text-center text-xl font-black tracking-[0.2em] uppercase mb-12 text-[#0a0a0a]">
          FAABS
        </a>
        <h1 className="text-2xl font-black uppercase mb-2 text-[#0a0a0a]">로그인</h1>
        <p className="text-sm text-black/60 mb-8">파브스 커피 멤버십에 오신 것을 환영합니다.</p>
        <SignInForm />
        <p className="text-center text-xs text-black/40 mt-6">
          계정이 없으신가요?{" "}
          <a href="/auth/signup" className="text-black underline hover:no-underline">
            회원가입
          </a>
        </p>
      </div>
    </main>
  );
}
