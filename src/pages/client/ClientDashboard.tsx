import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Users, CalendarDays, TrendingUp, Clock, AlertTriangle, BarChart3 } from "lucide-react";
import { NeedsAttentionWidget } from "@/components/failures/NeedsAttentionWidget";
import { formatDistanceToNow, subDays, format } from "date-fns";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const CHART_COLORS = {
  hot: "hsl(0, 84%, 60%)",
  warm: "hsl(30, 90%, 55%)",
  cold: "hsl(215, 16%, 47%)",
  primary: "hsl(222, 47%, 11%)",
  accent: "hsl(210, 40%, 50%)",
};

export default function ClientDashboard() {
  const { clientId } = useAuth();
  const navigate = useNavigate();
  const [range, setRange] = useState("7");
  const [stats, setStats] = useState({ calls: 0, leads: 0, appointments: 0, hotLeads: 0, warmLeads: 0, coldLeads: 0, failedActions: 0, avgScore: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [callsTrend, setCallsTrend] = useState<any[]>([]);
  const [leadMix, setLeadMix] = useState<any[]>([]);
  const [apptsTrend, setApptsTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) { setLoading(false); return; }
    fetchData();
  }, [clientId, range]);

  const fetchData = async () => {
    setLoading(true);
    const now = new Date();
    const rangeStart = subDays(now, parseInt(range)).toISOString();

    const [callsRes, leadsRes, apptsRes, recentLeadsRes, upcomingRes, failedRes] = await Promise.all([
      supabase.from("calls").select("id, created_at").eq("client_id", clientId!).gte("created_at", rangeStart),
      supabase.from("leads").select("id, category, score, created_at, service_type").eq("client_id", clientId!).gte("created_at", rangeStart),
      supabase.from("appointments").select("id, created_at, status").eq("client_id", clientId!).gte("created_at", rangeStart),
      supabase.from("leads").select("*").eq("client_id", clientId!).order("created_at", { ascending: false }).limit(5),
      supabase.from("appointments").select("*").eq("client_id", clientId!).gte("datetime", now.toISOString()).order("datetime", { ascending: true }).limit(5),
      supabase.from("event_logs").select("id", { count: "exact", head: true }).eq("client_id", clientId!).eq("status", "failed").gte("created_at", rangeStart),
    ]);

    const calls = callsRes.data || [];
    const leads = leadsRes.data || [];
    const appts = apptsRes.data || [];
    const hot = leads.filter(l => l.category === "Hot").length;
    const warm = leads.filter(l => l.category === "Warm").length;
    const cold = leads.filter(l => l.category === "Cold").length;
    const scores = leads.map(l => l.score).filter(Boolean);

    setStats({
      calls: calls.length,
      leads: leads.length,
      appointments: appts.filter(a => a.status !== "cancelled").length,
      hotLeads: hot,
      warmLeads: warm,
      coldLeads: cold,
      failedActions: failedRes.count || 0,
      avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
    });

    // Build daily trends
    const days = parseInt(range);
    const callsByDay: Record<string, number> = {};
    const apptsByDay: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const key = format(subDays(now, days - 1 - i), "MMM d");
      callsByDay[key] = 0;
      apptsByDay[key] = 0;
    }
    calls.forEach(c => { const k = format(new Date(c.created_at), "MMM d"); if (callsByDay[k] !== undefined) callsByDay[k]++; });
    appts.forEach(a => { const k = format(new Date(a.created_at), "MMM d"); if (apptsByDay[k] !== undefined) apptsByDay[k]++; });

    setCallsTrend(Object.entries(callsByDay).map(([date, count]) => ({ date, count })));
    setApptsTrend(Object.entries(apptsByDay).map(([date, count]) => ({ date, count })));
    setLeadMix([
      { name: "Hot", value: hot, color: CHART_COLORS.hot },
      { name: "Warm", value: warm, color: CHART_COLORS.warm },
      { name: "Cold", value: cold, color: CHART_COLORS.cold },
    ].filter(d => d.value > 0));

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

  const hasData = stats.calls > 0 || stats.leads > 0;

  return (
    <ClientLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Your business at a glance</p>
          </div>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!clientId && !loading && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Your account is not linked to a client yet. Please contact your administrator.
            </CardContent>
          </Card>
        )}

        <NeedsAttentionWidget variant="client" clientId={clientId} />

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Calls handled", value: stats.calls, icon: Phone, onClick: () => navigate("/client/calls") },
            { label: "Leads captured", value: stats.leads, icon: Users, onClick: () => navigate("/client/leads") },
            { label: "Hot leads", value: stats.hotLeads, icon: TrendingUp, onClick: () => navigate("/client/leads") },
            { label: "Booked", value: stats.appointments, icon: CalendarDays, onClick: () => navigate("/client/appointments") },
            { label: "Issues", value: stats.failedActions, icon: AlertTriangle, onClick: () => navigate("/client/activity") },
            { label: "Avg score", value: stats.avgScore, icon: BarChart3 },
          ].map(kpi => (
            <Card key={kpi.label} className={kpi.onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} onClick={kpi.onClick}>
              <CardContent className="pt-5 pb-4 px-4">
                <div className="flex items-center gap-2 mb-1">
                  <kpi.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {!hasData && !loading && clientId && (
          <DemoEmptyState
            title="No activity yet"
            description="Once your AI receptionist starts handling calls, you'll see calls, leads, and appointments here."
          />
        )}

        {/* Charts */}
        {hasData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Calls over time */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Calls handled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={callsTrend}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="count" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} name="Calls" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Lead mix donut */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Lead quality mix</CardTitle>
              </CardHeader>
              <CardContent>
                {leadMix.length > 0 ? (
                  <div className="h-48 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={leadMix} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                          {leadMix.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No leads yet</div>
                )}
                <div className="flex gap-4 justify-center text-xs mt-1">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive inline-block" /> Hot {stats.hotLeads}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-warm inline-block" /> Warm {stats.warmLeads}</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground inline-block" /> Cold {stats.coldLeads}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Appointments trend + recent activity */}
        {hasData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Appointments booked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={apptsTrend}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Bar dataKey="count" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} name="Appointments" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Leads */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent leads</CardTitle>
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
          </div>
        )}

        {/* Upcoming appointments */}
        {upcomingAppointments.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming appointments</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}
      </div>
    </ClientLayout>
  );
}
