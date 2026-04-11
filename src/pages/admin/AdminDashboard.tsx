import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, DollarSign, UserPlus, Phone, TrendingUp, CalendarDays, AlertTriangle } from "lucide-react";
import { NeedsAttentionWidget } from "@/components/failures/NeedsAttentionWidget";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

const CHART_COLORS = {
  primary: "hsl(222, 47%, 11%)",
  accent: "hsl(210, 40%, 50%)",
  destructive: "hsl(0, 84%, 60%)",
  warm: "hsl(30, 90%, 55%)",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState("30");
  const [tenantFilter, setTenantFilter] = useState("all");
  const rangeStart = subDays(new Date(), parseInt(range)).toISOString();

  const { data: agencies } = useQuery({
    queryKey: ["admin-agencies"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: subscriptions } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const { data } = await supabase.from("agency_subscriptions").select("*, clients(name)");
      return data || [];
    },
  });

  const { data: callsData } = useQuery({
    queryKey: ["admin-calls", range, tenantFilter],
    queryFn: async () => {
      let q = supabase.from("calls").select("id, created_at, client_id").gte("created_at", rangeStart);
      if (tenantFilter !== "all") q = q.eq("client_id", tenantFilter);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: leadsData } = useQuery({
    queryKey: ["admin-leads", range, tenantFilter],
    queryFn: async () => {
      let q = supabase.from("leads").select("id, category, score, created_at, client_id").gte("created_at", rangeStart);
      if (tenantFilter !== "all") q = q.eq("client_id", tenantFilter);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: apptsData } = useQuery({
    queryKey: ["admin-appts", range, tenantFilter],
    queryFn: async () => {
      let q = supabase.from("appointments").select("id, created_at, status, client_id").gte("created_at", rangeStart);
      if (tenantFilter !== "all") q = q.eq("client_id", tenantFilter);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: failedCount } = useQuery({
    queryKey: ["admin-failures", range, tenantFilter],
    queryFn: async () => {
      let q = supabase.from("event_logs").select("id", { count: "exact", head: true }).eq("status", "failed").gte("created_at", rangeStart);
      if (tenantFilter !== "all") q = q.eq("client_id", tenantFilter);
      const { count } = await q;
      return count || 0;
    },
  });

  const totalAgencies = agencies?.length || 0;
  const calls = callsData || [];
  const leads = leadsData || [];
  const appts = (apptsData || []).filter((a: any) => a.status !== "cancelled");
  const hotLeads = leads.filter((l: any) => l.category === "Hot").length;

  const activeSubscriptions = subscriptions?.filter((s: any) => s.status === "active") || [];
  const mrr = activeSubscriptions.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

  // Build trend data
  const days = parseInt(range);
  const now = new Date();
  const buildTrend = (items: any[]) => {
    const byDay: Record<string, number> = {};
    for (let i = 0; i < Math.min(days, 30); i++) {
      byDay[format(subDays(now, Math.min(days, 30) - 1 - i), "MMM d")] = 0;
    }
    items.forEach(item => {
      const k = format(new Date(item.created_at), "MMM d");
      if (byDay[k] !== undefined) byDay[k]++;
    });
    return Object.entries(byDay).map(([date, count]) => ({ date, count }));
  };

  const callsTrend = buildTrend(calls);
  const apptsTrend = buildTrend(appts);

  // Leads by tenant
  const leadsByTenant = (agencies || []).map((a: any) => ({
    name: a.name.length > 15 ? a.name.slice(0, 15) + "…" : a.name,
    leads: leads.filter((l: any) => l.client_id === a.id).length,
    calls: calls.filter((c: any) => c.client_id === a.id).length,
  })).filter(t => t.leads > 0 || t.calls > 0).slice(0, 10);

  const kpis = [
    { label: "Total tenants", value: totalAgencies, icon: Building2, onClick: () => navigate("/admin/agencies") },
    { label: "Calls handled", value: calls.length, icon: Phone },
    { label: "Leads captured", value: leads.length, icon: Users },
    { label: "Hot leads", value: hotLeads, icon: TrendingUp },
    { label: "Booked", value: appts.length, icon: CalendarDays },
    { label: "Issues", value: failedCount || 0, icon: AlertTriangle, onClick: () => navigate("/admin/logs") },
    { label: "MRR", value: `$${(mrr / 100).toLocaleString()}`, icon: DollarSign, onClick: () => navigate("/admin/billing") },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Select value={tenantFilter} onValueChange={setTenantFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All tenants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tenants</SelectItem>
                {(agencies || []).map((a: any) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {kpis.map(kpi => (
            <Card key={kpi.label} className={kpi.onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} onClick={kpi.onClick}>
              <CardContent className="pt-5 pb-4 px-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <kpi.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                </div>
                <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <NeedsAttentionWidget variant="admin" />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Calls over time</CardTitle>
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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Appointments booked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
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
        </div>

        {/* Activity by tenant */}
        {leadsByTenant.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Activity by tenant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsByTenant} layout="vertical">
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={110} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="leads" fill={CHART_COLORS.warm} radius={[0, 4, 4, 0]} name="Leads" />
                    <Bar dataKey="calls" fill={CHART_COLORS.accent} radius={[0, 4, 4, 0]} name="Calls" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent agencies table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent agencies</CardTitle>
          </CardHeader>
          <CardContent>
            {!agencies?.length ? (
              <p className="text-sm text-muted-foreground">No agencies yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Name</th>
                      <th className="pb-2 font-medium">Plan</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agencies.slice(0, 10).map((a: any) => {
                      const sub = subscriptions?.find((s: any) => s.agency_id === a.id);
                      return (
                        <tr key={a.id} className="border-b last:border-0">
                          <td className="py-3 font-medium">{a.name}</td>
                          <td className="py-3"><Badge variant="secondary">{sub?.plan || "none"}</Badge></td>
                          <td className="py-3">
                            <Badge variant={sub?.status === "active" ? "default" : "destructive"}>
                              {sub?.status || "no sub"}
                            </Badge>
                          </td>
                          <td className="py-3 text-muted-foreground">{format(new Date(a.created_at), "MMM d, yyyy")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
