import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ClientLeads() {
  const { clientId } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!clientId) return;
    fetchLeads();
  }, [clientId, filter]);

  const fetchLeads = async () => {
    let query = supabase.from("leads").select("*").eq("client_id", clientId!).order("created_at", { ascending: false });
    if (filter === "hot") query = query.eq("category", "Hot");
    if (filter === "new") query = query.eq("status", "new");
    if (filter === "scheduled") query = query.eq("status", "scheduled");
    const { data } = await query.limit(100);
    setLeads(data || []);
    setLoading(false);
  };

  const updateStatus = async (leadId: string, status: string) => {
    await supabase.from("leads").update({ status: status as any }).eq("id", leadId);
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, status } : l));
    toast.success("Status updated");
  };

  const exportCsv = () => {
    const headers = ["Name", "Phone", "Email", "Score", "Category", "Status", "Date"];
    const rows = leads.map((l) => [l.name, l.phone, l.email || "", l.score, l.category, l.status, new Date(l.created_at).toLocaleDateString()]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = leads.filter((l) => !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search));

  const categoryColor = (cat: string) => {
    switch (cat) { case "Hot": return "bg-destructive text-destructive-foreground"; case "Warm": return "bg-accent-warm text-accent-warm-foreground"; default: return "bg-muted text-muted-foreground"; }
  };

  return (
    <ClientLayout>
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="hot">Hot Only</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No leads found</TableCell></TableRow>
                ) : filtered.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium text-foreground">{lead.name}</TableCell>
                    <TableCell className="font-mono text-xs">{lead.phone}</TableCell>
                    <TableCell><Badge className={categoryColor(lead.category)}>{lead.category} · {lead.score}</Badge></TableCell>
                    <TableCell>
                      <Select value={lead.status} onValueChange={(v) => updateStatus(lead.id, v)}>
                        <SelectTrigger className="h-7 text-xs w-[110px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["new","contacted","quoted","scheduled","won","lost","nurture"].map((s) => (
                            <SelectItem key={s} value={s} className="text-xs capitalize">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
