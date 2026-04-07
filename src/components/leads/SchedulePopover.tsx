import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

interface SchedulePopoverProps {
  lead: Lead;
}

interface Slot {
  start_time: string;
  status: string;
}

export function SchedulePopover({ lead }: SchedulePopoverProps) {
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<string | null>(null);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

      // Get event type URI from settings
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: setting } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "calendly_event_type_uri")
        .maybeSingle();

      if (!setting?.value) {
        toast.error("Please configure Calendly event type in Settings → Scheduling");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/calendly-proxy?action=availability&event_type_uri=${encodeURIComponent(setting.value)}`,
        { headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      const data = await res.json();
      setSlots((data.slots || []).slice(0, 6));
    } catch {
      toast.error("Failed to fetch availability");
    }
    setLoading(false);
  };

  const bookSlot = async (startTime: string) => {
    setBooking(startTime);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: setting } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "calendly_event_type_uri")
        .maybeSingle();

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/calendly-proxy?action=book`,
        {
          method: "POST",
          headers: {
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadId: lead.id,
            datetime: startTime,
            serviceType: lead.service_type,
            notes: `Booked for ${lead.name}`,
            eventTypeUri: setting?.value,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success(
          data.calendar_link
            ? "Appointment booked! Calendar link created."
            : "Appointment booked!"
        );
        if (data.calendar_link) {
          window.open(data.calendar_link, "_blank");
        }
        setOpen(false);
      } else {
        toast.error(data.error || "Booking failed");
      }
    } catch {
      toast.error("Failed to book appointment");
    }
    setBooking(null);
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) fetchSlots(); }}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => e.stopPropagation()}
        >
          <Calendar className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" onClick={(e) => e.stopPropagation()}>
        <h4 className="text-sm font-semibold text-foreground mb-2">Schedule {lead.name}</h4>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : slots.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No available slots found.</p>
        ) : (
          <div className="space-y-1.5">
            {slots.map((slot) => {
              const d = new Date(slot.start_time);
              const label = d.toLocaleString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              });
              return (
                <Button
                  key={slot.start_time}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  disabled={booking === slot.start_time}
                  onClick={() => bookSlot(slot.start_time)}
                >
                  {booking === slot.start_time ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Calendar className="h-3 w-3 mr-1" />
                  )}
                  {label}
                </Button>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
