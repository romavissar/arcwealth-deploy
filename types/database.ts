export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      topics: {
        Row: {
          id: string;
          topic_id: string;
          level_number: number;
          section_number: number;
          lesson_number: number;
          title: string;
          description: string | null;
          topic_type: string;
          xp_reward: number;
          order_index: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["topics"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["topics"]["Insert"]>;
      };
      lesson_content: {
        Row: {
          id: string;
          topic_id: string | null;
          content_type: string;
          content: Json;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["lesson_content"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lesson_content"]["Insert"]>;
      };
      glossary: {
        Row: {
          id: string;
          term: string;
          definition: string;
          example: string | null;
          related_topic_ids: string[] | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["glossary"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["glossary"]["Insert"]>;
      };
      user_profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          email: string | null;
          birth_date: string | null;
          school: string | null;
          country: string | null;
          city: string | null;
          gender: string | null;
          grade_level: string | null;
          learning_goal: string | null;
          guardian_email: string | null;
          role: string;
          xp: number;
          level: number;
          rank: string;
          streak_days: number;
          last_activity_date: string | null;
          hearts: number;
          max_hearts: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_profiles"]["Row"], "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Insert"]>;
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          topic_id: string;
          status: string;
          score: number | null;
          xp_earned: number | null;
          attempts: number;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_progress"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_progress"]["Insert"]>;
      };
      user_textbook_progress: {
        Row: {
          id: string;
          user_id: string;
          topic_id: string;
          completed_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_textbook_progress"]["Row"], "id" | "created_at" | "completed_at"> & {
          id?: string;
          created_at?: string;
          completed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_textbook_progress"]["Insert"]>;
      };
      xp_events: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          reason: string;
          topic_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["xp_events"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["xp_events"]["Insert"]>;
      };
      achievements: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string;
          icon: string;
          xp_reward: number;
        };
        Insert: Omit<Database["public"]["Tables"]["achievements"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["achievements"]["Insert"]>;
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_slug: string;
          earned_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_achievements"]["Row"], "id" | "earned_at"> & {
          id?: string;
          earned_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_achievements"]["Insert"]>;
      };
      admin_config: {
        Row: {
          id: number;
          allowed_student_email_endings: Json;
          updated_at: string | null;
        };
        Insert: { id?: number; allowed_student_email_endings?: Json; updated_at?: string | null };
        Update: Partial<Database["public"]["Tables"]["admin_config"]["Insert"]>;
      };
      student_teacher: {
        Row: {
          student_user_id: string;
          teacher_user_id: string;
          created_at: string | null;
        };
        Insert: { student_user_id: string; teacher_user_id: string; created_at?: string | null };
        Update: Partial<Database["public"]["Tables"]["student_teacher"]["Insert"]>;
      };
      auth_user: {
        Row: {
          id: string;
          email: string;
          email_verified_at: string | null;
          password_hash: string | null;
          first_name: string | null;
          last_name: string | null;
          birth_date: string | null;
          two_factor_enabled: boolean;
          parental_approval_required: boolean;
          parental_approval_requested_at: string | null;
          parental_approved_at: string | null;
          parental_approver_name: string | null;
          parental_agreement_version: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          email_verified_at?: string | null;
          password_hash?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          birth_date?: string | null;
          two_factor_enabled?: boolean;
          parental_approval_required?: boolean;
          parental_approval_requested_at?: string | null;
          parental_approved_at?: string | null;
          parental_approver_name?: string | null;
          parental_agreement_version?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["auth_user"]["Insert"]>;
      };
      auth_session: {
        Row: {
          id: string;
          user_id: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          expires_at: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["auth_session"]["Insert"]>;
      };
      oauth_account: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          provider_account_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          provider_account_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["oauth_account"]["Insert"]>;
      };
      auth_token: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          purpose: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          purpose: string;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["auth_token"]["Insert"]>;
      };
      user_id_migration: {
        Row: {
          old_id: string;
          new_id: string;
          migrated_at: string;
        };
        Insert: {
          old_id: string;
          new_id: string;
          migrated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_id_migration"]["Insert"]>;
      };
      app_config: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["app_config"]["Insert"]>;
      };
    };
  };
}
