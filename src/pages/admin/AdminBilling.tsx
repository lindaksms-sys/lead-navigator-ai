import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subMonths } from "date-fns";

export default function AdminBilling() {
  const { data: subscriptions } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const { data } = await supabase.from("agency_subscriptions").select("*, clients(name)");
      return data || [];
    },
  });

  const active = subscriptions?.filter((s: any) => s.status === "active") || [];
  const mrr = active.reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

  // Generate last 6 months chart data
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const monthSubs = active.filter((s: any) => new Date(s.start_date) <= date);
    return {
      month: format(date, "MMM"),
      revenue: monthSubs.reduce((sum: number, s: any) => sum + (s.amount || 0), 0) / 100,
    };
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Billing & Revenue</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
                <p className="text-3xl font-bold">${(mrr / 100).toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-3xl font-bold">{active.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suspended</p>
                <p className="text-3xl font-bold">
                  {subscriptions?.filter((s: any) => s.status === "suspended").length || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-destructive opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Revenue Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `$${v.toLocaleString()}`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {!subscriptions?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">No subscriptions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Agency</th>
                    <th className="pb-2 font-medium">Plan</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Start Date</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((s: any) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{(s as any).clients?.name || "—"}</td>
                      <td className="py-3"><Badge variant="secondary">{s.plan}</Badge></td>
                      <td className="py-3">${(s.amount / 100).toLocaleString()}/mo</td>
                      <td className="py-3">
                        <Badge variant={s.status === "active" ? "default" : "destructive"}>{s.status}</Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">{format(new Date(s.start_date), "MMM d, yyyy")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
