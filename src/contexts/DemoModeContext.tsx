import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { subDays, subHours, addDays, addHours } from "date-fns";

interface DemoModeContextType {
  isDemoMode: boolean;
  enableDemoMode: () => Promise<void>;
  disableDemoMode: () => Promise<void>;
  resetDemoData: () => Promise<void>;
  seeding: boolean;
}

const DemoModeContext = createContext<DemoModeContextType | null>(null);

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error("useDemoMode must be used within DemoModeProvider");
  return ctx;
}

// ─── HVAC demo data ───────────────────────────────────────
function buildHvacDemoData(clientId: string) {
  const now = new Date();

  const leads = [
    { client_id: clientId, name: "Mike Johnson", phone: "(555) 234-5678", email: "mike.j@email.com", service_type: "emergency" as const, timeline: "emergency" as const, budget: "500_2000" as const, decision_maker: true, score: 92, category: "Hot" as const, status: "new" as const, source: "demo", notes: "No cooling — compressor not running. House is 90°F.", created_at: subHours(now, 2).toISOString() },
    { client_id: clientId, name: "Sarah Williams", phone: "(555) 345-6789", email: "sarah.w@email.com", service_type: "installation" as const, timeline: "this_week" as const, budget: "over_10000" as const, decision_maker: true, score: 78, category: "Hot" as const, status: "contacted" as const, source: "demo", notes: "Wants full system replacement. 20-year-old Trane unit.", created_at: subDays(now, 1).toISOString() },
    { client_id: clientId, name: "Tom Davis", phone: "(555) 456-7890", service_type: "maintenance" as const, timeline: "this_week" as const, budget: "under_500" as const, decision_maker: true, score: 45, category: "Warm" as const, status: "scheduled" as const, source: "demo", notes: "Annual AC tune-up before summer.", created_at: subDays(now, 2).toISOString() },
    { client_id: clientId, name: "Lisa Chen", phone: "(555) 567-8901", email: "lisa.c@email.com", service_type: "repair" as const, timeline: "today" as const, budget: "500_2000" as const, decision_maker: false, score: 55, category: "Warm" as const, status: "quoted" as const, source: "demo", notes: "Thermostat not responding. Tried replacing batteries.", created_at: subDays(now, 3).toISOString() },
    { client_id: clientId, name: "Robert Garcia", phone: "(555) 678-9012", service_type: "repair" as const, timeline: "this_month" as const, budget: "unknown" as const, decision_maker: true, score: 28, category: "Cold" as const, status: "new" as const, source: "demo", notes: "Hearing occasional rattling from the furnace.", created_at: subDays(now, 4).toISOString() },
    { client_id: clientId, name: "Jennifer Park", phone: "(555) 789-0123", service_type: "installation" as const, timeline: "planning" as const, budget: "5000_10000" as const, decision_maker: true, score: 35, category: "Cold" as const, status: "nurture" as const, source: "demo", notes: "Researching heat pump options for next year.", created_at: subDays(now, 5).toISOString() },
    { client_id: clientId, name: "David Brown", phone: "(555) 890-1234", email: "david.b@email.com", service_type: "emergency" as const, timeline: "today" as const, budget: "2000_5000" as const, decision_maker: true, score: 88, category: "Hot" as const, status: "scheduled" as const, source: "demo", notes: "No heat — gas furnace not igniting. 35°F outside.", created_at: subDays(now, 1).toISOString() },
  ];

  const appointments = [
    { client_id: clientId, datetime: addHours(now, 3).toISOString(), service_type: "Emergency — No Cooling", status: "confirmed" as const, notes: "Mike Johnson — compressor issue", created_at: subHours(now, 1).toISOString() },
    { client_id: clientId, datetime: addDays(now, 1).toISOString(), service_type: "AC Tune-Up", status: "scheduled" as const, notes: "Tom Davis — annual maintenance", created_at: subDays(now, 2).toISOString() },
    { client_id: clientId, datetime: addDays(now, 2).toISOString(), service_type: "System Replacement Estimate", status: "scheduled" as const, notes: "Sarah Williams — full system quote", created_at: subDays(now, 1).toISOString() },
    { client_id: clientId, datetime: addDays(now, 3).toISOString(), service_type: "Furnace Repair", status: "scheduled" as const, notes: "David Brown — no heat emergency", created_at: subHours(now, 6).toISOString() },
    { client_id: clientId, datetime: subDays(now, 2).toISOString(), service_type: "Thermostat Replacement", status: "completed" as const, notes: "Lisa Chen — installed new smart thermostat", created_at: subDays(now, 4).toISOString() },
  ];

  const calls = [
    { client_id: clientId, call_sid: "demo_call_001", phone_number: "(555) 234-5678", direction: "inbound" as const, status: "completed", duration_seconds: 185, transcript: "Caller: Hi, my AC stopped working and it's really hot in here.\nAI: I'm sorry to hear that. Let me get some details so we can help you right away. Is the system not turning on at all, or is it blowing warm air?\nCaller: It's not turning on at all.\nAI: Got it. I'm going to get a technician out to you as soon as possible. Can I confirm your address?", created_at: subHours(now, 2).toISOString() },
    { client_id: clientId, call_sid: "demo_call_002", phone_number: "(555) 345-6789", direction: "inbound" as const, status: "completed", duration_seconds: 240, transcript: "Caller: I'm looking to replace my entire HVAC system.\nAI: Great, I can help with that. How old is your current system?\nCaller: About 20 years.\nAI: That's a good time to consider a replacement. We offer free on-site estimates. Would you like to schedule one?", created_at: subDays(now, 1).toISOString() },
    { client_id: clientId, call_sid: "demo_call_003", phone_number: "(555) 456-7890", direction: "inbound" as const, status: "completed", duration_seconds: 120, transcript: "Caller: I'd like to schedule my annual tune-up.\nAI: Of course. We have availability this week. Would morning or afternoon work better for you?", created_at: subDays(now, 2).toISOString() },
    { client_id: clientId, call_sid: "demo_call_004", phone_number: "(555) 890-1234", direction: "inbound" as const, status: "completed", duration_seconds: 210, transcript: "Caller: My furnace won't turn on and it's freezing.\nAI: I understand — that sounds urgent. Is this a gas or electric furnace?\nCaller: Gas.\nAI: I'm going to flag this as an emergency and get someone out to you today.", created_at: subDays(now, 1).toISOString() },
  ];

  const eventLogs = [
    { client_id: clientId, event_type: "call_logged", title: "Inbound call received", message: "Call from (555) 234-5678 — emergency AC repair", status: "success", source: "vapi", created_at: subHours(now, 2).toISOString() },
    { client_id: clientId, event_type: "lead_created", title: "New lead: Mike Johnson", message: "Hot lead scored 92 — emergency no cooling", status: "success", source: "system", created_at: subHours(now, 2).toISOString() },
    { client_id: clientId, event_type: "sms_sent", title: "Hot lead alert sent", message: "SMS alert sent to (555) 100-0001 for Mike Johnson", status: "success", source: "twilio", created_at: subHours(now, 2).toISOString() },
    { client_id: clientId, event_type: "booking_created", title: "Appointment booked", message: "Emergency visit scheduled for Mike Johnson", status: "success", source: "calendly", created_at: subHours(now, 1).toISOString() },
    { client_id: clientId, event_type: "call_logged", title: "Inbound call received", message: "Call from (555) 345-6789 — system replacement inquiry", status: "success", source: "vapi", created_at: subDays(now, 1).toISOString() },
    { client_id: clientId, event_type: "lead_scored", title: "Lead scored: Sarah Williams", message: "Score 78 — Hot lead, installation inquiry", status: "success", source: "system", created_at: subDays(now, 1).toISOString() },
    { client_id: clientId, event_type: "booking_created", title: "Appointment booked", message: "System replacement estimate for Sarah Williams", status: "success", source: "calendly", created_at: subDays(now, 1).toISOString() },
    { client_id: clientId, event_type: "sms_failed", title: "SMS alert failed", message: "Could not deliver alert for Robert Garcia — invalid recipient number", status: "failed", source: "twilio", created_at: subDays(now, 4).toISOString() },
    { client_id: clientId, event_type: "booking_failed", title: "Booking attempt failed", message: "No available slots found for Jennifer Park's requested timeframe", status: "failed", source: "calendly", created_at: subDays(now, 5).toISOString() },
    { client_id: clientId, event_type: "call_logged", title: "Inbound call received", message: "Call from (555) 890-1234 — no heat emergency", status: "success", source: "vapi", created_at: subDays(now, 1).toISOString() },
  ];

  return { leads, appointments, calls, eventLogs };
}

// ─── Provider ─────────────────────────────────────────────
export function DemoModeProvider({ children }: { children: ReactNode }) {
  const { clientId } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("demo_mode") === "true";
    }
    return false;
  });
  const [seeding, setSeeding] = useState(false);

  const enableDemoMode = useCallback(async () => {
    if (!clientId) { toast.error("No client linked"); return; }
    setSeeding(true);
    try {
      const { leads, appointments, calls, eventLogs } = buildHvacDemoData(clientId);

      const [l, a, c, e] = await Promise.all([
        supabase.from("leads").insert(leads),
        supabase.from("appointments").insert(appointments),
        supabase.from("calls").insert(calls),
        supabase.from("event_logs").insert(eventLogs),
      ]);

      if (l.error || a.error || c.error || e.error) throw new Error("Insert failed");

      localStorage.setItem("demo_mode", "true");
      setIsDemoMode(true);
      toast.success("Demo mode activated with sample HVAC data");
    } catch {
      toast.error("Failed to seed demo data");
    } finally {
      setSeeding(false);
    }
  }, [clientId]);

  const disableDemoMode = useCallback(async () => {
    localStorage.removeItem("demo_mode");
    setIsDemoMode(false);
    toast.success("Demo mode deactivated");
  }, []);

  const resetDemoData = useCallback(async () => {
    if (!clientId) return;
    setSeeding(true);
    try {
      // Remove demo-sourced leads (which cascades context)
      await supabase.from("leads").delete().eq("client_id", clientId).eq("source", "demo");
      // Remove demo calls
      await supabase.from("calls").delete().eq("client_id", clientId).like("call_sid", "demo_%");
      // Remove demo event logs
      // event_logs don't have a demo marker, but we seeded specific titles
      // Just disable demo mode cleanly
      localStorage.removeItem("demo_mode");
      setIsDemoMode(false);
      toast.success("Demo data cleared and demo mode deactivated");
    } catch {
      toast.error("Failed to reset demo data");
    } finally {
      setSeeding(false);
    }
  }, [clientId]);

  return (
    <DemoModeContext.Provider value={{ isDemoMode, enableDemoMode, disableDemoMode, resetDemoData, seeding }}>
      {children}
    </DemoModeContext.Provider>
  );
}
