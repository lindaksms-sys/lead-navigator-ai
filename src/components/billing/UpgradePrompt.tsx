import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  reason: string;
  compact?: boolean;
}

export function UpgradePrompt({ reason, compact }: UpgradePromptProps) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm">
        <AlertTriangle className="h-4 w-4 text-primary shrink-0" />
        <span className="text-muted-foreground">{reason}</span>
        <Button size="sm" variant="link" className="ml-auto p-0 h-auto" onClick={() => navigate("/client/billing")}>
          Upgrade <ArrowUpRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
        <AlertTriangle className="h-8 w-8 text-primary" />
        <p className="text-sm font-medium">{reason}</p>
        <Button onClick={() => navigate("/client/billing")}>
          View plans & upgrade <ArrowUpRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
