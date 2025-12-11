-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create lessons table to store lesson content
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id TEXT NOT NULL UNIQUE, -- e.g., "beginner-1"
  title TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration INTEGER DEFAULT 15, -- in minutes
  lesson_order INTEGER NOT NULL DEFAULT 1,
  objectives JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  notes TEXT, -- Markdown content
  quiz JSONB DEFAULT '[]'::jsonb, -- Array of quiz questions
  exercises JSONB DEFAULT '[]'::jsonb, -- Array of exercises
  -- Mode-specific content for dual-mode lessons
  deaf_content JSONB, -- { videoUrl, notes, quiz, exercises }
  hearing_content JSONB, -- { videoUrl, notes, quiz, exercises }
  is_dual_mode BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published lessons (public content)
CREATE POLICY "Anyone can view published lessons" 
ON public.lessons 
FOR SELECT 
USING (is_published = true);

-- Create indexes for faster queries
CREATE INDEX idx_lessons_level ON public.lessons(level);
CREATE INDEX idx_lessons_order ON public.lessons(lesson_order);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();