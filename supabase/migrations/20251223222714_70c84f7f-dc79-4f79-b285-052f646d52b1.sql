-- Create lesson_purchases table to track payments for premium lessons
CREATE TABLE public.lesson_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_id UUID,
  lesson_id TEXT NOT NULL,
  paystack_reference TEXT NOT NULL UNIQUE,
  amount_ghs DECIMAL(10,2) NOT NULL,
  amount_pesewas INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GHS',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view their own purchases by email"
ON public.lesson_purchases
FOR SELECT
USING (true);

CREATE POLICY "Edge functions can insert purchases"
ON public.lesson_purchases
FOR INSERT
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_lesson_purchases_updated_at
BEFORE UPDATE ON public.lesson_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_lesson_purchases_email ON public.lesson_purchases(user_email);
CREATE INDEX idx_lesson_purchases_reference ON public.lesson_purchases(paystack_reference);