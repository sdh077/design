"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { connectMemberToMatchmakerCode } from "@/lib/db/matchmaker";
import { createClient } from "@/lib/supabase/server";
import { normalizeInviteCode } from "@/lib/utils/codes";

function getTrimmedString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getOptionalString(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);
  return value.length > 0 ? value : null;
}

function getOptionalNumber(formData: FormData, key: string) {
  const value = getTrimmedString(formData, key);
  if (!value) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getList(formData: FormData, key: string) {
  return getTrimmedString(formData, key)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function requireActionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function saveOnboardingAction(formData: FormData) {
  const { supabase, user } = await requireActionUser();
  const admin = createAdminClient();

  const { data: currentProfile, error: currentProfileError } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (currentProfileError) {
    redirect(
      `/onboarding?error=${encodeURIComponent(currentProfileError.message)}`
    );
  }

  const profilePayload = {
    id: user.id,
    role: currentProfile?.role ?? "member",
    name: getOptionalString(formData, "name"),
    gender: (getOptionalString(formData, "gender") as "male" | "female" | null),
    birth_year: getOptionalNumber(formData, "birth_year"),
    phone: getOptionalString(formData, "phone"),
    church_name: getOptionalString(formData, "church_name"),
    denomination: getOptionalString(formData, "denomination"),
    region_text: getOptionalString(formData, "region_text"),
  };

  const memberProfilePayload = {
    user_id: user.id,
    intro_name_age: getOptionalString(formData, "intro_name_age"),
    job_text: getOptionalString(formData, "job_text"),
    joy_text: getOptionalString(formData, "joy_text"),
    dating_view_text: getOptionalString(formData, "dating_view_text"),
    height: getOptionalNumber(formData, "height"),
    education_text: getOptionalString(formData, "education_text"),
    marriage_view_text: getOptionalString(formData, "marriage_view_text"),
    preferred_traits: getList(formData, "preferred_traits"),
    deal_breakers: getList(formData, "deal_breakers"),
    contact_phone: getOptionalString(formData, "contact_phone"),
    contact_kakao: getOptionalString(formData, "contact_kakao"),
    profile_status:
      (getOptionalString(formData, "profile_status") as
        | "draft"
        | "published"
        | "hidden"
        | null) ?? "draft",
  };

  const { error: profileError } = await admin
    .from("profiles")
    .upsert(profilePayload, {
      onConflict: "id",
    });

  if (profileError) {
    redirect(`/onboarding?error=${encodeURIComponent(profileError.message)}`);
  }

  const { error: memberProfileError } = await admin
    .from("member_profiles")
    .upsert(memberProfilePayload, {
      onConflict: "user_id",
    });

  if (memberProfileError) {
    redirect(
      `/onboarding?error=${encodeURIComponent(memberProfileError.message)}`
    );
  }

  revalidatePath("/onboarding");
  redirect("/onboarding?saved=1");
}

export async function connectMatchmakerCodeAction(formData: FormData) {
  const { user } = await requireActionUser();
  const code = normalizeInviteCode(String(formData.get("code") ?? ""));

  if (!code) {
    redirect("/onboarding?error=중매자 코드를 입력해 주세요.");
  }

  try {
    await connectMemberToMatchmakerCode(user.id, code);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "중매자 연결에 실패했습니다.";
    redirect(`/onboarding?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/onboarding");
  redirect("/onboarding?connected=1");
}
