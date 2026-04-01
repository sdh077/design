"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, requireUser } from "@/lib/auth/guard";
import {
  closeMatch,
  createMatchForMatchmaker,
  updateMatchStage,
  updateMatchVisibility,
} from "@/lib/db/matches";
import { upsertMemberReaction } from "@/lib/db/reactions";

function getTrimmedString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getRequiredNumber(formData: FormData, key: string) {
  const value = Number(getTrimmedString(formData, key));
  return Number.isFinite(value) ? value : NaN;
}

function getCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export async function createMatchAction(formData: FormData) {
  const { profile } = await requireRole(["matchmaker", "admin"]);
  const maleUserId = getTrimmedString(formData, "maleUserId");
  const femaleUserId = getTrimmedString(formData, "femaleUserId");
  const currentStage = getRequiredNumber(formData, "currentStage");

  if (!maleUserId || !femaleUserId || Number.isNaN(currentStage)) {
    redirect("/matchmaker/matches/new?error=필수 값을 모두 입력해 주세요.");
  }

  if (maleUserId === femaleUserId) {
    redirect("/matchmaker/matches/new?error=같은 회원끼리는 매칭할 수 없습니다.");
  }

  try {
    const match = await createMatchForMatchmaker({
      matchmakerUserId: profile.id,
      maleUserId,
      femaleUserId,
      openForMale: getCheckbox(formData, "openForMale"),
      openForFemale: getCheckbox(formData, "openForFemale"),
      currentStage,
    });

    revalidatePath("/matchmaker/matches");
    redirect(`/matchmaker/matches/${match.id}?created=1`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "매칭 생성에 실패했습니다.";
    redirect(`/matchmaker/matches/new?error=${encodeURIComponent(message)}`);
  }
}

export async function updateMatchStageAction(formData: FormData) {
  const { profile } = await requireRole(["matchmaker", "admin"]);
  const matchId = getTrimmedString(formData, "matchId");
  const nextStage = getRequiredNumber(formData, "nextStage");
  const note = getTrimmedString(formData, "note") || null;

  if (!matchId || Number.isNaN(nextStage)) {
    redirect("/matchmaker/matches?error=단계 변경 값이 올바르지 않습니다.");
  }

  try {
    await updateMatchStage({
      matchId,
      matchmakerUserId: profile.id,
      nextStage,
      note,
    });
    revalidatePath("/matchmaker/matches");
    revalidatePath(`/matchmaker/matches/${matchId}`);
    redirect(`/matchmaker/matches/${matchId}?stageUpdated=1`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "단계 변경에 실패했습니다.";
    redirect(`/matchmaker/matches/${matchId}?error=${encodeURIComponent(message)}`);
  }
}

export async function updateMatchVisibilityAction(formData: FormData) {
  const { profile } = await requireRole(["matchmaker", "admin"]);
  const matchId = getTrimmedString(formData, "matchId");

  if (!matchId) {
    redirect("/matchmaker/matches?error=매칭 정보가 올바르지 않습니다.");
  }

  try {
    await updateMatchVisibility({
      matchId,
      matchmakerUserId: profile.id,
      openForMale: getCheckbox(formData, "openForMale"),
      openForFemale: getCheckbox(formData, "openForFemale"),
    });
    revalidatePath("/matchmaker/matches");
    revalidatePath(`/matchmaker/matches/${matchId}`);
    redirect(`/matchmaker/matches/${matchId}?visibilityUpdated=1`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "공개 설정 변경에 실패했습니다.";
    redirect(`/matchmaker/matches/${matchId}?error=${encodeURIComponent(message)}`);
  }
}

export async function submitReactionAction(formData: FormData) {
  const { user } = await requireUser();
  const matchId = getTrimmedString(formData, "matchId");
  const reaction = getTrimmedString(formData, "reaction") as "like" | "pass";

  if (!matchId || !["like", "pass"].includes(reaction)) {
    redirect("/member/matches?error=반응 값이 올바르지 않습니다.");
  }

  try {
    await upsertMemberReaction({
      matchId,
      userId: user.id,
      reaction,
    });
    revalidatePath("/member/matches");
    revalidatePath(`/member/matches/${matchId}`);
    redirect(`/member/matches/${matchId}?reactionSaved=1`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "반응 저장에 실패했습니다.";
    redirect(`/member/matches/${matchId}?error=${encodeURIComponent(message)}`);
  }
}

export async function closeMatchAction(formData: FormData) {
  const { profile } = await requireRole(["matchmaker", "admin"]);
  const matchId = getTrimmedString(formData, "matchId");
  const closedReason = getTrimmedString(formData, "closedReason") || null;

  if (!matchId) {
    redirect("/matchmaker/matches?error=매칭 정보가 올바르지 않습니다.");
  }

  try {
    await closeMatch({
      matchId,
      matchmakerUserId: profile.id,
      closedReason,
    });
    revalidatePath("/matchmaker/matches");
    revalidatePath(`/matchmaker/matches/${matchId}`);
    revalidatePath("/member/matches");
    redirect(`/matchmaker/matches/${matchId}?closed=1`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "매칭 종료에 실패했습니다.";
    redirect(`/matchmaker/matches/${matchId}?error=${encodeURIComponent(message)}`);
  }
}
