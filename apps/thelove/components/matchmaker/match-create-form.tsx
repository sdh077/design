import { createMatchAction } from "@/actions/matches";
import { MATCH_STAGE_STEPS } from "@/lib/domain/match-stage";
import type { MatchmakerMemberOption } from "@/lib/db/matches";

export function MatchCreateForm({
  maleMembers,
  femaleMembers,
}: {
  maleMembers: MatchmakerMemberOption[];
  femaleMembers: MatchmakerMemberOption[];
}) {
  return (
    <form action={createMatchAction} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>남성 회원</span>
          <select
            name="maleUserId"
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
            required
          >
            <option value="">선택</option>
            {maleMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name ?? "이름 미입력"} / {member.regionText ?? "지역 미입력"}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span>여성 회원</span>
          <select
            name="femaleUserId"
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
            required
          >
            <option value="">선택</option>
            {femaleMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name ?? "이름 미입력"} / {member.regionText ?? "지역 미입력"}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="space-y-2 text-sm">
          <span>초기 공개 단계</span>
          <select
            name="currentStage"
            defaultValue="1"
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          >
            {MATCH_STAGE_STEPS.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm">
          <input type="checkbox" name="openForMale" defaultChecked />
          <span>남성에게 공개</span>
        </label>

        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm">
          <input type="checkbox" name="openForFemale" defaultChecked />
          <span>여성에게 공개</span>
        </label>
      </div>

      <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white">
        매칭 생성
      </button>
    </form>
  );
}
