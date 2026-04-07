import { Card } from "@/components/ui/card";
import { Zap, PhoneCall, Mail } from "lucide-react";

const rules = [
  { category: "Hot", icon: Zap, action: "Auto-send SMS + Priority queue", color: "text-destructive" },
  { category: "Warm", icon: PhoneCall, action: "Schedule follow-up call", color: "text-accent-warm" },
  { category: "Cold", icon: Mail, action: "Add to nurture email drip", color: "text-muted-foreground" },
];

export function AutomationRules() {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">Automation Rules</h3>
      <div className="space-y-2">
        {rules.map((r) => (
          <div key={r.category} className="flex items-center gap-2 text-sm">
            <r.icon className={`h-4 w-4 ${r.color}`} />
            <span className={`font-medium ${r.color}`}>{r.category}</span>
            <span className="text-muted-foreground">→ {r.action}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
