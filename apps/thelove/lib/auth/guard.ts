import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMemberProfileBundle, getProfileByUserId } from "@/lib/db/profile";
import type { Role } from "@/types/auth";

export async function requireUser() {
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

export async function requireProfile() {
  const { supabase, user } = await requireUser();
  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  return { supabase, user, profile };
}

export async function requireRole(roles: Role[]) {
  const { supabase, user, profile } = await requireProfile();

  if (!roles.includes(profile.role)) {
    redirect("/onboarding");
  }

  return { supabase, user, profile };
}

export async function requireMemberBundle() {
  const { supabase, user, profile } = await requireProfile();
  const bundle = await getMemberProfileBundle(user.id);

  return {
    supabase,
    user,
    profile,
    bundle,
  };
}
