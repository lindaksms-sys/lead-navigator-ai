import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ClientCalls() {
  const { clientId } = useAuth();
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<any>(null);

  useEffect(() => {
    if (!clientId) return;
    const fetch = async () => {
      const { data } = await supabase.from("calls").select("*").eq("client_id", clientId).order("created_at", { ascending: false }).limit(50);
      setCalls(data || []);
      setLoading(false);
    };
    fetch();
  }, [clientId]);

  const exportCsv = () => {
    const headers = ["Date", "Phone", "Direction", "Duration", "Status"];
    const rows = calls.map((c) => [
      new Date(c.created_at).toLocaleString(), c.phone_number || "", c.direction || "", c.duration_seconds ? `${c.duration_seconds}s` : "", c.status || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "calls.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ClientLayout>
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Calls</h1>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No calls yet</TableCell></TableRow>
                ) : calls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell className="text-xs">{new Date(call.created_at).toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs">{call.phone_number || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs capitalize">{call.direction || "—"}</Badge></TableCell>
                    <TableCell className="text-xs">{call.duration_seconds ? `${call.duration_seconds}s` : "—"}</TableCell>
                    <TableCell className="text-xs capitalize">{call.status || "—"}</TableCell>
                    <TableCell>
                      {call.transcript && (
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedCall(call)}>
                          View Transcript
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Call Transcript
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-foreground whitespace-pre-wrap">
            {selectedCall?.transcript || "No transcript available."}
          </div>
        </DialogContent>
      </Dialog>
    </ClientLayout>
  );
}
