import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: string;
  lessonTitle: string;
  amountGhs?: number; // default 10
  onSuccess?: (reference: string) => void;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onOpenChange,
  lessonId,
  lessonTitle,
  amountGhs = 10,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastReference, setLastReference] = useState<string | null>(null);
  const [gatewayDetails, setGatewayDetails] = useState<string | null>(null);

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  // Normalize Paystack public key from env - no hardcoded fallback
  const envKeyRaw = import.meta.env.VITE_PAYSTACK_PK as string | undefined;
  const key = envKeyRaw?.trim().replace(/^\"|\"$/g, "") || '';
  const isTestKey = key.startsWith("pk_test_");
  const isKeyConfigured = Boolean(key);

  // Optional: override the amount temporarily for quick live verification using an env var.
  // Set VITE_PAYSTACK_TEST_AMOUNT_GHS=0.5 to charge GH₵0.50 locally without changing code.
  const overrideAmountRaw = import.meta.env.VITE_PAYSTACK_TEST_AMOUNT_GHS as string | undefined;
  const overrideAmount = overrideAmountRaw ? parseFloat(overrideAmountRaw.trim().replace(/^\"|\"$/g, "")) : undefined;
  const effectiveAmountGhs = typeof overrideAmount === 'number' && !Number.isNaN(overrideAmount) ? overrideAmount : amountGhs;

  // Normalize verify endpoint and provide diagnostics
  const verifyUrl = `${(import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "")}/functions/v1/verify-payment`;
  const [endpointTestResult, setEndpointTestResult] = useState<string | null>(null);

  const testVerifyEndpoint = async () => {
    setEndpointTestResult("Testing...");
    try {
      const res = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: "test-ref", lessonId: "test", email: "test@example.com", amount: 1 }),
      });
      const text = await res.text();
      setEndpointTestResult(`Status: ${res.status}\n${text}`);
    } catch (err) {
      setEndpointTestResult(`Network error: ${(err as Error).message}`);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      setVerifying(true);
      setError(null);

      // Re-open dialog to show verification progress (after Paystack iframe closes)
      handleOpenChange(true);

      // Store email for purchase verification
      sessionStorage.setItem('lastPaymentEmail', email);

      // Call Supabase Edge Function to verify payment with Paystack
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ""}`,
          },
          body: JSON.stringify({
            reference,
            lessonId,
            email,
            amount: Math.round(effectiveAmountGhs * 100),
          }),
        }
      );

      const result = await response.json();

      // Save gateway/paystack details for debugging if present
      setGatewayDetails(JSON.stringify(result?.paystack || result?.data || result, null, 2));

      if (!response.ok) {
        const errMsg = result.error || result.message || "Payment verification failed";
        setError(`${errMsg}. Reference: ${reference}`);
        console.error('Payment verification failed:', result);
        return false;
      }

      // Payment verified successfully
      setPaid(true);
      setVerifying(false);

      // Auto-close and callback after brief delay
      setTimeout(() => {
        handleOpenChange(false);
        onSuccess && onSuccess(reference);
      }, 2000);

      return true;
    } catch (err) {
      setVerifying(false);
      const message = err instanceof Error ? err.message : "Payment verification failed";
      // Provide actionable guidance when network errors occur
      const hint = `Failed to reach verification endpoint. Ensure your Supabase Edge Function 'verify-payment' is deployed and that 'PAYSTACK_SECRET_KEY' is set in its environment. Endpoint: ${verifyUrl}`;
      setError(`${message}. Reference: ${reference} — ${hint}`);
      setGatewayDetails(`Network error: ${(err as Error).message}`);
      console.error('Verification network error:', err);
    }
  };

  const payWithPaystack = async () => {
    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Require Paystack public key to be configured via environment variable
    if (!isKeyConfigured) {
      setError("Payment system not configured. Please set VITE_PAYSTACK_PK environment variable with your Paystack public key.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Prevent starting a payment if a TEST public key is configured (user said they are NOT testing)
    if (isTestKey) {
      setError("Paystack is configured with a TEST public key (pk_test_...). Replace VITE_PAYSTACK_PK with your LIVE public key (pk_live_...) in your .env and restart the app to process real payments.");
      setLoading(false);
      return;
    }

    // Ensure the inline script is loaded
    if (!window.PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onerror = () => {
        setError("Failed to load Paystack. Please try again.");
        setLoading(false);
      };
      document.body.appendChild(script);
      await new Promise((res) => (script.onload = res));
    }

    try {
      const channelsEnv = import.meta.env.VITE_PAYSTACK_CHANNELS as string | undefined;
      const channels = channelsEnv ? channelsEnv.split(",").map(s => s.trim()) : undefined;

      const ref = `${lessonId}-${Date.now()}`;
      const handler = window.PaystackPop.setup({
        key,
        email,
        amount: Math.round(effectiveAmountGhs * 100), // Paystack amount in pesewas
        currency: "GHS",
        ref,
        // only include channels if explicitly configured (e.g., 'card,mobile_money')
        ...(channels ? { channels } : {}),
        metadata: {
          lesson_id: lessonId,
          lesson_title: lessonTitle,
          custom_fields: [
            {
              display_name: "Lesson",
              variable_name: "lesson_id",
              value: lessonId,
            },
          ],
        },
        onClose: () => {
          setLoading(false);
        },
        callback: (response: any) => {
          setLoading(false);
          const refFromPaystack = response?.reference || ref;
          setLastReference(refFromPaystack);
          // Verify payment with backend before marking as paid
          verifyPayment(refFromPaystack);
        },
      });

      handler.openIframe();
      // Close our dialog so Paystack iframe can take focus (re-open when verification begins)
      handleOpenChange(false);
    } catch (err) {
      setError("Unable to start payment. Please try again.");
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEmail("");
      setError(null);
      setPaid(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Wallet className="h-6 w-6 text-primary" />
            <DialogTitle className="text-lg">Unlock Lesson</DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            "{lessonTitle}" is a premium lesson. Pay <strong>GH₵{effectiveAmountGhs}</strong> for instant access.
          </p>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {paid ? (
            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">Payment successful!</p>
                <p className="text-sm text-green-800 dark:text-green-300 mt-1">
                  Redirecting you to the lesson...
                </p>
              </div>
            </div>
          ) : verifying ? (
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <Loader className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0 animate-spin" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">Verifying payment...</p>
                <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                  Please wait while we confirm your transaction with Paystack.
                </p>
              </div>
            </div>
          ) : (
            <>
              {!isKeyConfigured && (
                <div className="p-2 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800 text-xs text-red-900 dark:text-red-100">
                  <strong>Error:</strong> Paystack public key not configured. Set <code>VITE_PAYSTACK_PK</code> in your <code>.env</code> file to enable payments.
                </div>
              )}

              {isKeyConfigured && isTestKey && (
                <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-100">
                  <strong>Warning:</strong> Paystack is configured with a TEST public key (<code>pk_test_...</code>). To accept real payments, set <code>VITE_PAYSTACK_PK</code> to your LIVE public key (<code>pk_live_...</code>) in your <code>.env</code>, set the live <code>PAYSTACK_SECRET_KEY</code> in your Supabase Edge Function, and restart the app.
                </div>
              )}

              {overrideAmount !== undefined && (
                <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-100">
                  <strong>Testing amount:</strong> temporarily charging <code>GH₵{overrideAmount!.toFixed(2)}</code> for this transaction. This is controlled by <code>VITE_PAYSTACK_TEST_AMOUNT_GHS</code> and will not change your production setting.
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  disabled={loading}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Your email will be used for the payment receipt and lesson access verification.
                </p>
              </div>

              {error && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                  </div>

                  {lastReference && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium">Reference:</span>
                      <code className="font-mono text-xs">{lastReference}</code>
                      <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(lastReference)}>
                        Copy
                      </Button>
                    </div>
                  )}

                  {gatewayDetails && (
                    <>
                      <pre className="max-h-44 overflow-auto text-xs bg-muted/50 p-2 rounded border text-foreground/80"><code>{gatewayDetails}</code></pre>
                      <div className="text-xs text-muted-foreground">
                        <a href="https://paystack.com/docs/payments/testing/" target="_blank" rel="noreferrer" className="underline">Paystack testing guide</a>
                      </div>
                    </>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => payWithPaystack()} disabled={loading || verifying}>
                        Retry Payment
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => window.open('mailto:support@yourdomain.com?subject=Payment%20Help&body=Reference%3A%20'+(lastReference||''))}>
                        Contact Support
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(verifyUrl)}>
                        Copy verify endpoint
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => testVerifyEndpoint()}>
                        Test verify endpoint
                      </Button>
                      {endpointTestResult && (
                        <pre className="max-h-40 overflow-auto text-xs bg-muted/50 p-2 rounded border text-foreground/80 w-full"><code>{endpointTestResult}</code></pre>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-100">Live Payment</p>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                  You will be charged <strong>GH₵{effectiveAmountGhs}</strong> to your card or mobile money account.
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full justify-end">
            <Button 
              variant="outline" 
              onClick={() => handleOpenChange(false)} 
              disabled={loading || verifying}
            >
              {paid ? "Close" : "Cancel"}
            </Button>
            {!paid && (
              <Button
                onClick={payWithPaystack}
                disabled={loading || verifying || !email || !isValidEmail(email) || !isKeyConfigured}
                className="min-w-48"
              >
                {loading ? "Opening payment..." : verifying ? "Verifying..." : `Pay GH₵${effectiveAmountGhs.toFixed(2)}`}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
