import type { Database } from "@/types/database";
import type { MemberPhotoAsset, MemberProfileRow, ProfileRow } from "@/types/profile";

export type MatchRecord = Database["the_love"]["Tables"]["matches"]["Row"];
export type MatchReactionRecord =
  Database["the_love"]["Tables"]["match_reactions"]["Row"];
export type MatchStageLogRecord =
  Database["the_love"]["Tables"]["match_stage_logs"]["Row"];

export type MatchMemberSummary = {
  profile: ProfileRow | null;
  memberProfile: MemberProfileRow | null;
};

export type MatchSummary = MatchRecord & {
  male: MatchMemberSummary;
  female: MatchMemberSummary;
  reactions: MatchReactionRecord[];
  stageLogs: MatchStageLogRecord[];
};

export type MatchReactionStatus =
  | "waiting"
  | "one_like"
  | "both_like"
  | "has_pass";

export type MemberVisibleMatch = {
  match: MatchRecord;
  viewerRole: "male" | "female";
  isOpenToViewer: boolean;
  currentReaction: MatchReactionRecord | null;
  counterpart: {
    profile: ProfileRow | null;
    memberProfile: MemberProfileRow | null;
    photos: MemberPhotoAsset[];
  };
};
