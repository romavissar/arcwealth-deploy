export type ProgressStatus = "locked" | "available" | "in_progress" | "completed";

export interface UserProfile {
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
}

export interface UserProgress {
  id: string;
  user_id: string;
  topic_id: string;
  status: ProgressStatus;
  score: number | null;
  xp_earned: number | null;
  attempts: number;
  completed_at: string | null;
  created_at: string;
}
