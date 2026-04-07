import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LeadCard } from "@/components/leads/LeadCard";
import { LeadDetail } from "@/components/leads/LeadDetail";
import { AutomationRules } from "@/components/leads/AutomationRules";
import { Button } from "@/components/ui/button";
import { Plus, Bell, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];
type Category = "Hot" | "Warm" | "Cold";

const columns: Category[] = ["Hot", "Warm", "Cold"];
const columnColors: Record<Category, string> = {
  Hot: "border-destructive/40",
  Warm: "border-accent-warm/40",
  Cold: "border-muted/60",
};

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [hotCount, setHotCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeads = async () => {
      const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (data) setLeads(data);
    };
    fetchLeads();

    const channel = supabase
      .channel("leads-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDrop = async (category: Category, e: React.DragEvent) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    if (!leadId) return;
    await supabase.from("leads").update({ category }).eq("id", leadId);
  };

  const grouped = columns.reduce((acc, cat) => {
    acc[cat] = leads.filter((l) => l.category === cat);
    return acc;
  }, {} as Record<Category, Lead[]>);

  const chartData = [
    { range: "0-20", count: leads.filter((l) => l.score <= 20).length },
    { range: "21-40", count: leads.filter((l) => l.score > 20 && l.score <= 40).length },
    { range: "41-60", count: leads.filter((l) => l.score > 40 && l.score <= 60).length },
    { range: "61-80", count: leads.filter((l) => l.score > 60 && l.score <= 80).length },
    { range: "81-100", count: leads.filter((l) => l.score > 80).length },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lead Dashboard</h1>
            <p className="text-muted-foreground text-sm">{leads.length} total leads</p>
          </div>
          <Button onClick={() => navigate("/leads/new")}>
            <Plus className="h-4 w-4 mr-1" /> New Lead
          </Button>
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((cat) => (
            <div
              key={cat}
              className={`rounded-lg border-2 ${columnColors[cat]} bg-card p-3 min-h-[300px]`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(cat, e)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">{cat}</h3>
                <span className="text-xs text-muted-foreground">{grouped[cat].length}</span>
              </div>
              <div className="space-y-2">
                {grouped[cat].map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onClick={setSelectedLead} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Analytics & Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Score Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <AutomationRules />
        </div>
      </div>

      <LeadDetail lead={selectedLead} open={!!selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
}
