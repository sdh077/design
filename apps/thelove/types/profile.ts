import type { Database } from "@/types/database";

export type ProfileRow = Database["the_love"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["the_love"]["Tables"]["profiles"]["Update"];
export type MemberProfileRow =
  Database["the_love"]["Tables"]["member_profiles"]["Row"];
export type MemberProfileUpdate =
  Database["the_love"]["Tables"]["member_profiles"]["Update"];
export type MemberPhotoRow =
  Database["the_love"]["Tables"]["member_photos"]["Row"];
export type MemberPhotoAsset = MemberPhotoRow & {
  signedUrl: string | null;
};
export type MemberMatchmakerRow =
  Database["the_love"]["Tables"]["member_matchmakers"]["Row"];

export type MemberProfileBundle = {
  profile: ProfileRow | null;
  memberProfile: MemberProfileRow | null;
  photos: MemberPhotoAsset[];
  matchmakerLinks: MemberMatchmakerRow[];
};
