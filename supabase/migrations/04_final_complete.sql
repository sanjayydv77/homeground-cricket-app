-- ============================================================================
-- FINAL FIX SCRIPT (Run this in Supabase SQL Editor)
-- based on your provided schema + missing requirements
-- ============================================================================

-- 1. ADD MISSING COLUMN
-- Your previous script was missing 'history' which stores the ball-by-ball data.
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS history JSONB DEFAULT '[]'::jsonb;

-- 2. FIX PERMISSIONS (RLS)
-- If Row Level Security is on but no policies exist, SAVING WILL FAIL silently.
-- This causes the "loop" where you select openers but it never saves.
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Remove old policies to ensure a clean slate
DROP POLICY IF EXISTS "Public Read" ON public.matches;
DROP POLICY IF EXISTS "Public Insert" ON public.matches;
DROP POLICY IF EXISTS "Public Update" ON public.matches;
DROP POLICY IF EXISTS "Public Delete" ON public.matches;

-- Create Open Policies (Allows your app to work without login for now)
CREATE POLICY "Public Read" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public Insert" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.matches FOR UPDATE USING (true);
CREATE POLICY "Public Delete" ON public.matches FOR DELETE USING (true);
