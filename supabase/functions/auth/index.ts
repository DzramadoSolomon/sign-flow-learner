import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

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
    const supabaseUrl = Deno.env.get('USER_SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('USER_SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, email, password, full_name, phone } = await req.json();

    if (action === 'signup') {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (existingUser) {
        return new Response(
          JSON.stringify({ success: false, error: 'An account with this email already exists' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Insert new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          full_name,
          email: email.toLowerCase(),
          phone,
          password_hash,
        })
        .select('id, full_name, email, phone, created_at')
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create account' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      console.log('User created successfully:', newUser.id);
      return new Response(
        JSON.stringify({ success: true, user: newUser }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'login') {
      // Find user by email
      const { data: user, error: findError } = await supabase
        .from('users')
        .select('id, full_name, email, phone, password_hash, created_at')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (findError || !user) {
        console.log('User not found:', email);
        return new Response(
          JSON.stringify({ success: false, error: 'No account found with this email' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        console.log('Invalid password for user:', email);
        return new Response(
          JSON.stringify({ success: false, error: 'Incorrect password' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      // Return user without password_hash
      const { password_hash, ...safeUser } = user;
      console.log('User logged in successfully:', safeUser.id);
      return new Response(
        JSON.stringify({ success: true, user: safeUser }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error('Auth function error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
