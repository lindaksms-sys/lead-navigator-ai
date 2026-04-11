import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { BillingPlan } from "@/lib/billingPlans";

interface PlanCardProps {
  plan: BillingPlan;
  isCurrent: boolean;
  onSelect: (planId: string) => void;
  isUpgrade?: boolean;
}

export function PlanCard({ plan, isCurrent, onSelect, isUpgrade }: PlanCardProps) {
  return (
    <Card className={`relative ${plan.highlight ? "border-primary shadow-md" : ""} ${isCurrent ? "ring-2 ring-primary" : ""}`}>
      {plan.highlight && (
        <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs">Recommended</Badge>
      )}
      {isCurrent && (
        <Badge variant="secondary" className="absolute -top-2.5 right-4 text-xs">Current</Badge>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{plan.name}</CardTitle>
        <p className="text-2xl font-bold text-foreground">{plan.priceLabel}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        {isCurrent ? (
          <Button variant="outline" className="w-full" disabled>Current plan</Button>
        ) : plan.isSelfServe ? (
          <Button className="w-full" onClick={() => onSelect(plan.id)}>
            {isUpgrade ? "Upgrade" : "Select plan"}
          </Button>
        ) : (
          <Button variant="outline" className="w-full" onClick={() => window.open("mailto:sales@receptionistai.pro", "_blank")}>
            Contact sales
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
