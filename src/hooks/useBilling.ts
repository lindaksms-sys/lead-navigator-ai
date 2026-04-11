import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getPlan } from "@/lib/billingPlans";

export function useBilling() {
  const { user } = useAuth();

  const { data: billing, isLoading } = useQuery({
    queryKey: ["billing-subscription", user?.id],
    queryFn: async () => {
      // Get client_id for current user
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("client_id")
        .eq("user_id", user!.id)
        .not("client_id", "is", null)
        .limit(1)
        .maybeSingle();

      if (!roleData?.client_id) return null;

      const { data } = await supabase
        .from("billing_subscriptions" as any)
        .select("*")
        .eq("client_id", roleData.client_id)
        .maybeSingle();

      return data as any;
    },
    enabled: !!user,
  });

  const plan = getPlan(billing?.plan_id || "starter");

  const isTrialing = billing?.subscription_status === "trialing";
  const isActive = billing?.subscription_status === "active";
  const isPastDue = billing?.subscription_status === "past_due";
  const isCanceled = billing?.subscription_status === "canceled";

  const minutesUsed = billing?.usage_minutes_current_period || 0;
  const minutesLimit = billing?.max_minutes || plan.maxMinutes;
  const locationsLimit = billing?.max_locations || plan.maxLocations;

  const isAtMinuteLimit = minutesUsed >= minutesLimit;
  const minutesPercent = minutesLimit > 0 ? Math.min((minutesUsed / minutesLimit) * 100, 100) : 0;

  return {
    billing,
    plan,
    isLoading,
    isTrialing,
    isActive,
    isPastDue,
    isCanceled,
    minutesUsed,
    minutesLimit,
    locationsLimit,
    isAtMinuteLimit,
    minutesPercent,
    canBook: plan.id !== "starter",
  };
}
