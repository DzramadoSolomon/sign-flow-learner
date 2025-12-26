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

    const { action, userId, wordData, wordId } = await req.json();

    console.log('Admin dictionary request:', { action, userId, wordId });

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
      case 'create':
        console.log('Creating word:', wordData?.word);
        const { data: createData, error: createError } = await supabaseAdmin
          .from('dictionary')
          .insert(wordData)
          .select()
          .single();

        if (createError) {
          console.error('Create error:', createError);
          throw createError;
        }
        result = createData;
        break;

      case 'update':
        console.log('Updating word:', wordId);
        const { data: updateData, error: updateError } = await supabaseAdmin
          .from('dictionary')
          .update(wordData)
          .eq('id', wordId)
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
        result = updateData;
        break;

      case 'delete':
        console.log('Deleting word:', wordId);
        const { error: deleteError } = await supabaseAdmin
          .from('dictionary')
          .delete()
          .eq('id', wordId);

        if (deleteError) {
          console.error('Delete error:', deleteError);
          throw deleteError;
        }
        result = { success: true };
        break;

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
    console.error('Admin dictionary error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
