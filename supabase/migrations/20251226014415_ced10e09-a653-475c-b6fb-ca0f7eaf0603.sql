-- Create lesson_completions table to track when users complete lessons
CREATE TABLE public.lesson_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure each user can only complete a lesson once
  UNIQUE(user_email, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE public.lesson_completions ENABLE ROW LEVEL SECURITY;

-- Anyone can view their own completions by email
CREATE POLICY "Users can view their own completions"
ON public.lesson_completions
FOR SELECT
USING (true);

-- Anyone can insert their own completions
CREATE POLICY "Users can insert their own completions"
ON public.lesson_completions
FOR INSERT
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_lesson_completions_user_email ON public.lesson_completions(user_email);
CREATE INDEX idx_lesson_completions_lesson_id ON public.lesson_completions(lesson_id);