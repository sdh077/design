import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createInviteCode } from "@/lib/utils/codes";
import { normalizeInviteCode } from "@/lib/utils/codes";

export type MatchmakerCodePreview = {
  id: string;
  matchmakerUserId: string;
  code: string;
  isActive: boolean;
  expiresAt: string | null;
  matchmakerName: string | null;
};

export async function getMatchmakerCodePreview(
  rawCode: string
): Promise<MatchmakerCodePreview | null> {
  const code = normalizeInviteCode(rawCode);

  if (!code) {
    return null;
  }

  const admin = createAdminClient();
  const { data: codeRow, error: codeError } = await admin
    .from("matchmaker_codes")
    .select("id, matchmaker_user_id, code, is_active, expires_at")
    .eq("code", code)
    .maybeSingle();

  if (codeError) {
    throw new Error(codeError.message);
  }

  if (!codeRow) {
    return null;
  }

  const { data: profileRow, error: profileError } = await admin
    .from("profiles")
    .select("name")
    .eq("id", codeRow.matchmaker_user_id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  return {
    id: codeRow.id,
    matchmakerUserId: codeRow.matchmaker_user_id,
    code: codeRow.code,
    isActive: codeRow.is_active,
    expiresAt: codeRow.expires_at,
    matchmakerName: profileRow?.name ?? null,
  };
}

export async function connectMemberToMatchmakerCode(
  memberUserId: string,
  rawCode: string
) {
  const codePreview = await getMatchmakerCodePreview(rawCode);

  if (!codePreview || !codePreview.isActive) {
    throw new Error("유효한 중매자 코드를 찾지 못했습니다.");
  }

  if (
    codePreview.expiresAt &&
    new Date(codePreview.expiresAt).getTime() < Date.now()
  ) {
    throw new Error("만료된 중매자 코드입니다.");
  }

  if (codePreview.matchmakerUserId === memberUserId) {
    throw new Error("본인 중매자 코드로는 연결할 수 없습니다.");
  }

  const admin = createAdminClient();
  const { data: existingProfile, error: existingProfileError } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", memberUserId)
    .maybeSingle();

  if (existingProfileError) {
    throw new Error(existingProfileError.message);
  }

  if (!existingProfile) {
    const { error: profileUpsertError } = await admin.from("profiles").upsert(
      {
        id: memberUserId,
        role: "member",
      },
      {
        onConflict: "id",
      }
    );

    if (profileUpsertError) {
      throw new Error(profileUpsertError.message);
    }
  }

  const { error: memberProfileUpsertError } = await admin
    .from("member_profiles")
    .upsert(
      {
        user_id: memberUserId,
      },
      {
        onConflict: "user_id",
      }
    );

  if (memberProfileUpsertError) {
    throw new Error(memberProfileUpsertError.message);
  }

  const { error } = await admin.from("member_matchmakers").upsert(
    {
      member_user_id: memberUserId,
      matchmaker_user_id: codePreview.matchmakerUserId,
      status: "active",
      invited_by_code: codePreview.code,
    },
    {
      onConflict: "member_user_id,matchmaker_user_id",
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return codePreview;
}

export async function getMatchmakerCodesForUser(matchmakerUserId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matchmaker_codes")
    .select("*")
    .eq("matchmaker_user_id", matchmakerUserId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createMatchmakerCodeForUser(
  matchmakerUserId: string,
  expiresInDays?: number | null
) {
  const supabase = await createClient();
  const expiresAt =
    expiresInDays && expiresInDays > 0
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = createInviteCode();
    const { data, error } = await supabase
      .from("matchmaker_codes")
      .insert({
        matchmaker_user_id: matchmakerUserId,
        code,
        expires_at: expiresAt,
      })
      .select("*")
      .single();

    if (!error) {
      return data;
    }

    if (!error.message.toLowerCase().includes("duplicate")) {
      throw new Error(error.message);
    }
  }

  throw new Error("초대 코드 생성에 실패했습니다. 다시 시도해 주세요.");
}

export async function getMatchmakerDashboardSummary(matchmakerUserId: string) {
  const supabase = await createClient();
  const [codesResult, memberLinksResult, matchesResult] = await Promise.all([
    supabase
      .from("matchmaker_codes")
      .select("id, is_active, expires_at")
      .eq("matchmaker_user_id", matchmakerUserId),
    supabase
      .from("member_matchmakers")
      .select("id, status")
      .eq("matchmaker_user_id", matchmakerUserId),
    supabase
      .from("matches")
      .select("id, status, current_stage")
      .eq("matchmaker_user_id", matchmakerUserId),
  ]);

  if (codesResult.error) {
    throw new Error(codesResult.error.message);
  }

  if (memberLinksResult.error) {
    throw new Error(memberLinksResult.error.message);
  }

  if (matchesResult.error) {
    throw new Error(matchesResult.error.message);
  }

  const codes = codesResult.data ?? [];
  const memberLinks = memberLinksResult.data ?? [];
  const matches = matchesResult.data ?? [];

  return {
    totalCodes: codes.length,
    activeCodes: codes.filter((row) => row.is_active).length,
    connectedMembers: memberLinks.filter((row) => row.status === "active").length,
    activeMatches: matches.filter((row) => row.status === "active").length,
  };
}

export async function getMatchmakerDashboard() {
  return [];
}
