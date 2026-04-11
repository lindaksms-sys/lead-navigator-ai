import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { getFailureInfo } from "@/lib/failureMapping";
import { format } from "date-fns";

interface Props {
  clientId?: string | null;
  variant: "admin" | "client";
}

export function NeedsAttentionWidget({ clientId, variant }: Props) {
  const navigate = useNavigate();

  const { data: issues } = useQuery({
    queryKey: ["needs-attention", variant, clientId],
    queryFn: async () => {
      let q = supabase
        .from("event_logs")
        .select("*")
        .eq("status", "failed")
        .order("created_at", { ascending: false })
        .limit(5);
      if (variant === "client" && clientId) q = q.eq("client_id", clientId);
      const { data } = await q;
      return data || [];
    },
  });

  const { data: summary } = useQuery({
    queryKey: ["failure-summary", variant, clientId],
    queryFn: async () => {
      let q = supabase
        .from("event_logs")
        .select("event_type, status", { count: "exact", head: false })
        .eq("status", "failed")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      if (variant === "client" && clientId) q = q.eq("client_id", clientId);
      const { data } = await q;

      const counts = { critical: 0, warning: 0, sms: 0, booking: 0, integration: 0 };
      (data || []).forEach((d: any) => {
        const info = getFailureInfo(d.event_type);
        if (info.severity === "critical") counts.critical++;
        else counts.warning++;
        if (d.event_type === "sms_failed") counts.sms++;
        if (d.event_type === "booking_failed") counts.booking++;
        if (d.event_type === "integration_failed") counts.integration++;
      });
      return counts;
    },
  });

  if (!issues?.length) return null;

  const logsRoute = variant === "admin" ? "/admin/logs" : "/client/activity";
  const criticalCount = summary?.critical || 0;
  const warningCount = summary?.warning || 0;

  return (
    <Card className="border-destructive/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          {variant === "admin" ? "Needs Attention" : "Action Needed"}
          <div className="flex gap-1.5 ml-auto">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-[10px]">{criticalCount} critical</Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">{warningCount} warnings</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {/* Summary pills */}
        {(summary?.sms || summary?.booking || summary?.integration) ? (
          <div className="flex flex-wrap gap-2 mb-3">
            {summary!.sms > 0 && <Badge variant="outline" className="text-[10px]">{summary!.sms} SMS failures</Badge>}
            {summary!.booking > 0 && <Badge variant="outline" className="text-[10px]">{summary!.booking} booking failures</Badge>}
            {summary!.integration > 0 && <Badge variant="outline" className="text-[10px]">{summary!.integration} integration issues</Badge>}
          </div>
        ) : null}

        {/* Recent failures - compact list */}
        {issues.slice(0, 3).map((issue: any) => {
          const info = getFailureInfo(issue.event_type);
          const Icon = info.severity === "critical" ? XCircle : AlertTriangle;
          return (
            <div key={issue.id} className="flex items-start gap-2 text-sm">
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${info.severity === "critical" ? "text-destructive" : "text-amber-500"}`} />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-xs">{info.title}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {format(new Date(issue.created_at), "MMM d, HH:mm")}
                </span>
              </div>
              {info.actionRoute && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px] px-2 shrink-0"
                  onClick={() => navigate(info.actionRoute!)}
                >
                  Fix
                </Button>
              )}
            </div>
          );
        })}

        <Button variant="ghost" size="sm" className="w-full text-xs mt-1" onClick={() => navigate(logsRoute)}>
          View all issues <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
