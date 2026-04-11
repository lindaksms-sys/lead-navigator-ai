import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Users, CalendarDays, TrendingUp, Clock } from "lucide-react";
import { NeedsAttentionWidget } from "@/components/failures/NeedsAttentionWidget";
import { formatDistanceToNow } from "date-fns";

export default function ClientDashboard() {
  const { clientId } = useAuth();
  const [stats, setStats] = useState({ calls: 0, leads: 0, appointments: 0, hotLeads: 0, warmLeads: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [clientId]);

  const fetchData = async () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    // Parallel queries
    const [callsRes, leadsRes, apptsRes, recentLeadsRes, upcomingRes] = await Promise.all([
      supabase.from("calls").select("id", { count: "exact", head: true }).eq("client_id", clientId!).gte("created_at", todayStart),
      supabase.from("leads").select("id, category", { count: "exact" }).eq("client_id", clientId!).gte("created_at", weekAgo.toISOString()),
      supabase.from("appointments").select("id", { count: "exact", head: true }).eq("client_id", clientId!).eq("status", "scheduled"),
      supabase.from("leads").select("*").eq("client_id", clientId!).order("created_at", { ascending: false }).limit(5),
      supabase.from("appointments").select("*").eq("client_id", clientId!).gte("datetime", now.toISOString()).order("datetime", { ascending: true }).limit(5),
    ]);

    const leads = leadsRes.data || [];
    setStats({
      calls: callsRes.count || 0,
      leads: leadsRes.count || 0,
      appointments: apptsRes.count || 0,
      hotLeads: leads.filter((l) => l.category === "Hot").length,
      warmLeads: leads.filter((l) => l.category === "Warm").length,
    });

    setRecentLeads(recentLeadsRes.data || []);
    setUpcomingAppointments(upcomingRes.data || []);
    setLoading(false);
  };

  const categoryColor = (cat: string) => {
    switch (cat) {
      case "Hot": return "bg-destructive text-destructive-foreground";
      case "Warm": return "bg-accent-warm text-accent-warm-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <ClientLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Your business at a glance</p>
        </div>

        {!clientId && !loading && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Your account is not linked to a client yet. Please contact your administrator.
            </CardContent>
          </Card>
        )}

        <NeedsAttentionWidget variant="client" clientId={clientId} />

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> Today's Calls
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-foreground">{stats.calls}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> Leads This Week
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-foreground">{stats.leads}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> Appointments
              </CardTitle>
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-foreground">{stats.appointments}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" /> Hot Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{stats.hotLeads}</p>
              <p className="text-xs text-muted-foreground">{stats.warmLeads} warm</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent Leads */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Leads</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground">No leads yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{lead.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge className={categoryColor(lead.category)}>{lead.category} · {lead.score}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((appt) => (
                    <div key={appt.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(appt.datetime).toLocaleString("en-US", {
                            weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {appt.service_type?.replace("_", " ") || "General"}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">{appt.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
}
