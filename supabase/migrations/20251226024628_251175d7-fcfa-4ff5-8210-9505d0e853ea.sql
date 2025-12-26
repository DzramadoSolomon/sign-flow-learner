-- Fix security vulnerabilities in RLS policies
-- Drop overly permissive policies on lessons table (these had USING (true))
DROP POLICY IF EXISTS "Admins can insert lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON public.lessons;

-- Drop overly permissive policies on lesson_purchases table
DROP POLICY IF EXISTS "Anyone can view their own purchases by email" ON public.lesson_purchases;
DROP POLICY IF EXISTS "Users can read their own purchases" ON public.lesson_purchases;

-- Note: We don't recreate admin policies for lessons because:
-- 1. The custom auth system means auth.uid() returns NULL
-- 2. Admin operations will now go through edge functions with service role
-- 3. Only the SELECT policy remains for public reading of published lessons

-- Note: We don't recreate SELECT policy for lesson_purchases because:
-- 1. The custom auth system means we can't identify the user in RLS
-- 2. Purchase data will be accessed through the get-purchases edge function
-- 3. Edge function insert remains for payment verification