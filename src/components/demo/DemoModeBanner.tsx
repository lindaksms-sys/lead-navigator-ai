import { useDemoMode } from "@/contexts/DemoModeContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FlaskConical, X, PhoneCall, Calendar, Bell, Settings, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DemoModeBanner() {
  const { isDemoMode, disableDemoMode } = useDemoMode();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  return (
    <div className="bg-primary/5 border-b border-primary/20">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <Badge variant="outline" className="gap-1 border-primary/30 text-primary text-[10px] shrink-0">
            <FlaskConical className="w-3 h-3" /> Demo
          </Badge>
          <p className="text-xs text-muted-foreground truncate">
            You're viewing sample HVAC data. Connect your setup or run a test call to start using live data.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/onboarding")}>
            <Settings className="w-3 h-3" /> Setup
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/client/settings")}>
            <Calendar className="w-3 h-3" /> Calendar
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => navigate("/settings/notifications")}>
            <Bell className="w-3 h-3" /> Alerts
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={disableDemoMode}>
            <X className="w-3 h-3 mr-1" /> Exit demo
          </Button>
        </div>
      </div>
    </div>
  );
}
