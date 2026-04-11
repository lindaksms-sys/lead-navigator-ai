import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertTriangle, XCircle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { getFailureInfo } from "@/lib/failureMapping";

interface FailureCardProps {
  event: {
    id: string;
    event_type: string;
    status: string;
    title: string;
    message?: string | null;
    payload?: any;
    created_at: string;
    lead_id?: string | null;
    call_id?: string | null;
    client_id?: string | null;
  };
  compact?: boolean;
}

export function FailureCard({ event, compact = false }: FailureCardProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const info = getFailureInfo(event.event_type);
  const isCritical = info.severity === "critical";
  const Icon = isCritical ? XCircle : AlertTriangle;

  return (
    <Card className={`border-l-4 ${isCritical ? "border-l-destructive" : "border-l-amber-400"}`}>
      <CardContent className={compact ? "py-3 px-4" : "py-4 px-5"}>
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${isCritical ? "text-destructive" : "text-amber-500"}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{info.title}</span>
              <Badge variant="outline" className={`text-[10px] ${isCritical ? "border-destructive/30 text-destructive" : "border-amber-300 text-amber-700"}`}>
                {info.severity}
              </Badge>
              <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                {format(new Date(event.created_at), "MMM d, HH:mm")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{info.explanation}</p>

            {!compact && (
              <div className="mt-3 space-y-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">Likely cause: </span>
                  <span>{info.likelyCause}</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Recommended: </span>
                  <span className="font-medium">{info.recommendedAction}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {info.actionRoute && (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(info.actionRoute!)}>
                      {info.actionLabel || "Fix this"}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                  {event.lead_id && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => navigate(`/leads`)}>
                      View lead
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Technical details toggle */}
            {(event.message || event.payload) && (
              <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground px-0 mt-2">
                    {open ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                    {open ? "Hide details" : "View details"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {event.message && (
                    <p className="text-xs bg-muted/50 rounded p-2">{event.message}</p>
                  )}
                  {event.payload && (
                    <pre className="text-[11px] bg-muted/50 rounded p-2 overflow-auto max-h-32 whitespace-pre-wrap">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  )}
                  <div className="flex gap-2 text-[10px]">
                    {event.lead_id && <Badge variant="outline">Lead: {event.lead_id.slice(0, 8)}…</Badge>}
                    {event.call_id && <Badge variant="outline">Call: {event.call_id.slice(0, 8)}…</Badge>}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
