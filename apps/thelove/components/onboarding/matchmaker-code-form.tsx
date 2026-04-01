import { connectMatchmakerCodeAction } from "@/actions/onboarding";

export function MatchmakerCodeForm() {
  return (
    <form action={connectMatchmakerCodeAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="code" className="text-sm font-medium">
          중매자 코드
        </label>
        <input
          id="code"
          name="code"
          placeholder="예: LOVE-1234"
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </div>

      <button className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium">
        코드로 중매자 연결
      </button>
    </form>
  );
}
