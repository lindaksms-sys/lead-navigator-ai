import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Calendar, CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface EventType {
  uri: string;
  name: string;
  duration: number;
  slug: string;
}

interface Appointment {
  id: string;
  datetime: string;
  service_type: string | null;
  status: string;
  calendar_link: string | null;
  lead_id: string | null;
}

export default function SchedulingSettings() {
  const navigate = useNavigate();
  const [connected, setConnected] = useState<boolean | null>(null);
  const [userName, setUserName] = useState("");
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedEventType, setSelectedEventType] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [fetchingTypes, setFetchingTypes] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // Load saved event type URI
    const { data: setting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "calendly_event_type_uri")
      .maybeSingle();
    if (setting?.value) setSelectedEventType(setting.value);

    // Load upcoming appointments
    const { data: appts } = await supabase
      .from("appointments")
      .select("*")
      .gte("datetime", new Date().toISOString())
      .order("datetime", { ascending: true })
      .limit(10);
    if (appts) setAppointments(appts as Appointment[]);

    // Test connection
    await testConnection();
    setLoading(false);
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("calendly-proxy", {
        body: null,
        headers: {},
      });

      // Use query param approach
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/calendly-proxy?action=test`,
        {
          headers: {
            "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const result = await res.json();

      setConnected(result.connected ?? false);
      if (result.user) setUserName(result.user.name || result.user.email || "");
      if (result.connected) toast.success("Calendly connected!");
      else toast.error("Calendly connection failed");
    } catch {
      setConnected(false);
      toast.error("Could not reach Calendly");
    }
    setTesting(false);
  };

  const fetchEventTypes = async () => {
    setFetchingTypes(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/calendly-proxy?action=event_types`,
        {
          headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        }
      );
      const data = await res.json();
      if (data.event_types) {
        setEventTypes(data.event_types);
        toast.success(`Found ${data.event_types.length} event type(s)`);
      }
    } catch {
      toast.error("Failed to fetch event types");
    }
    setFetchingTypes(false);
  };

  const saveEventType = async (uri: string) => {
    setSelectedEventType(uri);
    const { data: existing } = await supabase.from("settings").select("id").eq("key", "calendly_event_type_uri").maybeSingle();
    if (existing) {
      await supabase.from("settings").update({ value: uri }).eq("key", "calendly_event_type_uri");
    } else {
      await supabase.from("settings").insert({ key: "calendly_event_type_uri", value: uri });
    }
    toast.success("Event type saved");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/leads")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Scheduling Settings</h1>
            <p className="text-muted-foreground text-sm">Configure Calendly integration for appointment booking</p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Calendly Connection</p>
                <p className="text-sm text-muted-foreground">
                  {userName ? `Connected as ${userName}` : "Connect your Calendly account"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {connected === true && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" /> Connected
                </Badge>
              )}
              {connected === false && (
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="h-3 w-3" /> Disconnected
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={testConnection} disabled={testing}>
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Event Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Event Type</label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchEventTypes} disabled={fetchingTypes || !connected}>
                {fetchingTypes ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Fetch Event Types
              </Button>
            </div>
            {eventTypes.length > 0 && (
              <Select value={selectedEventType} onValueChange={saveEventType}>
                <SelectTrigger className="max-w-md">
                  <SelectValue placeholder="Select an event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((et) => (
                    <SelectItem key={et.uri} value={et.uri}>
                      {et.name} ({et.duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedEventType && (
              <p className="text-xs text-muted-foreground truncate">URI: {selectedEventType}</p>
            )}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Upcoming Appointments</h3>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appt) => (
                    <TableRow key={appt.id}>
                      <TableCell className="text-xs">
                        {new Date(appt.datetime).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs capitalize">
                        {appt.service_type?.replace("_", " ") || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">{appt.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {appt.calendar_link ? (
                          <a href={appt.calendar_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
                            Open
                          </a>
                        ) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
