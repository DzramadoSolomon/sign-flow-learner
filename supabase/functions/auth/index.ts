import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import bcrypt from "https://esm.sh/bcryptjs@2.4.3";
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

function getCorsHeaders(origin: string | null): Record<string, string> {
  // Allow any .vercel.app or .lovable.app subdomain
  const isAllowed = origin && (
    ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed.replace(/\/$/, ''))) ||
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.lovable.app')
  );
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// Validation schemas
const signupSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
  email: z.string().email('Invalid email').max(255, 'Email too long').trim().toLowerCase(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone format').optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email').max(255).trim().toLowerCase(),
  password: z.string().min(1, 'Password required').max(128),
});

const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').trim(),
  email: z.string().email('Invalid email').max(255, 'Email too long').trim().toLowerCase(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone format').optional().nullable().or(z.literal('')),
});

const passwordUpdateSchema = z.object({
  current_password: z.string().min(1, 'Current password required').max(128),
  new_password: z.string().min(8, 'New password must be at least 8 characters').max(128),
});

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if origin is allowed for non-OPTIONS requests
  if (!corsHeaders['Access-Control-Allow-Origin']) {
    console.warn('Blocked request from unauthorized origin:', origin);
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized origin' }),
      { headers: { 'Content-Type': 'application/json' }, status: 403 }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, email, password, full_name, phone, user_id, current_password, new_password, profile_data } = await req.json();

    if (action === 'signup') {
      // Validate signup data
      const validationResult = signupSchema.safeParse({ full_name, email, phone, password });
      if (!validationResult.success) {
        const messages = validationResult.error.errors.map(e => e.message).join(', ');
        return new Response(
          JSON.stringify({ success: false, error: messages }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      const validated = validationResult.data;

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', validated.email)
        .maybeSingle();

      if (existingUser) {
        return new Response(
          JSON.stringify({ success: false, error: 'An account with this email already exists' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Hash password using bcryptjs
      const password_hash = bcrypt.hashSync(validated.password, 10);

      // Insert new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          full_name: validated.full_name,
          email: validated.email,
          phone: validated.phone || null,
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
      // Validate login data
      const validationResult = loginSchema.safeParse({ email, password });
      if (!validationResult.success) {
        const messages = validationResult.error.errors.map(e => e.message).join(', ');
        return new Response(
          JSON.stringify({ success: false, error: messages }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      const validated = validationResult.data;

      // Find user by email
      const { data: user, error: findError } = await supabase
        .from('users')
        .select('id, full_name, email, phone, password_hash, created_at')
        .eq('email', validated.email)
        .maybeSingle();

      if (findError || !user) {
        console.log('User not found:', validated.email);
        return new Response(
          JSON.stringify({ success: false, error: 'No account found with this email' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      // Verify password using bcryptjs
      const validPassword = bcrypt.compareSync(validated.password, user.password_hash);
      if (!validPassword) {
        console.log('Invalid password for user:', validated.email);
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

      // Validate profile data
      const validationResult = profileUpdateSchema.safeParse(profile_data);
      if (!validationResult.success) {
        const messages = validationResult.error.errors.map(e => e.message).join(', ');
        return new Response(
          JSON.stringify({ success: false, error: messages }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      const validated = validationResult.data;

      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: validated.name,
          email: validated.email,
          phone: validated.phone || null,
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
      if (!user_id) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing user_id' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Validate password data
      const validationResult = passwordUpdateSchema.safeParse({ current_password, new_password });
      if (!validationResult.success) {
        const messages = validationResult.error.errors.map(e => e.message).join(', ');
        return new Response(
          JSON.stringify({ success: false, error: messages }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      const validated = validationResult.data;

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
      const validCurrentPassword = bcrypt.compareSync(validated.current_password, userData.password_hash);
      if (!validCurrentPassword) {
        return new Response(
          JSON.stringify({ success: false, error: 'Current password is incorrect' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      // Hash new password
      const newPasswordHash = bcrypt.hashSync(validated.new_password, 10);

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
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
