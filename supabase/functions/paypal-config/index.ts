const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Return only publishable config - no secrets
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID") || "";
  const starterPlanId = Deno.env.get("PAYPAL_STARTER_PLAN_ID") || "";
  const growthPlanId = Deno.env.get("PAYPAL_GROWTH_PLAN_ID") || "";

  return new Response(
    JSON.stringify({
      client_id: clientId,
      plans: {
        starter: starterPlanId,
        growth: growthPlanId,
      },
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
