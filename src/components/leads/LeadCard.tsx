import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Phone, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SchedulePopover } from "@/components/leads/SchedulePopover";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

const scoreBadgeClass = (category: string) => {
  switch (category) {
    case "Hot": return "bg-destructive text-destructive-foreground";
    case "Warm": return "bg-accent-warm text-accent-warm-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

export function LeadCard({ lead, onClick }: LeadCardProps) {
  return (
    <Card
      className="p-3 cursor-pointer hover:shadow-md transition-shadow border-border"
      onClick={() => onClick(lead)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("leadId", lead.id);
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-foreground text-sm truncate">{lead.name}</h4>
        <div className="flex items-center gap-1">
          <SchedulePopover lead={lead} />
          <Badge className={scoreBadgeClass(lead.category)}>{lead.score}</Badge>
        </div>
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Phone className="h-3 w-3" />
          <span>{lead.phone}</span>
        </div>
        {lead.service_type && (
          <div className="capitalize">{lead.service_type.replace("_", " ")}</div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</span>
        </div>
      </div>
    </Card>
  );
}
