-- Run this in your Supabase SQL Editor to ensure ALL required columns exist

-- Player Tracking (The source of your current bug)
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS striker text;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS non_striker text;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS current_bowler text;

-- Game State
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS current_innings integer DEFAULT 1;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS current_over integer DEFAULT 0;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS current_ball integer DEFAULT 0;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS status text DEFAULT 'live';

-- JSONB Data Fields (Teams, Toss, Innings)
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS team1 JSONB;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS team2 JSONB;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS toss JSONB;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS innings1 JSONB;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS innings2 JSONB;

-- Meta
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS match_type text;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS team_size integer;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS overs_per_innings integer;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS result text;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS winner text;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS man_of_match JSONB;
