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

// Validation schemas
const baseRequestSchema = z.object({
  userEmail: z.string().email().max(255),
  action: z.enum(['get_completions', 'mark_complete', 'get_streak']).optional(),
  lessonId: z.string().min(1).max(50).regex(/^[a-zA-Z0-9-]+$/).optional(),
  userId: z.string().uuid().nullable().optional(),
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
    
    // Validate request
    const validationResult = baseRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Validation failed:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ data: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userEmail, action, lessonId, userId } = validationResult.data;
    const normalizedEmail = userEmail.toLowerCase();

    console.log('Get completions request:', { userEmail: normalizedEmail, action, lessonId });

    // Handle different actions
    if (action === 'mark_complete') {
      if (!lessonId) {
        return new Response(
          JSON.stringify({ error: 'Lesson ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Marking lesson complete:', lessonId);
      
      const { data, error } = await supabaseAdmin
        .from('lesson_completions')
        .insert({
          user_email: normalizedEmail,
          lesson_id: lessonId,
          user_id: userId || null,
        })
        .select()
        .single();

      if (error) {
        // If it's a duplicate error, it's already completed - that's fine
        if (error.code === '23505') {
          console.log('Lesson already completed');
          return new Response(
            JSON.stringify({ success: true, alreadyCompleted: true }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        console.error('Error marking lesson complete:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_streak') {
      // Fetch completions for streak calculation
      const { data, error } = await supabaseAdmin
        .from('lesson_completions')
        .select('completed_at')
        .eq('user_email', normalizedEmail)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching completions for streak:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ data: data || [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Default: fetch lesson IDs for the user
    const { data, error } = await supabaseAdmin
      .from('lesson_completions')
      .select('lesson_id')
      .eq('user_email', normalizedEmail);

    if (error) {
      console.error('Error fetching completions:', error);
      throw error;
    }

    console.log('Found completions:', data?.length || 0);

    return new Response(
      JSON.stringify({ data: data || [] }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Get completions error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
    );
  }
});
