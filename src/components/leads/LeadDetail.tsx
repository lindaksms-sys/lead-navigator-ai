import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { calculateScore } from "@/lib/leadScoring";
import type { Database } from "@/integrations/supabase/types";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

interface LeadDetailProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

const categoryColor = (cat: string) => {
  switch (cat) {
    case "Hot": return "bg-destructive text-destructive-foreground";
    case "Warm": return "bg-accent-warm text-accent-warm-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

export function LeadDetail({ lead, open, onClose }: LeadDetailProps) {
  if (!lead) return null;

  const { breakdown } = calculateScore({
    timeline: lead.timeline,
    budget: lead.budget,
    propertyType: lead.property_type,
    squareFootage: lead.square_footage,
    decisionMaker: lead.decision_maker,
  });

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {lead.name}
            <Badge className={categoryColor(lead.category)}>{lead.category} · {lead.score}</Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Score Breakdown</h4>
            <Progress value={lead.score} className="mb-3" />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between"><span>Timeline</span><span className="font-medium">{breakdown.timeline}</span></div>
              <div className="flex justify-between"><span>Budget</span><span className="font-medium">{breakdown.budget}</span></div>
              <div className="flex justify-between"><span>Property</span><span className="font-medium">{breakdown.property}</span></div>
              <div className="flex justify-between"><span>Decision Maker</span><span className="font-medium">{breakdown.decisionMaker}</span></div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3 text-sm">
            <InfoRow label="Phone" value={lead.phone} />
            <InfoRow label="Email" value={lead.email} />
            <InfoRow label="Address" value={lead.address} />
            <InfoRow label="Service" value={lead.service_type?.replace("_", " ")} />
            <InfoRow label="Property" value={lead.property_type?.replace("_", " ")} />
            <InfoRow label="Sq Ft" value={lead.square_footage?.toString()} />
            <InfoRow label="Timeline" value={lead.timeline?.replace("_", " ")} />
            <InfoRow label="Budget" value={lead.budget?.replace("_", " ")} />
            <InfoRow label="Decision Maker" value={lead.decision_maker ? "Yes" : "No"} />
            <InfoRow label="Status" value={lead.status} />
            <InfoRow label="Source" value={lead.source} />
          </div>

          {lead.notes && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                <p className="text-sm">{lead.notes}</p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}
