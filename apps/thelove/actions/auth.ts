"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectMemberToMatchmakerCode } from "@/lib/db/matchmaker";
import { getDefaultRouteForRole, getProfileByUserId } from "@/lib/db/profile";
import { createClient } from "@/lib/supabase/server";
import { normalizeInviteCode } from "@/lib/utils/codes";

function getTrimmedString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function getBaseUrl() {
  const headerStore = await headers();
  return (
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3004"
  );
}

export async function loginAction(formData: FormData) {
  const supabase = await createClient();
  const email = getTrimmedString(formData, "email");
  const password = getTrimmedString(formData, "password");
  const next = getTrimmedString(formData, "next");
  const inviteCode = normalizeInviteCode(getTrimmedString(formData, "inviteCode"));

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect("/login?error=이메일 또는 비밀번호를 확인해 주세요.");
  }

  if (inviteCode) {
    try {
      await connectMemberToMatchmakerCode(data.user.id, inviteCode);
    } catch (connectError) {
      const message =
        connectError instanceof Error
          ? connectError.message
          : "중매자 연결에 실패했습니다.";

      redirect(`/onboarding?error=${encodeURIComponent(message)}`);
    }
  }

  const profile = await getProfileByUserId(data.user.id);
  const defaultRoute = getDefaultRouteForRole(profile?.role);

  revalidatePath("/");
  redirect(next || defaultRoute);
}

export async function signupAction(formData: FormData) {
  const supabase = await createClient();
  const name = getTrimmedString(formData, "name");
  const email = getTrimmedString(formData, "email");
  const password = getTrimmedString(formData, "password");
  const inviteCode = normalizeInviteCode(getTrimmedString(formData, "inviteCode"));
  const baseUrl = await getBaseUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${baseUrl}/api/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (inviteCode && data.user) {
    try {
      await connectMemberToMatchmakerCode(data.user.id, inviteCode);
    } catch (connectError) {
      const message =
        connectError instanceof Error
          ? connectError.message
          : "중매자 연결에 실패했습니다.";

      redirect(`/signup?error=${encodeURIComponent(message)}`);
    }
  }

  if (data.session) {
    const userId = data.user?.id;

    if (!userId) {
      redirect("/login?signedUp=1");
    }

    const profile = await getProfileByUserId(userId);
    const defaultRoute = getDefaultRouteForRole(profile?.role);
    revalidatePath("/");
    redirect(`${defaultRoute}?signedUp=1`);
  }

  redirect(
    `/login?signedUp=1${inviteCode ? `&inviteCode=${encodeURIComponent(inviteCode)}` : ""}`
  );
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/login?loggedOut=1");
}
