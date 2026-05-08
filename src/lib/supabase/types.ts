/**
 * Hand-typed Database type for Brand Sport League.
 *
 * Mirrors supabase/migrations/0001_init.sql + 0002_views.sql. Regenerate via
 *   `npx supabase gen types typescript --linked > src/lib/supabase/types.ts`
 * once the project is linked, if you want the canonical machine-generated form.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      allowed_emails: {
        Row: {
          email: string;
          added_by: string | null;
          added_at: string;
        };
        Insert: {
          email: string;
          added_by?: string | null;
          added_at?: string;
        };
        Update: {
          email?: string;
          added_by?: string | null;
          added_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          user_id: string;
          full_name: string;
          nickname: string;
          height_cm: number;
          baseline_weight_kg: number;
          avatar_emoji: string;
          is_admin: boolean;
          registered_at: string;
        };
        Insert: {
          user_id: string;
          full_name: string;
          nickname: string;
          height_cm: number;
          baseline_weight_kg: number;
          avatar_emoji?: string;
          is_admin?: boolean;
          registered_at?: string;
        };
        Update: {
          user_id?: string;
          full_name?: string;
          nickname?: string;
          height_cm?: number;
          baseline_weight_kg?: number;
          avatar_emoji?: string;
          is_admin?: boolean;
          registered_at?: string;
        };
        Relationships: [];
      };
      step_logs: {
        Row: {
          user_id: string;
          log_date: string; // YYYY-MM-DD
          steps: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          log_date: string;
          steps: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          log_date?: string;
          steps?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      run_logs: {
        Row: {
          id: string;
          user_id: string;
          log_date: string;
          distance_km: number;
          duration_min: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          log_date: string;
          distance_km: number;
          duration_min: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          log_date?: string;
          distance_km?: number;
          duration_min?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      weight_logs: {
        Row: {
          user_id: string;
          log_date: string;
          weight_kg: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          log_date: string;
          weight_kg: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          log_date?: string;
          weight_kg?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      v_weekly_step_totals: {
        Row: {
          user_id: string;
          week_start: string;
          total_steps: number;
        };
        Relationships: [];
      };
      v_weekly_run_totals: {
        Row: {
          user_id: string;
          week_start: string;
          total_km: number;
          total_minutes: number;
          run_count: number;
        };
        Relationships: [];
      };
      v_weekly_weight_avg: {
        Row: {
          user_id: string;
          week_start: string;
          avg_weight_kg: number;
          baseline_weight_kg: number;
          loss_pct: number | null;
        };
        Relationships: [];
      };
      v_all_time_step_totals: {
        Row: {
          user_id: string;
          total_steps: number;
        };
        Relationships: [];
      };
      v_all_time_run_totals: {
        Row: {
          user_id: string;
          total_km: number;
          total_minutes: number;
          run_count: number;
        };
        Relationships: [];
      };
      v_current_weight_state: {
        Row: {
          user_id: string;
          baseline_weight_kg: number;
          latest_weight_kg: number | null;
          latest_log_date: string | null;
          loss_pct: number | null;
        };
        Relationships: [];
      };
      v_leaderboard_steps_all_time: {
        Row: {
          user_id: string;
          nickname: string;
          full_name: string;
          avatar_emoji: string;
          total_steps: number;
          rk: number;
        };
        Relationships: [];
      };
      v_leaderboard_run_all_time: {
        Row: {
          user_id: string;
          nickname: string;
          full_name: string;
          avatar_emoji: string;
          total_km: number;
          total_minutes: number;
          run_count: number;
          rk: number;
        };
        Relationships: [];
      };
      v_leaderboard_weight_all_time: {
        Row: {
          user_id: string;
          nickname: string;
          full_name: string;
          avatar_emoji: string;
          baseline_weight_kg: number;
          latest_weight_kg: number | null;
          latest_log_date: string | null;
          loss_pct: number | null;
          rk: number;
        };
        Relationships: [];
      };
      v_leaderboard_steps_weekly: {
        Row: {
          user_id: string;
          nickname: string;
          full_name: string;
          avatar_emoji: string;
          week_start: string;
          total_steps: number;
          rk: number;
        };
        Relationships: [];
      };
      v_leaderboard_run_weekly: {
        Row: {
          user_id: string;
          nickname: string;
          full_name: string;
          avatar_emoji: string;
          week_start: string;
          total_km: number;
          total_minutes: number;
          run_count: number;
          rk: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      week_start_for: {
        Args: { d: string };
        Returns: string;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenient row aliases used throughout the app.
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type StepLog = Database["public"]["Tables"]["step_logs"]["Row"];
export type RunLog = Database["public"]["Tables"]["run_logs"]["Row"];
export type WeightLog = Database["public"]["Tables"]["weight_logs"]["Row"];
export type AllowedEmail = Database["public"]["Tables"]["allowed_emails"]["Row"];

export type StepLeaderboardRow =
  Database["public"]["Views"]["v_leaderboard_steps_all_time"]["Row"];
export type RunLeaderboardRow =
  Database["public"]["Views"]["v_leaderboard_run_all_time"]["Row"];
export type WeightLeaderboardRow =
  Database["public"]["Views"]["v_leaderboard_weight_all_time"]["Row"];
export type WeeklyStepRow =
  Database["public"]["Views"]["v_leaderboard_steps_weekly"]["Row"];
export type WeeklyRunRow =
  Database["public"]["Views"]["v_leaderboard_run_weekly"]["Row"];
