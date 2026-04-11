import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_LIMITS: Record<string, { max_minutes: number; max_locations: number }> = {
  starter: { max_minutes: 500, max_locations: 1 },
  growth: { max_minutes: 2000, max_locations: 3 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the user
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { subscription_id, plan_id, provider } = body;

    if (!subscription_id || !plan_id || !provider) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!PLAN_LIMITS[plan_id]) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get client_id for user
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleData } = await admin
      .from("user_roles")
      .select("client_id")
      .eq("user_id", user.id)
      .not("client_id", "is", null)
      .limit(1)
      .maybeSingle();

    if (!roleData?.client_id) {
      return new Response(JSON.stringify({ error: "No client account found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const limits = PLAN_LIMITS[plan_id];
    const now = new Date().toISOString();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Upsert billing subscription
    const { error: upsertError } = await admin
      .from("billing_subscriptions")
      .upsert(
        {
          client_id: roleData.client_id,
          plan_id,
          payment_provider: provider,
          provider_subscription_id: subscription_id,
          subscription_status: "active",
          current_period_start: now,
          current_period_end: periodEnd,
          max_minutes: limits.max_minutes,
          max_locations: limits.max_locations,
          cancel_at_period_end: false,
          usage_minutes_current_period: 0,
          updated_at: now,
        },
        { onConflict: "client_id" }
      );

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return new Response(JSON.stringify({ error: "Failed to activate subscription" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log the event
    await admin.from("event_logs").insert({
      event_type: "billing_checkout_completed",
      title: "Subscription activated",
      message: `${plan_id} plan activated via ${provider}`,
      source: "billing",
      status: "success",
      client_id: roleData.client_id,
      payload: { plan_id, provider, subscription_id },
    });

    return new Response(JSON.stringify({ success: true, plan_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("paypal-approve error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
