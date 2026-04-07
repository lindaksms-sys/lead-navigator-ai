import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function ClientAppointments() {
  const { clientId } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    const fetch = async () => {
      const { data } = await supabase.from("appointments").select("*").eq("client_id", clientId).order("datetime", { ascending: true });
      setAppointments(data || []);
      setLoading(false);
    };
    fetch();
  }, [clientId]);

  const now = new Date();
  const upcoming = appointments.filter((a) => new Date(a.datetime) >= now);
  const past = appointments.filter((a) => new Date(a.datetime) < now);

  const statusColor = (s: string) => {
    switch (s) { case "confirmed": return "default"; case "completed": return "secondary"; case "cancelled": case "no_show": return "destructive"; default: return "outline"; }
  };

  const AppointmentTable = ({ items }: { items: any[] }) => (
    <div className="rounded-lg border border-border bg-card overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No appointments</TableCell></TableRow>
          ) : items.map((appt) => (
            <TableRow key={appt.id}>
              <TableCell className="text-xs">
                {new Date(appt.datetime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </TableCell>
              <TableCell className="text-xs capitalize">{appt.service_type?.replace("_", " ") || "—"}</TableCell>
              <TableCell><Badge variant={statusColor(appt.status) as any} className="text-xs capitalize">{appt.status}</Badge></TableCell>
              <TableCell className="text-xs max-w-[150px] truncate">{appt.notes || "—"}</TableCell>
              <TableCell>
                {appt.calendar_link ? (
                  <a href={appt.calendar_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">Open</a>
                ) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <ClientLayout>
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Appointments</h1>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming"><AppointmentTable items={upcoming} /></TabsContent>
            <TabsContent value="past"><AppointmentTable items={past} /></TabsContent>
          </Tabs>
        )}
      </div>
    </ClientLayout>
  );
}
