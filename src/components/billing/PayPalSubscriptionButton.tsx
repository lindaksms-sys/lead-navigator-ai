import { useEffect, useRef, useState } from "react";
import { loadPayPalSDK } from "@/lib/paypal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PayPalSubscriptionButtonProps {
  planId: string;
  paypalPlanId: string;
  paypalClientId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function PayPalSubscriptionButton({
  planId,
  paypalPlanId,
  paypalClientId,
  onSuccess,
  onCancel,
}: PayPalSubscriptionButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const renderedRef = useRef(false);

  useEffect(() => {
    if (!paypalPlanId || !paypalClientId || renderedRef.current) return;

    let cancelled = false;

    async function init() {
      try {
        await loadPayPalSDK(paypalClientId);
        if (cancelled || !containerRef.current) return;

        const paypal = (window as any).paypal;
        if (!paypal?.Buttons) {
          setError("PayPal SDK not available");
          setLoading(false);
          return;
        }

        renderedRef.current = true;

        paypal.Buttons({
          style: {
            shape: "rect",
            color: "blue",
            layout: "vertical",
            label: "subscribe",
          },
          createSubscription: (_data: any, actions: any) => {
            // Log checkout started
            supabase.from("event_logs").insert({
              event_type: "billing_checkout_started",
              title: "Checkout started",
              message: `PayPal checkout for ${planId} plan`,
              source: "billing",
              status: "success",
              payload: { plan_id: planId, provider: "paypal" },
            });

            return actions.subscription.create({ plan_id: paypalPlanId });
          },
          onApprove: async (data: any) => {
            toast.loading("Activating your subscription…", { id: "paypal-approve" });

            try {
              const { data: result, error: fnError } = await supabase.functions.invoke(
                "paypal-approve",
                {
                  body: {
                    subscription_id: data.subscriptionID,
                    plan_id: planId,
                    provider: "paypal",
                  },
                }
              );

              if (fnError) throw fnError;
              if (result?.error) throw new Error(result.error);

              toast.success("Subscription activated!", { id: "paypal-approve" });
              onSuccess();
            } catch (err: any) {
              console.error("PayPal approve error:", err);
              toast.error("Something went wrong activating your subscription. Please contact support.", { id: "paypal-approve" });
            }
          },
          onCancel: () => {
            supabase.from("event_logs").insert({
              event_type: "billing_checkout_canceled",
              title: "Checkout canceled",
              message: `User canceled PayPal checkout for ${planId}`,
              source: "billing",
              status: "info",
              payload: { plan_id: planId },
            });
            toast.info("Checkout canceled");
            onCancel?.();
          },
          onError: (err: any) => {
            console.error("PayPal button error:", err);
            supabase.from("event_logs").insert({
              event_type: "billing_checkout_failed",
              title: "Checkout failed",
              message: `PayPal error during ${planId} checkout`,
              source: "billing",
              status: "error",
              payload: { plan_id: planId, error: String(err) },
            });
            toast.error("PayPal encountered an error. Please try again.");
          },
        }).render(containerRef.current);

        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error("PayPal init error:", err);
          setError("Failed to load payment system");
          setLoading(false);
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [paypalPlanId, paypalClientId, planId, onSuccess, onCancel, user]);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <p className="text-xs text-muted-foreground mt-1">Please refresh or contact support.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading checkout…</span>
        </div>
      )}
      <div ref={containerRef} className={loading ? "hidden" : ""} />
    </div>
  );
}
