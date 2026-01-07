-- Run this in your Supabase SQL Editor

ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS series_id text;

ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS tournament_id text;

ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS match_code text;

ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS started_at timestamptz;

ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS completed_at timestamptz;

ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS expires_at timestamptz;
