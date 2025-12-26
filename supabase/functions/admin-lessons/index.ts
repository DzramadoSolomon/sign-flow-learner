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

// Validation schema for lesson data
const lessonSchema = z.object({
  lesson_id: z.string().min(1).max(50).regex(/^[a-zA-Z0-9-]+$/),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().int().min(1).max(180),
  lesson_order: z.number().int().min(1).max(1000),
  objectives: z.array(z.string().max(500)).max(10).nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).nullable().optional(),
  video_url: z.string().max(500).nullable().optional(),
  notes: z.string().max(10000).nullable().optional(),
  quiz: z.array(z.record(z.unknown())).max(20).nullable().optional(),
  exercises: z.array(z.record(z.unknown())).max(20).nullable().optional(),
  is_published: z.boolean().optional(),
});

// Schema for update (all fields optional except the ones being updated)
const lessonUpdateSchema = lessonSchema.partial().omit({ lesson_id: true });

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

    const { action, userId, lessonData, lessonId } = await req.json();

    console.log('Admin lessons request:', { action, userId, lessonId });

    // Verify the user is an admin
    if (!userId) {
      console.error('No userId provided');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      console.error('Unauthorized access attempt:', { userId, roleError, roleData });
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Admin verified:', userId);

    let result;

    switch (action) {
      case 'create': {
        // Validate input data
        const validationResult = lessonSchema.safeParse(lessonData);
        if (!validationResult.success) {
          const messages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
          console.error('Validation failed:', messages);
          return new Response(
            JSON.stringify({ error: `Validation failed: ${messages}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Creating lesson:', validationResult.data.lesson_id);
        const { data: createData, error: createError } = await supabaseAdmin
          .from('lessons')
          .insert(validationResult.data)
          .select()
          .single();

        if (createError) {
          console.error('Create error:', createError);
          throw createError;
        }
        result = createData;
        break;
      }

      case 'update': {
        // Validate input data for update
        const validationResult = lessonUpdateSchema.safeParse(lessonData);
        if (!validationResult.success) {
          const messages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
          console.error('Validation failed:', messages);
          return new Response(
            JSON.stringify({ error: `Validation failed: ${messages}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate lessonId
        if (!lessonId || typeof lessonId !== 'string' || lessonId.length > 50) {
          return new Response(
            JSON.stringify({ error: 'Invalid lesson ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Updating lesson:', lessonId);
        const { data: updateData, error: updateError } = await supabaseAdmin
          .from('lessons')
          .update(validationResult.data)
          .eq('lesson_id', lessonId)
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
        result = updateData;
        break;
      }

      case 'delete': {
        // Validate lessonId
        if (!lessonId || typeof lessonId !== 'string' || lessonId.length > 50) {
          return new Response(
            JSON.stringify({ error: 'Invalid lesson ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Deleting lesson:', lessonId);
        const { error: deleteError } = await supabaseAdmin
          .from('lessons')
          .delete()
          .eq('lesson_id', lessonId);

        if (deleteError) {
          console.error('Delete error:', deleteError);
          throw deleteError;
        }
        result = { success: true };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('Operation successful:', action);
    return new Response(
      JSON.stringify({ data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Admin lessons error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' } }
    );
  }
});
