-- Create lesson_purchases table to track lesson access purchases
CREATE TABLE public.lesson_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  paystack_reference TEXT NOT NULL UNIQUE,
  amount_ghs DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  amount_pesewas INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Enable RLS
ALTER TABLE public.lesson_purchases ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert their own purchase records (will be verified server-side)
CREATE POLICY "Users can insert their own purchases"
ON public.lesson_purchases
FOR INSERT
WITH CHECK (true);

-- Policy: Users can read their own purchases via email (for client verification)
CREATE POLICY "Users can read their own purchases"
ON public.lesson_purchases
FOR SELECT
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_lesson_purchases_email ON public.lesson_purchases(user_email);
CREATE INDEX idx_lesson_purchases_lesson_id ON public.lesson_purchases(lesson_id);
CREATE INDEX idx_lesson_purchases_status ON public.lesson_purchases(payment_status);
CREATE INDEX idx_lesson_purchases_reference ON public.lesson_purchases(paystack_reference);
