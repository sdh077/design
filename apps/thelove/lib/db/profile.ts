import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createSignedPhotoUrl } from "@/lib/supabase/storage";
import type {
  MemberPhotoAsset,
  MemberPhotoRow,
  MemberProfileBundle,
  MemberProfileRow,
  ProfileRow,
} from "@/types/profile";

export async function getProfileByUserId(
  userId: string
): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function getDefaultRouteForRole(
  role: ProfileRow["role"] | null | undefined
) {
  if (role === "matchmaker" || role === "admin") {
    return "/matchmaker";
  }

  return "/onboarding";
}

export async function getMemberProfileByUserId(
  userId: string
): Promise<MemberProfileRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("member_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getMemberProfileBundle(
  userId: string
): Promise<MemberProfileBundle> {
  const supabase = await createClient();

  const [profileResult, memberProfileResult, photosResult, matchmakersResult] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("member_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("member_photos")
        .select("*")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("member_matchmakers")
        .select("*")
        .eq("member_user_id", userId)
        .order("connected_at", { ascending: false }),
    ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  if (memberProfileResult.error) {
    throw new Error(memberProfileResult.error.message);
  }

  if (photosResult.error) {
    throw new Error(photosResult.error.message);
  }

  if (matchmakersResult.error) {
    throw new Error(matchmakersResult.error.message);
  }

  return {
    profile: profileResult.data,
    memberProfile: memberProfileResult.data,
    photos: await attachSignedUrls(photosResult.data ?? []),
    matchmakerLinks: matchmakersResult.data ?? [],
  };
}

export async function attachSignedUrls(
  photos: MemberPhotoRow[]
): Promise<MemberPhotoAsset[]> {
  return Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      signedUrl: await createSignedPhotoUrl(photo.storage_path),
    }))
  );
}

export async function getMemberPhotoAssets(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("member_photos")
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return attachSignedUrls(data ?? []);
}
