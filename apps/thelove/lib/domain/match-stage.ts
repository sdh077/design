export const MATCH_STAGE_STEPS = [
  { value: 1, label: "소개글 공개" },
  { value: 2, label: "사진 공개" },
  { value: 3, label: "연락처 공개" },
] as const;

export type MatchStage = (typeof MATCH_STAGE_STEPS)[number]["value"];

export function getMatchStageLabel(stage: number) {
  return (
    MATCH_STAGE_STEPS.find((item) => item.value === stage)?.label ??
    `단계 ${stage}`
  );
}
