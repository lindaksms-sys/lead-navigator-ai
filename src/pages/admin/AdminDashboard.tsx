import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, DollarSign, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export default function AdminDashboard() {
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

  const { data: roleCount } = useQuery({
    queryKey: ["admin-user-count"],
    queryFn: async () => {
      const { count } = await supabase.from("user_roles").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const totalAgencies = agencies?.length || 0;
  const activeSubscriptions = subscriptions?.filter((s: any) => s.status === "active") || [];
  const mrr = activeSubscriptions.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);
  const thisMonth = agencies?.filter((a: any) => {
    const d = new Date(a.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }) || [];

  const stats = [
    { label: "Total Agencies", value: totalAgencies, icon: Building2, color: "text-blue-500" },
    { label: "Active Users", value: roleCount, icon: Users, color: "text-green-500" },
    { label: "Monthly Revenue", value: `$${(mrr / 100).toLocaleString()}`, icon: DollarSign, color: "text-emerald-500" },
    { label: "New This Month", value: thisMonth.length, icon: UserPlus, color: "text-purple-500" },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className={`h-8 w-8 ${s.color} opacity-70`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Agencies</CardTitle>
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
                        <td className="py-3">
                          <Badge variant="secondary">{sub?.plan || "none"}</Badge>
                        </td>
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
    </AdminLayout>
  );
}
