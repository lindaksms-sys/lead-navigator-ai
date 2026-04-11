import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  serviceType?: string;
  propertyType?: string;
  squareFootage?: number;
  timeline?: string;
  budget?: string;
  decisionMaker?: boolean;
  notes?: string;
}

function calculateScore(data: LeadData) {
  const timelineScores: Record<string, number> = { emergency: 50, today: 40, this_week: 30, this_month: 20, planning: 10 };
  const budgetScores: Record<string, number> = { over_10000: 20, "5000_10000": 15, "2000_5000": 10, "500_2000": 5 };

  let timeline = timelineScores[data.timeline ?? ""] ?? 0;
  let budget = budgetScores[data.budget ?? ""] ?? 0;
  let property = 0;
  if (data.propertyType === "commercial") property = 15;
  else if ((data.squareFootage ?? 0) > 2000) property = 10;
  else if ((data.squareFootage ?? 0) > 1000) property = 5;
  let dm = data.decisionMaker ? 15 : 0;

  const score = Math.min(timeline + budget + property + dm, 100);
  const category = score >= 70 ? "Hot" : score >= 40 ? "Warm" : "Cold";
  return { score, category };
}

function trimPayload(obj: unknown, maxLen = 2000): unknown {
  const str = JSON.stringify(obj);
  if (str.length <= maxLen) return obj;
  return JSON.parse(str.slice(0, maxLen - 3) + '..."');
}

async function logEvent(
  supabase: ReturnType<typeof createClient>,
  event: {
    event_type: string;
    source?: string;
    status?: string;
    title: string;
    message?: string;
    payload?: unknown;
    client_id?: string | null;
    lead_id?: string | null;
    call_id?: string | null;
    actor_role?: string;
  }
) {
  try {
    await supabase.from("event_logs").insert({
      event_type: event.event_type,
      source: event.source || "vapi",
      status: event.status || "success",
      title: event.title,
      message: event.message || null,
      payload: event.payload ? trimPayload(event.payload) : null,
      client_id: event.client_id || null,
      lead_id: event.lead_id || null,
      call_id: event.call_id || null,
      actor_role: event.actor_role || "system",
    });
  } catch (e) {
    console.error("Failed to write event log:", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  if (req.method === "GET") {
    return new Response(JSON.stringify({ message: "Webhook endpoint active" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { message } = body;

    // Log webhook received
    await logEvent(supabase, {
      event_type: "webhook_received",
      title: "Webhook payload received",
      message: `Type: ${message?.type || "unknown"}`,
      payload: { type: message?.type, callId: message?.call?.id },
    });

    // Log call
    if (message?.call) {
      const call = message.call;
      const { data: callData } = await supabase.from("calls").upsert({
        call_sid: call.id ?? call.callSid ?? crypto.randomUUID(),
        phone_number: call.customer?.number,
        direction: call.direction === "outbound" ? "outbound" : "inbound",
        status: call.status,
        transcript: call.transcript,
        duration_seconds: call.duration ? Math.round(call.duration) : null,
      }, { onConflict: "call_sid" }).select("id").maybeSingle();

      if (callData?.id) {
        await logEvent(supabase, {
          event_type: "call_logged",
          title: `Call ${call.status || "received"}`,
          message: `${call.direction || "inbound"} call from ${call.customer?.number || "unknown"}`,
          call_id: callData.id,
        });
      }
    }

    // Handle function calls
    if (message?.type === "function-call") {
      const { functionCall } = message;
      const name = functionCall?.name;
      const params = functionCall?.parameters ?? {};

      if (name === "collectLeadInfo") {
        const leadData: LeadData = {
          name: params.name ?? "Unknown",
          phone: params.phone ?? "",
          email: params.email,
          address: params.address,
          serviceType: params.serviceType,
          propertyType: params.propertyType,
          squareFootage: params.squareFootage ? Number(params.squareFootage) : undefined,
          timeline: params.timeline,
          budget: params.budget,
          decisionMaker: params.decisionMaker === true || params.decisionMaker === "true",
          notes: params.notes,
        };

        const { score, category } = calculateScore(leadData);

        const { data: leadRow, error } = await supabase.from("leads").insert({
          name: leadData.name,
          phone: leadData.phone,
          email: leadData.email || null,
          address: leadData.address || null,
          service_type: leadData.serviceType || null,
          property_type: leadData.propertyType || null,
          square_footage: leadData.squareFootage || null,
          timeline: leadData.timeline || null,
          budget: leadData.budget || null,
          decision_maker: leadData.decisionMaker,
          notes: leadData.notes || null,
          score,
          category,
          call_sid: message.call?.id || null,
        }).select("id").maybeSingle();

        if (error) {
          console.error("Error saving lead:", error);
          await logEvent(supabase, {
            event_type: "lead_created",
            status: "failed",
            title: "Lead creation failed",
            message: error.message,
            payload: { name: leadData.name, phone: leadData.phone },
          });
          return new Response(JSON.stringify({
            results: [{ toolCallId: functionCall.id, result: `Error saving lead: ${error.message}` }],
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        const leadId = leadRow?.id || null;

        // Log lead created
        await logEvent(supabase, {
          event_type: "lead_created",
          title: `Lead created: ${leadData.name}`,
          message: `Score: ${score}/100 (${category}). Service: ${leadData.serviceType || "N/A"}`,
          lead_id: leadId,
          payload: { score, category, serviceType: leadData.serviceType, timeline: leadData.timeline },
        });

        // Log lead scored
        await logEvent(supabase, {
          event_type: "lead_scored",
          title: `Lead scored ${category} (${score})`,
          message: `${leadData.name} — timeline: ${leadData.timeline || "N/A"}, budget: ${leadData.budget || "N/A"}`,
          lead_id: leadId,
        });

        // Send SMS for Hot leads
        if (category === "Hot") {
          try {
            const { data: settingsData } = await supabase
              .from("settings")
              .select("key, value")
              .in("key", ["sms_alerts_enabled", "sales_rep_phone"]);

            const smsEnabled = settingsData?.find((s: any) => s.key === "sms_alerts_enabled")?.value === "true";
            const salesPhone = settingsData?.find((s: any) => s.key === "sales_rep_phone")?.value;

            if (smsEnabled && salesPhone) {
              const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
              const TWILIO_API_KEY = Deno.env.get("TWILIO_API_KEY");
              const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

              if (LOVABLE_API_KEY && TWILIO_API_KEY && TWILIO_PHONE_NUMBER) {
                const smsBody = `🔥 HOT LEAD: ${leadData.name} needs ${leadData.serviceType || "service"} ${leadData.timeline || "soon"}. Score: ${score}/100. Call: ${leadData.phone}.`;

                const smsResponse = await fetch("https://connector-gateway.lovable.dev/twilio/Messages.json", {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${LOVABLE_API_KEY}`,
                    "X-Connection-Api-Key": TWILIO_API_KEY,
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: new URLSearchParams({ To: salesPhone, From: TWILIO_PHONE_NUMBER, Body: smsBody }),
                });

                const smsData = await smsResponse.json();
                await supabase.from("sms_logs").insert({
                  phone_sent_to: salesPhone,
                  content: smsBody,
                  status: smsResponse.ok ? "sent" : "failed",
                  twilio_sid: smsData.sid || null,
                });

                await logEvent(supabase, {
                  event_type: smsResponse.ok ? "sms_sent" : "sms_failed",
                  source: "twilio",
                  status: smsResponse.ok ? "success" : "failed",
                  title: smsResponse.ok ? `SMS alert sent to ${salesPhone}` : "SMS alert failed",
                  message: smsResponse.ok ? `Hot lead alert for ${leadData.name}` : `Twilio error: ${JSON.stringify(smsData).slice(0, 200)}`,
                  lead_id: leadId,
                });
              } else {
                await logEvent(supabase, {
                  event_type: "sms_failed",
                  source: "twilio",
                  status: "warning",
                  title: "SMS not configured",
                  message: "Missing Twilio credentials — SMS alert skipped",
                  lead_id: leadId,
                });
              }
            }
          } catch (smsErr) {
            console.error("SMS alert failed (non-fatal):", smsErr);
            await logEvent(supabase, {
              event_type: "sms_failed",
              source: "twilio",
              status: "failed",
              title: "SMS alert error",
              message: String(smsErr),
              lead_id: leadId,
            });
          }
        }

        return new Response(JSON.stringify({
          results: [{
            toolCallId: functionCall.id,
            result: `Lead saved successfully. Score: ${score}/100, Category: ${category}. ${
              category === "Hot" ? "This is a high-priority lead!" :
              category === "Warm" ? "This lead shows good potential." :
              "This lead will be added to our nurture campaign."
            }`,
          }],
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (name === "checkAvailability") {
        try {
          const CALENDLY_API_TOKEN = Deno.env.get("CALENDLY_API_TOKEN");
          if (!CALENDLY_API_TOKEN) throw new Error("Calendly not configured");

          const { data: etSetting } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "calendly_event_type_uri")
            .maybeSingle();

          if (!etSetting?.value) {
            await logEvent(supabase, {
              event_type: "availability_checked",
              source: "calendly",
              status: "warning",
              title: "Availability check skipped",
              message: "Calendly event type not configured in settings",
            });
            return new Response(JSON.stringify({
              results: [{ toolCallId: functionCall.id, result: "Scheduling is not configured yet. Please ask a team member to set up Calendly in settings." }],
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }

          const now = new Date();
          const endDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

          const url = `https://api.calendly.com/event_type_available_times?event_type=${encodeURIComponent(etSetting.value)}&start_time=${now.toISOString()}&end_time=${endDate.toISOString()}`;
          const calRes = await fetch(url, {
            headers: { "Authorization": `Bearer ${CALENDLY_API_TOKEN}`, "Content-Type": "application/json" },
          });

          if (!calRes.ok) {
            const errBody = await calRes.text();
            console.error("Calendly availability error:", errBody);
            throw new Error("Failed to fetch availability");
          }

          const calData = await calRes.json();
          const slots = (calData.collection || [])
            .slice(0, 5)
            .map((slot: any) => {
              const d = new Date(slot.start_time);
              return d.toLocaleString("en-US", { weekday: "long", hour: "numeric", minute: "2-digit", hour12: true });
            });

          const result = slots.length > 0
            ? `Available slots: ${slots.join(", ")}`
            : "Unfortunately, there are no available slots in the next 3 days. Please check back later.";

          await logEvent(supabase, {
            event_type: "availability_checked",
            source: "calendly",
            title: `Availability checked: ${slots.length} slots found`,
            message: result,
          });

          return new Response(JSON.stringify({
            results: [{ toolCallId: functionCall.id, result }],
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } catch (calErr) {
          console.error("Calendly checkAvailability error:", calErr);
          await logEvent(supabase, {
            event_type: "availability_checked",
            source: "calendly",
            status: "failed",
            title: "Availability check failed",
            message: String(calErr),
          });
          const slots = ["Tomorrow at 9:00 AM", "Tomorrow at 2:00 PM", "Day after tomorrow at 10:00 AM"];
          return new Response(JSON.stringify({
            results: [{ toolCallId: functionCall.id, result: `Available slots: ${slots.join(", ")}` }],
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      if (name === "bookAppointment") {
        const datetime = params.datetime || new Date().toISOString();
        let calendlyEventId = null;
        let calendarLink = null;

        try {
          const CALENDLY_API_TOKEN = Deno.env.get("CALENDLY_API_TOKEN");
          const { data: etSetting } = await supabase
            .from("settings")
            .select("value")
            .eq("key", "calendly_event_type_uri")
            .maybeSingle();

          if (CALENDLY_API_TOKEN && etSetting?.value) {
            const calRes = await fetch("https://api.calendly.com/scheduling_links", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${CALENDLY_API_TOKEN}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                max_event_count: 1,
                owner: etSetting.value,
                owner_type: "EventType",
              }),
            });

            if (calRes.ok) {
              const calData = await calRes.json();
              calendarLink = calData.resource?.booking_url || null;
              calendlyEventId = calData.resource?.uri || null;
            }
          }
        } catch (calErr) {
          console.error("Calendly booking error (non-fatal):", calErr);
          await logEvent(supabase, {
            event_type: "booking_failed",
            source: "calendly",
            status: "warning",
            title: "Calendar link creation failed",
            message: String(calErr),
          });
        }

        const { error } = await supabase.from("appointments").insert({
          lead_id: params.leadId || null,
          datetime,
          service_type: params.serviceType || null,
          notes: params.notes || null,
          calendly_event_id: calendlyEventId,
          calendar_link: calendarLink,
        });

        if (error) {
          await logEvent(supabase, {
            event_type: "booking_failed",
            status: "failed",
            title: "Appointment booking failed",
            message: error.message,
            payload: { datetime, serviceType: params.serviceType },
          });
        } else {
          await logEvent(supabase, {
            event_type: "booking_created",
            source: "calendly",
            title: `Appointment booked for ${new Date(datetime).toLocaleDateString()}`,
            message: `Service: ${params.serviceType || "N/A"}. ${calendarLink ? "Calendar link created." : "No calendar link."}`,
            payload: { datetime, serviceType: params.serviceType, hasCalendarLink: !!calendarLink },
          });
        }

        const resultMsg = error
          ? `Error booking: ${error.message}`
          : calendarLink
            ? `Appointment booked successfully! You can manage it here: ${calendarLink}`
            : "Appointment booked successfully!";

        return new Response(JSON.stringify({
          results: [{ toolCallId: functionCall.id, result: resultMsg }],
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (name === "sendQuote") {
        console.log("Quote request:", params);
        await logEvent(supabase, {
          event_type: "quote_logged",
          title: `Quote requested by ${params.name || "caller"}`,
          message: `Service: ${params.serviceType || "N/A"}`,
          payload: trimPayload(params),
        });
        return new Response(JSON.stringify({
          results: [{
            toolCallId: functionCall.id,
            result: "Quote request logged. Our team will send a detailed quote shortly.",
          }],
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (name === "escalateToHuman") {
        await supabase.from("escalations").insert({
          call_sid: message.call?.id || "unknown",
          reason: params.reason || "other",
          notes: params.notes || null,
        });

        await logEvent(supabase, {
          event_type: "escalation_created",
          status: "warning",
          title: `Escalation: ${params.reason || "other"}`,
          message: params.notes || "Caller transferred to human agent",
          payload: { reason: params.reason, callId: message.call?.id },
        });

        return new Response(JSON.stringify({
          results: [{
            toolCallId: functionCall.id,
            result: "I'm transferring you to a team member who can better assist you. Please hold.",
          }],
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    await logEvent(supabase, {
      event_type: "webhook_received",
      status: "failed",
      title: "Webhook processing error",
      message: String(err),
    });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
