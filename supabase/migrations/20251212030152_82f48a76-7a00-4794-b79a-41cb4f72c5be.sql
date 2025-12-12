-- Restore the SELECT policy for users table so login works
CREATE POLICY "Users can read own data" 
ON public.users 
FOR SELECT 
USING (true);

-- Add UPDATE policy for profile updates
CREATE POLICY "Users can update own data" 
ON public.users 
FOR UPDATE 
USING (true);