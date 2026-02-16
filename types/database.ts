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
    };
  };
}
