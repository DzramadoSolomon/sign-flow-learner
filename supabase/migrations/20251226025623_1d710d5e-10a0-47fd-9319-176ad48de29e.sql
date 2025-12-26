-- Fix lesson_completions security - drop overly permissive SELECT policy
-- Access will now be handled through edge functions with service role
DROP POLICY IF EXISTS "Users can view their own completions" ON public.lesson_completions;
DROP POLICY IF EXISTS "Users can insert their own completions" ON public.lesson_completions;

-- Note: No SELECT/INSERT policies = no client access
-- All operations go through get-completions edge function with service role