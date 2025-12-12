-- Drop the insecure policy that exposes all user data
DROP POLICY IF EXISTS "Users can read own data" ON public.users;

-- The users table should NOT be directly queryable by clients
-- All auth operations go through the edge function with service role
-- We keep INSERT for signup but remove SELECT access from clients

-- Add UPDATE policy so edge function can update (via service role)
-- No client-side policies needed since edge function uses service role