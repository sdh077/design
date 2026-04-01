export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "member" | "matchmaker" | "admin";
export type Gender = "male" | "female";
export type MemberProfileStatus = "draft" | "published" | "hidden";
export type MemberMatchmakerStatus = "active" | "inactive";
export type MatchStatus = "active" | "closed";
export type MatchReaction = "like" | "pass";

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  the_love: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: AppRole;
          name: string | null;
          gender: Gender | null;
          birth_year: number | null;
          phone: string | null;
          church_name: string | null;
          denomination: string | null;
          region_text: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: AppRole;
          name?: string | null;
          gender?: Gender | null;
          birth_year?: number | null;
          phone?: string | null;
          church_name?: string | null;
          denomination?: string | null;
          region_text?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: AppRole;
          name?: string | null;
          gender?: Gender | null;
          birth_year?: number | null;
          phone?: string | null;
          church_name?: string | null;
          denomination?: string | null;
          region_text?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      member_profiles: {
        Row: {
          user_id: string;
          intro_name_age: string | null;
          job_text: string | null;
          joy_text: string | null;
          dating_view_text: string | null;
          height: number | null;
          education_text: string | null;
          marriage_view_text: string | null;
          preferred_traits: string[];
          deal_breakers: string[];
          contact_phone: string | null;
          contact_kakao: string | null;
          profile_status: MemberProfileStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          intro_name_age?: string | null;
          job_text?: string | null;
          joy_text?: string | null;
          dating_view_text?: string | null;
          height?: number | null;
          education_text?: string | null;
          marriage_view_text?: string | null;
          preferred_traits?: string[];
          deal_breakers?: string[];
          contact_phone?: string | null;
          contact_kakao?: string | null;
          profile_status?: MemberProfileStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          intro_name_age?: string | null;
          job_text?: string | null;
          joy_text?: string | null;
          dating_view_text?: string | null;
          height?: number | null;
          education_text?: string | null;
          marriage_view_text?: string | null;
          preferred_traits?: string[];
          deal_breakers?: string[];
          contact_phone?: string | null;
          contact_kakao?: string | null;
          profile_status?: MemberProfileStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      member_photos: {
        Row: {
          id: string;
          user_id: string;
          storage_path: string;
          sort_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          storage_path: string;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          storage_path?: string;
          sort_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      matchmaker_codes: {
        Row: {
          id: string;
          matchmaker_user_id: string;
          code: string;
          is_active: boolean;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          matchmaker_user_id: string;
          code: string;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          matchmaker_user_id?: string;
          code?: string;
          is_active?: boolean;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      member_matchmakers: {
        Row: {
          id: string;
          member_user_id: string;
          matchmaker_user_id: string;
          status: MemberMatchmakerStatus;
          invited_by_code: string | null;
          connected_at: string;
        };
        Insert: {
          id?: string;
          member_user_id: string;
          matchmaker_user_id: string;
          status?: MemberMatchmakerStatus;
          invited_by_code?: string | null;
          connected_at?: string;
        };
        Update: {
          id?: string;
          member_user_id?: string;
          matchmaker_user_id?: string;
          status?: MemberMatchmakerStatus;
          invited_by_code?: string | null;
          connected_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          matchmaker_user_id: string;
          male_user_id: string;
          female_user_id: string;
          status: MatchStatus;
          open_for_male: boolean;
          open_for_female: boolean;
          current_stage: number;
          closed_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          matchmaker_user_id: string;
          male_user_id: string;
          female_user_id: string;
          status?: MatchStatus;
          open_for_male?: boolean;
          open_for_female?: boolean;
          current_stage?: number;
          closed_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          matchmaker_user_id?: string;
          male_user_id?: string;
          female_user_id?: string;
          status?: MatchStatus;
          open_for_male?: boolean;
          open_for_female?: boolean;
          current_stage?: number;
          closed_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      match_reactions: {
        Row: {
          id: string;
          match_id: string;
          user_id: string;
          reaction: MatchReaction;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          user_id: string;
          reaction: MatchReaction;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          user_id?: string;
          reaction?: MatchReaction;
          created_at?: string;
        };
        Relationships: [];
      };
      match_stage_logs: {
        Row: {
          id: string;
          match_id: string;
          changed_by: string;
          from_stage: number | null;
          to_stage: number | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          changed_by: string;
          from_stage?: number | null;
          to_stage?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          changed_by?: string;
          from_stage?: number | null;
          to_stage?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
