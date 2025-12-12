import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { hashSync, compareSync } from "https://esm.sh/bcryptjs@2.4.3";

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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, email, password, full_name, phone, user_id, current_password, new_password, profile_data } = await req.json();

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

      // Hash password using bcryptjs (synchronous, works in Edge Runtime)
      const password_hash = hashSync(password, 10);

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

      // Verify password using bcryptjs
      const validPassword = compareSync(password, user.password_hash);
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

    } else if (action === 'update_profile') {
      if (!user_id || !profile_data) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing user_id or profile_data' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: profile_data.name,
          email: profile_data.email.toLowerCase(),
          phone: profile_data.phone,
        })
        .eq('id', user_id);

      if (updateError) {
        console.error('Update profile error:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update profile' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'update_password') {
      if (!user_id || !current_password || !new_password) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required fields' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Fetch current password hash
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', user_id)
        .single();

      if (fetchError || !userData) {
        return new Response(
          JSON.stringify({ success: false, error: 'User not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      // Verify current password
      const validPassword = compareSync(current_password, userData.password_hash);
      if (!validPassword) {
        return new Response(
          JSON.stringify({ success: false, error: 'Current password is incorrect' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      // Hash new password
      const newPasswordHash = hashSync(new_password, 10);

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', user_id);

      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update password' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
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
