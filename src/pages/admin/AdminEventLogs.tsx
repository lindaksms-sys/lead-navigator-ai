import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Search, AlertTriangle, CheckCircle, XCircle, Activity, RefreshCw } from "lucide-react";

const EVENT_TYPES = [
  "webhook_received", "call_logged", "lead_created", "lead_scored",
  "sms_sent", "sms_failed", "availability_checked", "booking_created",
  "booking_failed", "quote_logged", "escalation_created",
  "onboarding_completed", "integration_connected", "integration_failed", "test_call_run",
];

const SOURCES = ["vapi", "calendly", "twilio", "system", "user"];
const STATUSES = ["success", "warning", "failed"];

function statusBadge(status: string) {
  if (status === "success") return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
  if (status === "warning") return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
  return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
}

function sourceBadge(source: string) {
  const colors: Record<string, string> = {
    vapi: "bg-blue-50 text-blue-700 border-blue-200",
    calendly: "bg-violet-50 text-violet-700 border-violet-200",
    twilio: "bg-rose-50 text-rose-700 border-rose-200",
    system: "bg-gray-50 text-gray-700 border-gray-200",
    user: "bg-teal-50 text-teal-700 border-teal-200",
  };
  return <Badge className={colors[source] || colors.system}>{source}</Badge>;
}

export default function AdminEventLogs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["admin-event-logs", statusFilter, typeFilter, sourceFilter],
    queryFn: async () => {
      let q = supabase
        .from("event_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      if (typeFilter !== "all") q = q.eq("event_type", typeFilter);
      if (sourceFilter !== "all") q = q.eq("source", sourceFilter);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: failedCount } = useQuery({
    queryKey: ["admin-failed-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("event_logs")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed");
      return count || 0;
    },
  });

  const filtered = (logs || []).filter((l: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      l.title?.toLowerCase().includes(s) ||
      l.message?.toLowerCase().includes(s) ||
      l.event_type?.toLowerCase().includes(s)
    );
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Event Logs</h1>
          <p className="text-sm text-muted-foreground">Monitor all webhook, call, and automation activity</p>
        </div>
        <div className="flex items-center gap-2">
          {(failedCount ?? 0) > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setStatusFilter("failed")}>
              <AlertTriangle className="h-4 w-4 mr-1" />{failedCount} Failed
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" />Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Event type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Source" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sources</SelectItem>
                {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Launch status summary */}
      <LaunchStatusPanel />

      {/* Logs table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading logs...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No events found</p>
              <p className="text-xs text-muted-foreground mt-1">Events will appear here as calls and automations run.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Time</TableHead>
                  <TableHead className="w-[90px]">Status</TableHead>
                  <TableHead className="w-[90px]">Source</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((log: any) => (
                  <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(log)}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                    </TableCell>
                    <TableCell>{statusBadge(log.status)}</TableCell>
                    <TableCell>{sourceBadge(log.source)}</TableCell>
                    <TableCell className="font-medium text-sm">{log.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-[300px]">{log.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selected && statusBadge(selected.status)}
              <span>{selected?.title}</span>
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">Event Type</p>
                  <p className="font-medium">{selected.event_type.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Source</p>
                  <p>{sourceBadge(selected.source)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Time</p>
                  <p>{format(new Date(selected.created_at), "MMM d, yyyy HH:mm:ss")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Actor</p>
                  <p>{selected.actor_role || "—"}</p>
                </div>
              </div>
              {selected.message && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Message</p>
                  <p className="bg-muted/50 rounded p-3">{selected.message}</p>
                </div>
              )}
              {selected.payload && (
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Payload</p>
                  <pre className="bg-muted/50 rounded p-3 text-xs overflow-auto max-h-48 whitespace-pre-wrap">
                    {JSON.stringify(selected.payload, null, 2)}
                  </pre>
                </div>
              )}
              <div className="flex gap-2 text-xs">
                {selected.lead_id && <Badge variant="outline">Lead: {selected.lead_id.slice(0, 8)}…</Badge>}
                {selected.call_id && <Badge variant="outline">Call: {selected.call_id.slice(0, 8)}…</Badge>}
                {selected.client_id && <Badge variant="outline">Tenant: {selected.client_id.slice(0, 8)}…</Badge>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function LaunchStatusPanel() {
  const { data } = useQuery({
    queryKey: ["launch-status"],
    queryFn: async () => {
      const [webhook, booking, sms, failed] = await Promise.all([
        supabase.from("event_logs").select("created_at").eq("event_type", "webhook_received").order("created_at", { ascending: false }).limit(1),
        supabase.from("event_logs").select("created_at").eq("event_type", "booking_created").order("created_at", { ascending: false }).limit(1),
        supabase.from("event_logs").select("created_at").eq("event_type", "sms_sent").order("created_at", { ascending: false }).limit(1),
        supabase.from("event_logs").select("created_at, title").eq("status", "failed").order("created_at", { ascending: false }).limit(1),
      ]);
      return {
        lastWebhook: webhook.data?.[0]?.created_at,
        lastBooking: booking.data?.[0]?.created_at,
        lastSms: sms.data?.[0]?.created_at,
        lastFailed: failed.data?.[0],
      };
    },
  });

  if (!data) return null;

  const items = [
    { label: "Webhook", value: data.lastWebhook ? format(new Date(data.lastWebhook), "MMM d, HH:mm") : "No activity", ok: !!data.lastWebhook },
    { label: "Last booking", value: data.lastBooking ? format(new Date(data.lastBooking), "MMM d, HH:mm") : "None yet", ok: !!data.lastBooking },
    { label: "Last SMS", value: data.lastSms ? format(new Date(data.lastSms), "MMM d, HH:mm") : "None yet", ok: !!data.lastSms },
    { label: "Last failure", value: data.lastFailed ? `${format(new Date(data.lastFailed.created_at), "MMM d, HH:mm")} — ${data.lastFailed.title}` : "None", ok: !data.lastFailed },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-sm font-medium mt-1 flex items-center gap-1">
              <span className={`inline-block h-2 w-2 rounded-full ${item.ok ? "bg-emerald-500" : "bg-red-400"}`} />
              {item.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
