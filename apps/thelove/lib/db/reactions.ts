import { createAdminClient } from "@/lib/supabase/admin";
import type { MatchReaction } from "@/types/database";

export async function upsertMemberReaction(input: {
  matchId: string;
  userId: string;
  reaction: MatchReaction;
}) {
  const admin = createAdminClient();

  const { data: match, error: matchError } = await admin
    .from("matches")
    .select("*")
    .eq("id", input.matchId)
    .maybeSingle();

  if (matchError) {
    throw new Error(matchError.message);
  }

  if (!match) {
    throw new Error("매칭을 찾을 수 없습니다.");
  }

  if (match.status !== "active") {
    throw new Error("닫힌 매칭에는 반응할 수 없습니다.");
  }

  const isMale = match.male_user_id === input.userId;
  const isFemale = match.female_user_id === input.userId;

  if (!isMale && !isFemale) {
    throw new Error("이 매칭에 반응할 권한이 없습니다.");
  }

  const isOpenToUser =
    (isMale && match.open_for_male) || (isFemale && match.open_for_female);

  if (!isOpenToUser) {
    throw new Error("아직 내게 공개되지 않은 매칭입니다.");
  }

  const { data, error } = await admin
    .from("match_reactions")
    .upsert(
      {
        match_id: input.matchId,
        user_id: input.userId,
        reaction: input.reaction,
      },
      {
        onConflict: "match_id,user_id",
      }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getReactions() {
  return [];
}
