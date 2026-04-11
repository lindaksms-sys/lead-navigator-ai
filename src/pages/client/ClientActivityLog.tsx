import { useState } from "react";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Search, CheckCircle, AlertTriangle, XCircle, Activity } from "lucide-react";

const CLIENT_EVENT_TYPES = [
  "lead_created", "lead_scored", "sms_sent", "sms_failed",
  "booking_created", "booking_failed", "escalation_created", "call_logged",
];

const FRIENDLY_LABELS: Record<string, string> = {
  lead_created: "New lead",
  lead_scored: "Lead scored",
  sms_sent: "Alert sent",
  sms_failed: "Alert failed",
  booking_created: "Appointment booked",
  booking_failed: "Booking failed",
  escalation_created: "Escalation",
  call_logged: "Call received",
};

function statusIcon(status: string) {
  if (status === "success") return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  if (status === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <XCircle className="h-4 w-4 text-red-500" />;
}

export default function ClientActivityLog() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ["client-event-logs", typeFilter],
    queryFn: async () => {
      let q = supabase
        .from("event_logs")
        .select("*")
        .in("event_type", CLIENT_EVENT_TYPES)
        .order("created_at", { ascending: false })
        .limit(100);
      if (typeFilter !== "all") q = q.eq("event_type", typeFilter);
      const { data } = await q;
      return data || [];
    },
  });

  const filtered = (logs || []).filter((l: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return l.title?.toLowerCase().includes(s) || l.message?.toLowerCase().includes(s);
  });

  return (
    <ClientLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-sm text-muted-foreground">Recent calls, leads, alerts, and bookings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search activity..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activity</SelectItem>
            {CLIENT_EVENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{FRIENDLY_LABELS[t] || t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">Activity will appear here as your AI receptionist handles calls.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((log: any) => (
            <Card key={log.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setSelected(log)}>
              <CardContent className="py-3 px-4 flex items-start gap-3">
                <div className="mt-0.5">{statusIcon(log.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm">{log.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {FRIENDLY_LABELS[log.event_type] || log.event_type}
                    </Badge>
                  </div>
                  {log.message && <p className="text-sm text-muted-foreground truncate">{log.message}</p>}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(log.created_at), "MMM d, HH:mm")}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected && statusIcon(selected.status)}
              <span>{selected?.title}</span>
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">Type</p>
                  <p>{FRIENDLY_LABELS[selected.event_type] || selected.event_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Time</p>
                  <p>{format(new Date(selected.created_at), "MMM d, yyyy HH:mm:ss")}</p>
                </div>
              </div>
              {selected.message && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Details</p>
                  <p className="bg-muted/50 rounded p-3">{selected.message}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ClientLayout>
  );
}
