-- Create dictionary table
CREATE TABLE public.dictionary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  description TEXT NOT NULL,
  video_id TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dictionary ENABLE ROW LEVEL SECURITY;

-- Anyone can view dictionary words
CREATE POLICY "Anyone can view dictionary words"
ON public.dictionary
FOR SELECT
USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert dictionary words"
ON public.dictionary
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update dictionary words"
ON public.dictionary
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete dictionary words"
ON public.dictionary
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_dictionary_updated_at
BEFORE UPDATE ON public.dictionary
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing dictionary data
INSERT INTO public.dictionary (word, description, video_id, category) VALUES
('Apple', 'A common fruit', 'dQw4w9WgXcQ', 'Food'),
('Animal', 'Living creatures', 'dQw4w9WgXcQ', 'Nature'),
('Ask', 'To request information', 'dQw4w9WgXcQ', 'Action'),
('Baby', 'A young child', 'dQw4w9WgXcQ', 'Family'),
('Book', 'Written or printed pages', 'dQw4w9WgXcQ', 'Objects'),
('Brother', 'Male sibling', 'dQw4w9WgXcQ', 'Family'),
('Cat', 'A domestic feline', 'dQw4w9WgXcQ', 'Animals'),
('Car', 'A motor vehicle', 'dQw4w9WgXcQ', 'Transport'),
('Come', 'Move towards', 'dQw4w9WgXcQ', 'Action'),
('Dog', 'A domestic canine', 'dQw4w9WgXcQ', 'Animals'),
('Door', 'Entry/exit point', 'dQw4w9WgXcQ', 'Objects'),
('Drink', 'To consume liquid', 'dQw4w9WgXcQ', 'Action'),
('Eat', 'To consume food', 'dQw4w9WgXcQ', 'Action'),
('Eye', 'Organ for seeing', 'dQw4w9WgXcQ', 'Body'),
('Evening', 'End of day', 'dQw4w9WgXcQ', 'Time'),
('Father', 'Male parent', 'dQw4w9WgXcQ', 'Family'),
('Food', 'What we eat', 'dQw4w9WgXcQ', 'Food'),
('Friend', 'A companion', 'dQw4w9WgXcQ', 'People'),
('Go', 'To move/travel', 'dQw4w9WgXcQ', 'Action'),
('Good', 'Positive quality', 'dQw4w9WgXcQ', 'Adjective'),
('Goodbye', 'Farewell greeting', 'dQw4w9WgXcQ', 'Greetings'),
('Hello', 'A greeting', 'dQw4w9WgXcQ', 'Greetings'),
('Help', 'To assist', 'dQw4w9WgXcQ', 'Action'),
('House', 'A dwelling', 'dQw4w9WgXcQ', 'Places'),
('I', 'First person pronoun', 'dQw4w9WgXcQ', 'Pronouns'),
('Ice', 'Frozen water', 'dQw4w9WgXcQ', 'Nature'),
('Job', 'Work/employment', 'dQw4w9WgXcQ', 'Work'),
('Jump', 'To leap', 'dQw4w9WgXcQ', 'Action'),
('Key', 'Tool for locks', 'dQw4w9WgXcQ', 'Objects'),
('Kind', 'Caring nature', 'dQw4w9WgXcQ', 'Adjective'),
('Learn', 'To gain knowledge', 'dQw4w9WgXcQ', 'Action'),
('Love', 'Deep affection', 'dQw4w9WgXcQ', 'Emotions'),
('Mother', 'Female parent', 'dQw4w9WgXcQ', 'Family'),
('Money', 'Currency', 'dQw4w9WgXcQ', 'Objects'),
('Morning', 'Start of day', 'dQw4w9WgXcQ', 'Time'),
('Name', 'What you''re called', 'dQw4w9WgXcQ', 'Identity'),
('Night', 'Dark hours', 'dQw4w9WgXcQ', 'Time'),
('No', 'Negative response', 'dQw4w9WgXcQ', 'Response'),
('Open', 'Not closed', 'dQw4w9WgXcQ', 'Action'),
('Orange', 'A citrus fruit', 'dQw4w9WgXcQ', 'Food'),
('Please', 'Polite request', 'dQw4w9WgXcQ', 'Polite'),
('Phone', 'Communication device', 'dQw4w9WgXcQ', 'Objects'),
('Question', 'An inquiry', 'dQw4w9WgXcQ', 'Communication'),
('Quiet', 'Low noise', 'dQw4w9WgXcQ', 'Adjective'),
('Rain', 'Water from sky', 'dQw4w9WgXcQ', 'Weather'),
('Run', 'Fast movement', 'dQw4w9WgXcQ', 'Action'),
('School', 'Place of learning', 'dQw4w9WgXcQ', 'Places'),
('Sister', 'Female sibling', 'dQw4w9WgXcQ', 'Family'),
('Sorry', 'Expression of regret', 'dQw4w9WgXcQ', 'Polite'),
('Thank you', 'Expression of gratitude', 'dQw4w9WgXcQ', 'Polite'),
('Teacher', 'One who instructs', 'dQw4w9WgXcQ', 'People'),
('Time', 'Hours and minutes', 'dQw4w9WgXcQ', 'Time'),
('Understand', 'To comprehend', 'dQw4w9WgXcQ', 'Action'),
('Us', 'Pronoun for group', 'dQw4w9WgXcQ', 'Pronouns'),
('Very', 'To a high degree', 'dQw4w9WgXcQ', 'Adverb'),
('Visit', 'To go see', 'dQw4w9WgXcQ', 'Action'),
('Water', 'Essential liquid', 'dQw4w9WgXcQ', 'Nature'),
('Work', 'Employment/labor', 'dQw4w9WgXcQ', 'Work'),
('Write', 'To record text', 'dQw4w9WgXcQ', 'Action'),
('X-ray', 'Medical imaging', 'dQw4w9WgXcQ', 'Medical'),
('Yes', 'Affirmative response', 'dQw4w9WgXcQ', 'Response'),
('You', 'Second person pronoun', 'dQw4w9WgXcQ', 'Pronouns'),
('Yesterday', 'The day before', 'dQw4w9WgXcQ', 'Time'),
('Zero', 'Number 0', 'dQw4w9WgXcQ', 'Numbers');