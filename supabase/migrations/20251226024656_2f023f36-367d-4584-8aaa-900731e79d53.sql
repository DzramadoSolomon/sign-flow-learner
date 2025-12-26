-- Drop dictionary admin policies that use has_role (fails with custom auth)
-- These will now be handled via edge functions with service role
DROP POLICY IF EXISTS "Admins can insert dictionary words" ON public.dictionary;
DROP POLICY IF EXISTS "Admins can update dictionary words" ON public.dictionary;
DROP POLICY IF EXISTS "Admins can delete dictionary words" ON public.dictionary;