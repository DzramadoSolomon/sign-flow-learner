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

// Also allow any lovable.app, lovableproject.com, or vercel.app subdomains
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) return true;
  // Allow any *.lovable.app, *.lovableproject.com or *.vercel.app subdomain
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

// Validation schema for payment verification request
const paymentRequestSchema = z.object({
  reference: z.string().min(1, 'Reference is required').max(200),
  lessonId: z.string().min(1, 'Lesson ID is required').max(100),
  email: z.string().email('Invalid email').max(255),
  amount: z.number().int().positive('Amount must be a positive integer'),
});

serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Check if origin is allowed for non-OPTIONS requests
  if (!corsHeaders['Access-Control-Allow-Origin']) {
    console.warn('Blocked request from unauthorized origin:', origin);
    return new Response(
      JSON.stringify({ error: 'Unauthorized origin' }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();

    // Validate request body
    const validationResult = paymentRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const messages = validationResult.error.errors.map(e => e.message).join(', ');
      return new Response(
        JSON.stringify({ error: "Validation failed", details: messages }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { reference, lessonId, email, amount } = validationResult.data;

    console.log('verify-payment request', { reference, lessonId, email, amount });

    // Verify with Paystack
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment verification not configured", hint: "Set PAYSTACK_SECRET_KEY in your Function config" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Paystack and handle network/HTTP errors explicitly
    let paystackData: any = null;
    try {
      const paystackResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const text = await paystackResponse.text().catch(() => "");
      try {
        paystackData = JSON.parse(text);
      } catch {
        paystackData = { raw: text };
      }

      if (!paystackResponse.ok) {
        console.error("Paystack verification failed:", paystackResponse.status, text);
        return new Response(
          JSON.stringify({ error: "Paystack verification failed", status: paystackResponse.status }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      console.error('Network error contacting Paystack:', errMessage);
      return new Response(
        JSON.stringify({ error: 'Network error contacting Paystack' }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if payment was successful
    if (paystackData.data.status !== "success") {
      return new Response(
        JSON.stringify({ error: "Payment was not successful", status: paystackData.data.status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify amount matches
    if (paystackData.data.amount !== amount) {
      console.error("Amount mismatch", {
        expected: amount,
        received: paystackData.data.amount,
      });
      return new Response(
        JSON.stringify({ error: "Amount mismatch" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Internal error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to extract authenticated user id from Authorization header (if provided)
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    let userId: string | null = null;

    if (token) {
      try {
        const { data: userData, error: userErr } = await supabase.auth.getUser(token);
        if (userErr) {
          console.warn('Could not fetch user from token:', userErr.message || userErr);
        } else if (userData?.user?.id) {
          userId = userData.user.id;
        }
      } catch (err) {
        console.warn('Error verifying user token:', (err as Error).message || err);
      }
    }

    // validate paystack payload items match expected values (email and lesson metadata)
    const psCustomerEmail = (paystackData?.data?.customer && paystackData.data.customer.email) || null;
    const psLessonMeta = (paystackData?.data?.metadata && (paystackData.data.metadata.lesson_id || paystackData.data.metadata.lesson)) || null;

    if (psCustomerEmail && psCustomerEmail.toLowerCase() !== email.toLowerCase()) {
      console.error('Email mismatch between client and Paystack:', { client: email, paystack: psCustomerEmail });
      return new Response(
        JSON.stringify({ error: 'Email mismatch with Paystack customer' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (psLessonMeta && psLessonMeta !== lessonId) {
      console.error('Lesson metadata mismatch:', { expected: lessonId, received: psLessonMeta });
      return new Response(
        JSON.stringify({ error: 'Lesson metadata mismatch' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if purchase already exists
    const existingPurchase = await supabase
      .from("lesson_purchases")
      .select("*")
      .eq("paystack_reference", reference)
      .single();

    if (existingPurchase.data) {
      // Purchase already recorded
      return new Response(
        JSON.stringify({
          success: true,
          message: "Purchase already recorded",
          lessonId,
          email,
          reference,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record the purchase (include user_id when available)
    const purchaseRecord: any = {
      user_email: email,
      user_id: userId,
      lesson_id: lessonId,
      paystack_reference: reference,
      amount_ghs: (amount / 100).toFixed(2),
      amount_pesewas: amount,
      currency: "GHS",
      payment_status: paystackData.data.status || "completed",
      transaction_date: new Date(paystackData.data.transaction_date).toISOString(),
      metadata: paystackData.data,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("lesson_purchases")
      .insert([purchaseRecord])
      .select("*")
      .single();

    if (insertError) {
      console.error("Failed to insert purchase record:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to record purchase" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment verified and recorded",
        lessonId,
        email,
        reference,
        purchase: inserted,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error("Error:", errMessage);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
