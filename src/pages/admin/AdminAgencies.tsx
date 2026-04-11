import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Search, Eye } from "lucide-react";

export default function AdminAgencies() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAgency, setSelectedAgency] = useState<any>(null);

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
      const { data } = await supabase.from("agency_subscriptions").select("*");
      return data || [];
    },
  });

  const { data: billingData } = useQuery({
    queryKey: ["admin-billing-subs"],
    queryFn: async () => {
      const { data } = await supabase.from("billing_subscriptions" as any).select("*");
      return (data || []) as any[];
    },
  });

  const { data: userCounts } = useQuery({
    queryKey: ["admin-user-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("client_id");
      const counts: Record<string, number> = {};
      data?.forEach((r: any) => {
        if (r.client_id) counts[r.client_id] = (counts[r.client_id] || 0) + 1;
      });
      return counts;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ agencyId, status }: { agencyId: string; status: string }) => {
      const { error } = await supabase
        .from("agency_subscriptions")
        .update({ status })
        .eq("agency_id", agencyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      toast.success("Status updated");
    },
  });

  const updatePlan = useMutation({
    mutationFn: async ({ agencyId, plan, amount }: { agencyId: string; plan: string; amount: number }) => {
      const { error } = await supabase
        .from("agency_subscriptions")
        .update({ plan, amount })
        .eq("agency_id", agencyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      toast.success("Plan updated");
    },
  });

  const planAmounts: Record<string, number> = { starter: 60000, professional: 120000, enterprise: 300000 };

  const filtered = agencies?.filter((a: any) => {
    const sub = subscriptions?.find((s: any) => s.agency_id === a.id);
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "all" || sub?.plan === planFilter;
    const matchStatus = statusFilter === "all" || sub?.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  }) || [];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Agencies</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search agencies..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Plan" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {!filtered.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">No agencies found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                     <th className="pb-2 font-medium">Agency</th>
                     <th className="pb-2 font-medium">Plan</th>
                     <th className="pb-2 font-medium">Status</th>
                     <th className="pb-2 font-medium">Billing</th>
                     <th className="pb-2 font-medium">Users</th>
                     <th className="pb-2 font-medium">Revenue</th>
                     <th className="pb-2 font-medium">Created</th>
                     <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a: any) => {
                     const sub = subscriptions?.find((s: any) => s.agency_id === a.id);
                     const bill = billingData?.find((b: any) => b.client_id === a.id);
                     const users = userCounts?.[a.id] || 0;
                    return (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">{a.name}</td>
                        <td className="py-3">
                          <Select
                            value={sub?.plan || "starter"}
                            onValueChange={(plan) => updatePlan.mutate({ agencyId: a.id, plan, amount: planAmounts[plan] || 60000 })}
                          >
                            <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="starter">Starter</SelectItem>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3">
                          <Badge variant={sub?.status === "active" ? "default" : "destructive"}>
                            {sub?.status || "no sub"}
                          </Badge>
                        </td>
                         <td className="py-3">
                           {bill ? (
                             <Badge variant={bill.subscription_status === "active" ? "default" : "secondary"}>
                               {bill.subscription_status} / {bill.payment_provider}
                             </Badge>
                           ) : (
                             <span className="text-xs text-muted-foreground">—</span>
                           )}
                         </td>
                         <td className="py-3">{users}</td>
                        <td className="py-3 text-muted-foreground">{format(new Date(a.created_at), "MMM d, yyyy")}</td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => setSelectedAgency({ ...a, sub })}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={sub?.status === "active" ? "destructive" : "default"}
                              onClick={() => updateStatus.mutate({
                                agencyId: a.id,
                                status: sub?.status === "active" ? "suspended" : "active",
                              })}
                            >
                              {sub?.status === "active" ? "Suspend" : "Activate"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedAgency} onOpenChange={() => setSelectedAgency(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAgency?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">ID</span><span className="font-mono text-xs">{selectedAgency?.id}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><Badge variant="secondary">{selectedAgency?.sub?.plan || "none"}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge>{selectedAgency?.sub?.status || "no sub"}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Revenue</span><span>${((selectedAgency?.sub?.amount || 0) / 100).toLocaleString()}/mo</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Users</span><span>{userCounts?.[selectedAgency?.id] || 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{selectedAgency?.created_at && format(new Date(selectedAgency.created_at), "MMM d, yyyy")}</span></div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
