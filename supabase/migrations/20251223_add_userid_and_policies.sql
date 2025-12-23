-- Add user_id column and update RLS policies for lesson_purchases
ALTER TABLE public.lesson_purchases
  ADD COLUMN IF NOT EXISTS user_id UUID NULL;

CREATE INDEX IF NOT EXISTS idx_lesson_purchases_user_id ON public.lesson_purchases(user_id);

-- Drop overly permissive policies (if they exist) and create tighter policies
DROP POLICY IF EXISTS "Users can insert their own purchases" ON public.lesson_purchases;
DROP POLICY IF EXISTS "Users can read their own purchases" ON public.lesson_purchases;

-- Allow inserts only when the authenticated user id matches the user_id column
CREATE POLICY "Users can insert their own purchases"
  ON public.lesson_purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow selects only for the owner
CREATE POLICY "Users can read their own purchases"
  ON public.lesson_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- (Service role will bypass RLS for server-side inserts/queries)

-- Optional: If you need to query by email server-side, do so via service role client
