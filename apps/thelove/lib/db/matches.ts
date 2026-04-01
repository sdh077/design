import { createAdminClient } from "@/lib/supabase/admin";
import { attachSignedUrls } from "@/lib/db/profile";
import type {
  MemberVisibleMatch,
  MatchReactionStatus,
  MatchRecord,
  MatchReactionRecord,
  MatchStageLogRecord,
  MatchSummary,
} from "@/types/match";
import type { MemberProfileRow, ProfileRow } from "@/types/profile";

export type MatchmakerMemberOption = {
  id: string;
  name: string | null;
  gender: "male" | "female" | null;
  churchName: string | null;
  regionText: string | null;
  profileStatus: string | null;
  introNameAge: string | null;
  connectedAt: string;
};

export async function getConnectedMembersForMatchmaker(matchmakerUserId: string) {
  const admin = createAdminClient();
  const { data: links, error: linksError } = await admin
    .from("member_matchmakers")
    .select("member_user_id, connected_at, status")
    .eq("matchmaker_user_id", matchmakerUserId)
    .eq("status", "active")
    .order("connected_at", { ascending: false });

  if (linksError) {
    throw new Error(linksError.message);
  }

  const memberIds = [...new Set((links ?? []).map((row) => row.member_user_id))];

  if (memberIds.length === 0) {
    return [] satisfies MatchmakerMemberOption[];
  }

  const [profilesResult, memberProfilesResult] = await Promise.all([
    admin.from("profiles").select("*").in("id", memberIds),
    admin.from("member_profiles").select("*").in("user_id", memberIds),
  ]);

  if (profilesResult.error) {
    throw new Error(profilesResult.error.message);
  }

  if (memberProfilesResult.error) {
    throw new Error(memberProfilesResult.error.message);
  }

  const profileMap = new Map(
    (profilesResult.data ?? []).map((row) => [row.id, row] satisfies [string, ProfileRow])
  );
  const memberProfileMap = new Map(
    (memberProfilesResult.data ?? []).map(
      (row) => [row.user_id, row] satisfies [string, MemberProfileRow]
    )
  );

  return (links ?? []).map((link) => {
    const profile = profileMap.get(link.member_user_id) ?? null;
    const memberProfile = memberProfileMap.get(link.member_user_id) ?? null;

    return {
      id: link.member_user_id,
      name: profile?.name ?? null,
      gender: profile?.gender ?? null,
      churchName: profile?.church_name ?? null,
      regionText: profile?.region_text ?? null,
      profileStatus: memberProfile?.profile_status ?? null,
      introNameAge: memberProfile?.intro_name_age ?? null,
      connectedAt: link.connected_at,
    };
  });
}

async function getProfileSummaries(userIds: string[]) {
  const admin = createAdminClient();
  const uniqueIds = [...new Set(userIds)];

  if (uniqueIds.length === 0) {
    return new Map<string, { profile: ProfileRow | null; memberProfile: MemberProfileRow | null }>();
  }

  const [profilesResult, memberProfilesResult] = await Promise.all([
    admin.from("profiles").select("*").in("id", uniqueIds),
    admin.from("member_profiles").select("*").in("user_id", uniqueIds),
  ]);

  if (profilesResult.error) {
    throw new Error(profilesResult.error.message);
  }

  if (memberProfilesResult.error) {
    throw new Error(memberProfilesResult.error.message);
  }

  const profileMap = new Map(
    (profilesResult.data ?? []).map((row) => [row.id, row] satisfies [string, ProfileRow])
  );
  const memberProfileMap = new Map(
    (memberProfilesResult.data ?? []).map(
      (row) => [row.user_id, row] satisfies [string, MemberProfileRow]
    )
  );

  return new Map(
    uniqueIds.map((id) => [
      id,
      {
        profile: profileMap.get(id) ?? null,
        memberProfile: memberProfileMap.get(id) ?? null,
      },
    ])
  );
}

export async function createMatchForMatchmaker(input: {
  matchmakerUserId: string;
  maleUserId: string;
  femaleUserId: string;
  openForMale: boolean;
  openForFemale: boolean;
  currentStage: number;
}) {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("matches")
    .insert({
      matchmaker_user_id: input.matchmakerUserId,
      male_user_id: input.maleUserId,
      female_user_id: input.femaleUserId,
      open_for_male: input.openForMale,
      open_for_female: input.openForFemale,
      current_stage: input.currentStage,
      status: "active",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await admin.from("match_stage_logs").insert({
    match_id: data.id,
    changed_by: input.matchmakerUserId,
    from_stage: null,
    to_stage: input.currentStage,
    note: "매칭 생성",
  });

  return data;
}

export async function updateMatchStage(input: {
  matchId: string;
  matchmakerUserId: string;
  nextStage: number;
  note: string | null;
}) {
  const admin = createAdminClient();
  const { data: currentMatch, error: currentError } = await admin
    .from("matches")
    .select("*")
    .eq("id", input.matchId)
    .eq("matchmaker_user_id", input.matchmakerUserId)
    .maybeSingle();

  if (currentError) {
    throw new Error(currentError.message);
  }

  if (!currentMatch) {
    throw new Error("매칭을 찾을 수 없습니다.");
  }

  const { error: updateError } = await admin
    .from("matches")
    .update({
      current_stage: input.nextStage,
    })
    .eq("id", input.matchId)
    .eq("matchmaker_user_id", input.matchmakerUserId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  const { error: logError } = await admin.from("match_stage_logs").insert({
    match_id: input.matchId,
    changed_by: input.matchmakerUserId,
    from_stage: currentMatch.current_stage,
    to_stage: input.nextStage,
    note: input.note,
  });

  if (logError) {
    throw new Error(logError.message);
  }
}

export async function updateMatchVisibility(input: {
  matchId: string;
  matchmakerUserId: string;
  openForMale: boolean;
  openForFemale: boolean;
}) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("matches")
    .update({
      open_for_male: input.openForMale,
      open_for_female: input.openForFemale,
    })
    .eq("id", input.matchId)
    .eq("matchmaker_user_id", input.matchmakerUserId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function closeMatch(input: {
  matchId: string;
  matchmakerUserId: string;
  closedReason: string | null;
}) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("matches")
    .update({
      status: "closed",
      closed_reason: input.closedReason,
      open_for_male: false,
      open_for_female: false,
    })
    .eq("id", input.matchId)
    .eq("matchmaker_user_id", input.matchmakerUserId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getMatchByIdForMatchmaker(
  matchId: string,
  matchmakerUserId: string
): Promise<MatchSummary | null> {
  const admin = createAdminClient();
  const { data: match, error: matchError } = await admin
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .eq("matchmaker_user_id", matchmakerUserId)
    .maybeSingle();

  if (matchError) {
    throw new Error(matchError.message);
  }

  if (!match) {
    return null;
  }

  const [reactionsResult, logsResult, peopleMap] = await Promise.all([
    admin.from("match_reactions").select("*").eq("match_id", match.id),
    admin
      .from("match_stage_logs")
      .select("*")
      .eq("match_id", match.id)
      .order("created_at", { ascending: false }),
    getProfileSummaries([match.male_user_id, match.female_user_id]),
  ]);

  if (reactionsResult.error) {
    throw new Error(reactionsResult.error.message);
  }

  if (logsResult.error) {
    throw new Error(logsResult.error.message);
  }

  return {
    ...match,
    male: peopleMap.get(match.male_user_id) ?? {
      profile: null,
      memberProfile: null,
    },
    female: peopleMap.get(match.female_user_id) ?? {
      profile: null,
      memberProfile: null,
    },
    reactions: (reactionsResult.data ?? []) as MatchReactionRecord[],
    stageLogs: (logsResult.data ?? []) as MatchStageLogRecord[],
  };
}

export async function getMatchesForMatchmaker(
  matchmakerUserId: string
): Promise<MatchSummary[]> {
  const admin = createAdminClient();
  const [matchesResult, reactionsResult] = await Promise.all([
    admin
      .from("matches")
      .select("*")
      .eq("matchmaker_user_id", matchmakerUserId)
      .order("created_at", { ascending: false }),
    admin
      .from("match_reactions")
      .select("*")
      .in(
        "match_id",
        (
          await admin
            .from("matches")
            .select("id")
            .eq("matchmaker_user_id", matchmakerUserId)
        ).data?.map((row) => row.id) ?? []
      ),
  ]);

  if (matchesResult.error) {
    throw new Error(matchesResult.error.message);
  }

  if (reactionsResult.error) {
    throw new Error(reactionsResult.error.message);
  }

  const rows = (matchesResult.data ?? []) as MatchRecord[];
  const userIds = rows.flatMap((row) => [row.male_user_id, row.female_user_id]);
  const peopleMap = await getProfileSummaries(userIds);
  const reactionMap = new Map<string, MatchReactionRecord[]>();

  for (const reaction of (reactionsResult.data ?? []) as MatchReactionRecord[]) {
    const current = reactionMap.get(reaction.match_id) ?? [];
    current.push(reaction);
    reactionMap.set(reaction.match_id, current);
  }

  return rows.map((row) => ({
    ...row,
    male: peopleMap.get(row.male_user_id) ?? {
      profile: null,
      memberProfile: null,
    },
    female: peopleMap.get(row.female_user_id) ?? {
      profile: null,
      memberProfile: null,
    },
    reactions: reactionMap.get(row.id) ?? [],
    stageLogs: [],
  }));
}

export async function getMatches() {
  return [];
}

export async function getMatchesForMember(
  memberUserId: string
): Promise<MemberVisibleMatch[]> {
  const admin = createAdminClient();
  const { data: matches, error } = await admin
    .from("matches")
    .select("*")
    .or(`male_user_id.eq.${memberUserId},female_user_id.eq.${memberUserId}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (matches ?? []) as MatchRecord[];
  const counterpartIds = rows.map((row) =>
    row.male_user_id === memberUserId ? row.female_user_id : row.male_user_id
  );

  const peopleMap = await getProfileSummaries(counterpartIds);
  const { data: photos, error: photosError } = await admin
    .from("member_photos")
    .select("id, user_id, storage_path, is_primary, sort_order, created_at")
    .in("user_id", counterpartIds)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  if (photosError) {
    throw new Error(photosError.message);
  }

  const { data: reactions, error: reactionsError } = await admin
    .from("match_reactions")
    .select("*")
    .eq("user_id", memberUserId)
    .in(
      "match_id",
      rows.map((row) => row.id)
    );

  if (reactionsError) {
    throw new Error(reactionsError.message);
  }

  const photoMap = new Map<string, MemberVisibleMatch["counterpart"]["photos"]>();
  const photoAssets = await attachSignedUrls(photos ?? []);

  for (const photo of photoAssets) {
    const current = photoMap.get(photo.user_id) ?? [];
    current.push(photo);
    photoMap.set(photo.user_id, current);
  }

  const reactionMap = new Map(
    (reactions ?? []).map((row) => [row.match_id, row] satisfies [string, MatchReactionRecord])
  );

  return rows.map((match) => {
    const viewerRole = match.male_user_id === memberUserId ? "male" : "female";
    const counterpartId =
      viewerRole === "male" ? match.female_user_id : match.male_user_id;

    return {
      match,
      viewerRole,
      isOpenToViewer:
        viewerRole === "male" ? match.open_for_male : match.open_for_female,
      currentReaction: reactionMap.get(match.id) ?? null,
      counterpart: {
        ...(peopleMap.get(counterpartId) ?? {
          profile: null,
          memberProfile: null,
        }),
        photos: photoMap.get(counterpartId) ?? [],
      },
    };
  });
}

export async function getMatchByIdForMember(
  matchId: string,
  memberUserId: string
): Promise<MemberVisibleMatch | null> {
  const matches = await getMatchesForMember(memberUserId);
  return matches.find((item) => item.match.id === matchId) ?? null;
}

export function getMatchReactionStatus(match: MatchSummary): MatchReactionStatus {
  const reactions = match.reactions;
  const hasPass = reactions.some((reaction) => reaction.reaction === "pass");

  if (hasPass) {
    return "has_pass";
  }

  const likeCount = reactions.filter((reaction) => reaction.reaction === "like").length;

  if (likeCount >= 2) {
    return "both_like";
  }

  if (likeCount === 1) {
    return "one_like";
  }

  return "waiting";
}
