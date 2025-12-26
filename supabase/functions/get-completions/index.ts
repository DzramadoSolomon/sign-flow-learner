import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client with service role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { userEmail, action, lessonId, userId } = await req.json();

    console.log('Get completions request:', { userEmail, action, lessonId });

    if (!userEmail) {
      console.log('No email provided');
      return new Response(
        JSON.stringify({ data: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different actions
    if (action === 'mark_complete') {
      // Mark a lesson as complete
      console.log('Marking lesson complete:', lessonId);
      
      const { data, error } = await supabaseAdmin
        .from('lesson_completions')
        .insert({
          user_email: userEmail.toLowerCase(),
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
        .eq('user_email', userEmail.toLowerCase())
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
      .eq('user_email', userEmail.toLowerCase());

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
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
