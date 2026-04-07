import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const CALENDLY_API_TOKEN = Deno.env.get("CALENDLY_API_TOKEN");
  if (!CALENDLY_API_TOKEN) {
    return new Response(JSON.stringify({ error: "CALENDLY_API_TOKEN not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "event_types") {
      // Get current user URI first
      const userRes = await fetch("https://api.calendly.com/users/me", {
        headers: { "Authorization": `Bearer ${CALENDLY_API_TOKEN}` },
      });
      if (!userRes.ok) {
        const err = await userRes.text();
        throw new Error(`Calendly user fetch failed: ${err}`);
      }
      const userData = await userRes.json();
      const userUri = userData.resource?.uri;

      const etRes = await fetch(`https://api.calendly.com/event_types?user=${encodeURIComponent(userUri)}&active=true`, {
        headers: { "Authorization": `Bearer ${CALENDLY_API_TOKEN}` },
      });
      if (!etRes.ok) {
        const err = await etRes.text();
        throw new Error(`Calendly event types fetch failed: ${err}`);
      }
      const etData = await etRes.json();
      const eventTypes = (etData.collection || []).map((et: any) => ({
        uri: et.uri,
        name: et.name,
        duration: et.duration,
        slug: et.slug,
      }));

      return new Response(JSON.stringify({ event_types: eventTypes }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "availability") {
      const eventTypeUri = url.searchParams.get("event_type_uri");
      if (!eventTypeUri) {
        return new Response(JSON.stringify({ error: "event_type_uri required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const now = new Date();
      const endDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const avRes = await fetch(
        `https://api.calendly.com/event_type_available_times?event_type=${encodeURIComponent(eventTypeUri)}&start_time=${now.toISOString()}&end_time=${endDate.toISOString()}`,
        { headers: { "Authorization": `Bearer ${CALENDLY_API_TOKEN}` } }
      );
      if (!avRes.ok) {
        const err = await avRes.text();
        throw new Error(`Calendly availability fetch failed: ${err}`);
      }
      const avData = await avRes.json();

      return new Response(JSON.stringify({ slots: avData.collection || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "book" && req.method === "POST") {
      const body = await req.json();
      const { leadId, datetime, serviceType, notes, eventTypeUri } = body;

      let calendlyEventId = null;
      let calendarLink = null;

      if (eventTypeUri) {
        const calRes = await fetch("https://api.calendly.com/scheduling_links", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${CALENDLY_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            max_event_count: 1,
            owner: eventTypeUri,
            owner_type: "EventType",
          }),
        });

        if (calRes.ok) {
          const calData = await calRes.json();
          calendarLink = calData.resource?.booking_url || null;
          calendlyEventId = calData.resource?.uri || null;
        }
      }

      const { error } = await supabase.from("appointments").insert({
        lead_id: leadId || null,
        datetime: datetime || new Date().toISOString(),
        service_type: serviceType || null,
        notes: notes || null,
        calendly_event_id: calendlyEventId,
        calendar_link: calendarLink,
      });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, calendar_link: calendarLink }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "test") {
      const userRes = await fetch("https://api.calendly.com/users/me", {
        headers: { "Authorization": `Bearer ${CALENDLY_API_TOKEN}` },
      });
      const ok = userRes.ok;
      const data = ok ? await userRes.json() : null;
      await userRes.text().catch(() => {});

      return new Response(JSON.stringify({
        connected: ok,
        user: ok ? { name: data.resource?.name, email: data.resource?.email } : null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("calendly-proxy error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
