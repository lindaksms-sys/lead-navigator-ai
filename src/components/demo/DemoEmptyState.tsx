import { useDemoMode } from "@/contexts/DemoModeContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, PhoneCall, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DemoEmptyStateProps {
  title?: string;
  description?: string;
}

export function DemoEmptyState({
  title = "No activity yet",
  description = "Once your AI receptionist starts handling calls, data will appear here.",
}: DemoEmptyStateProps) {
  const { isDemoMode, enableDemoMode, seeding } = useDemoMode();
  const navigate = useNavigate();

  if (isDemoMode) return null;

  return (
    <Card>
      <CardContent className="py-10 text-center space-y-4">
        <FlaskConical className="w-10 h-10 text-muted-foreground/40 mx-auto" />
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" onClick={enableDemoMode} disabled={seeding} className="gap-1.5">
            <FlaskConical className="w-3.5 h-3.5" />
            {seeding ? "Loading…" : "Explore with sample data"}
          </Button>
          <Button variant="ghost" onClick={() => navigate("/onboarding")} className="gap-1.5">
            <ArrowRight className="w-3.5 h-3.5" /> Complete setup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
