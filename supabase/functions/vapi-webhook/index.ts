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

    // Log call
    if (message?.call) {
      const call = message.call;
      await supabase.from("calls").upsert({
        call_sid: call.id ?? call.callSid ?? crypto.randomUUID(),
        phone_number: call.customer?.number,
        direction: call.direction === "outbound" ? "outbound" : "inbound",
        status: call.status,
        transcript: call.transcript,
        duration_seconds: call.duration ? Math.round(call.duration) : null,
      }, { onConflict: "call_sid" });
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

        const { error } = await supabase.from("leads").insert({
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
        });

        if (error) {
          console.error("Error saving lead:", error);
          return new Response(JSON.stringify({
            results: [{ toolCallId: functionCall.id, result: `Error saving lead: ${error.message}` }],
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

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
              }
            }
          } catch (smsErr) {
            console.error("SMS alert failed (non-fatal):", smsErr);
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
        const slots = [
          "Tomorrow at 9:00 AM",
          "Tomorrow at 2:00 PM",
          "Day after tomorrow at 10:00 AM",
          "Day after tomorrow at 3:00 PM",
          "This Friday at 11:00 AM",
        ];
        return new Response(JSON.stringify({
          results: [{ toolCallId: functionCall.id, result: `Available slots: ${slots.join(", ")}` }],
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (name === "bookAppointment") {
        const { error } = await supabase.from("appointments").insert({
          lead_id: params.leadId || null,
          datetime: params.datetime || new Date().toISOString(),
          service_type: params.serviceType || null,
          notes: params.notes || null,
        });

        return new Response(JSON.stringify({
          results: [{
            toolCallId: functionCall.id,
            result: error ? `Error booking: ${error.message}` : "Appointment booked successfully!",
          }],
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (name === "sendQuote") {
        console.log("Quote request:", params);
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
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
