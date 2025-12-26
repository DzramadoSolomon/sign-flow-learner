import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.22.4";

// Define allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://njukrhmykrxqvjjvnotv.lovable.app',
  'https://gsl-learning.lovable.app',
  'https://sign-flow-learner.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:8080',
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) return true;
  if (/^https:\/\/[a-z0-9-]+\.lovable\.app$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.lovableproject\.com$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  return false;
}

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isAllowedOrigin(origin) ? origin! : '';
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// Validation schema for request
const requestSchema = z.object({
  userEmail: z.string().email().max(255).toLowerCase(),
});

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Block unauthorized origins
  if (!corsHeaders['Access-Control-Allow-Origin']) {
    console.error('Unauthorized origin:', origin);
    return new Response(
      JSON.stringify({ error: 'Unauthorized origin' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    
    // Validate userEmail
    const validationResult = requestSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Invalid or missing email');
      return new Response(
        JSON.stringify({ data: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userEmail } = validationResult.data;
    console.log('Get purchases request for email:', userEmail);

    // Fetch purchases for the specific user email only
    const { data, error } = await supabaseAdmin
      .from('lesson_purchases')
      .select('lesson_id')
      .eq('user_email', userEmail)
      .eq('payment_status', 'success');

    if (error) {
      console.error('Error fetching purchases:', error);
      throw error;
    }

    console.log('Found purchases:', data?.length || 0);

    return new Response(
      JSON.stringify({ data: data || [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Get purchases error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
    );
  }
});
