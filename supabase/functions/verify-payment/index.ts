import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentVerificationRequest {
  reference: string;
  lessonId: string;
  email: string;
  amount: number; // in pesewas
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: PaymentVerificationRequest = await req.json();
    const { reference, lessonId, email, amount } = body;

    console.log('verify-payment request', { reference, lessonId, email, amount });

    if (!reference || !lessonId || !email || typeof amount !== 'number') {
      return new Response(
        JSON.stringify({ error: "Missing or invalid required fields", details: { reference: !!reference, lessonId: !!lessonId, email: !!email, amountType: typeof amount } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
        `https://api.paystack.co/transaction/verify/${reference}`,
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
          JSON.stringify({ error: "Paystack verification failed", status: paystackResponse.status, paystack_raw: text }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      console.error('Network error contacting Paystack:', errMessage);
      return new Response(
        JSON.stringify({ error: 'Network error contacting Paystack', message: errMessage }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if payment was successful
    if (paystackData.data.status !== "success") {
      return new Response(
        JSON.stringify({ error: "Payment was not successful", status: paystackData.data.status, paystack: paystackData.data }),
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
        JSON.stringify({ error: "Amount mismatch", paystack: paystackData.data }),
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
        JSON.stringify({ error: 'Email mismatch with Paystack customer', paystack: paystackData.data }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (psLessonMeta && psLessonMeta !== lessonId) {
      console.error('Lesson metadata mismatch:', { expected: lessonId, received: psLessonMeta });
      return new Response(
        JSON.stringify({ error: 'Lesson metadata mismatch', paystack: paystackData.data }),
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
          paystack: paystackData.data,
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
        JSON.stringify({ error: "Failed to record purchase", detail: insertError, paystack: paystackData.data }),
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
        paystack: paystackData.data,
        purchase: inserted,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error("Error:", errMessage);
    return new Response(
      JSON.stringify({ error: errMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
