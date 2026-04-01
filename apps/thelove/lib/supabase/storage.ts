import { createAdminClient } from "@/lib/supabase/admin";

export function getMemberPhotosBucket() {
  return process.env.NEXT_PUBLIC_SUPABASE_MEMBER_PHOTOS_BUCKET ?? "thelove-member-photos";
}

export async function createSignedPhotoUrl(storagePath: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(getMemberPhotosBucket())
    .createSignedUrl(storagePath, 60 * 60);

  if (error) {
    return null;
  }

  return data.signedUrl;
}
