import { signupAction } from "@/actions/auth";

type SignupFormProps = {
  inviteCode?: string;
};

export function SignupForm({ inviteCode }: SignupFormProps) {
  return (
    <form action={signupAction} className="space-y-4">
      <input type="hidden" name="inviteCode" value={inviteCode ?? ""} />

      <label className="block space-y-2 text-sm">
        <span>이름</span>
        <input
          name="name"
          required
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>

      <label className="block space-y-2 text-sm">
        <span>이메일</span>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>

      <label className="block space-y-2 text-sm">
        <span>비밀번호</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>

      {inviteCode ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          회원가입이 완료되면 중매자 코드 `{inviteCode}` 와 연결됩니다.
        </div>
      ) : null}

      <button className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white">
        회원가입
      </button>
    </form>
  );
}
