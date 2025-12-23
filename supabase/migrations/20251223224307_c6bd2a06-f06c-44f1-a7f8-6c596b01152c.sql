-- Drop the overly permissive RLS policies on users table
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- With RLS enabled and no SELECT/UPDATE policies, direct client access is denied
-- The edge function uses service role key which bypasses RLS, so auth still works

-- Optional: If you later migrate to Supabase Auth, you can add proper policies like:
-- CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);