import { Progress } from "@/components/ui/progress";
import type { ScoreResult } from "@/lib/leadScoring";

interface ScorePreviewProps {
  result: ScoreResult;
}

const colorClass = (cat: string) => {
  switch (cat) {
    case "Hot": return "text-destructive";
    case "Warm": return "text-accent-warm";
    default: return "text-muted-foreground";
  }
};

export function ScorePreview({ result }: ScorePreviewProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Lead Score Preview</h4>
        <span className={`text-2xl font-bold ${colorClass(result.category)}`}>
          {result.score}
        </span>
      </div>
      <Progress value={result.score} className="h-3" />
      <div className={`text-center text-sm font-semibold ${colorClass(result.category)}`}>
        {result.category} Lead
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
        <span>Timeline: +{result.breakdown.timeline}</span>
        <span>Budget: +{result.breakdown.budget}</span>
        <span>Property: +{result.breakdown.property}</span>
        <span>Decision Maker: +{result.breakdown.decisionMaker}</span>
      </div>
    </div>
  );
}
