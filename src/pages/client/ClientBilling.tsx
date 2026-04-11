import { ClientLayout } from "@/components/client/ClientLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, Calendar, Clock, MapPin, AlertTriangle, ExternalLink, Check } from "lucide-react";
import { useBilling } from "@/hooks/useBilling";
import { PlanCard } from "@/components/billing/PlanCard";
import { BILLING_PLANS, getPlan } from "@/lib/billingPlans";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    active: { variant: "default", label: "Active" },
    trialing: { variant: "secondary", label: "Trial" },
    past_due: { variant: "destructive", label: "Past due" },
    canceled: { variant: "outline", label: "Canceled" },
    paused: { variant: "outline", label: "Paused" },
  };
  const s = map[status] || { variant: "outline" as const, label: status };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export default function ClientBilling() {
  const { billing, plan, isLoading, isTrialing, minutesUsed, minutesLimit, minutesPercent, locationsLimit } = useBilling();
  const [showPlans, setShowPlans] = useState(false);

  const handleSelectPlan = (planId: string) => {
    // PayPal checkout placeholder
    toast.info(`PayPal checkout for ${getPlan(planId).name} plan would start here. Integration coming soon.`);
    setShowPlans(false);
  };

  if (isLoading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading billing…</p>
        </div>
      </ClientLayout>
    );
  }

  const currentPlanId = billing?.plan_id || "starter";
  const subscriptionStatus = billing?.subscription_status || "trialing";

  return (
    <ClientLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Billing</h1>
            <p className="text-sm text-muted-foreground">Manage your subscription and usage</p>
          </div>
          <StatusBadge status={subscriptionStatus} />
        </div>

        {/* Trial banner */}
        {isTrialing && billing?.trial_end && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Trial ends {format(new Date(billing.trial_end), "MMMM d, yyyy")}</p>
                <p className="text-xs text-muted-foreground">Upgrade before your trial expires to keep your AI receptionist running.</p>
              </div>
              <Button size="sm" onClick={() => setShowPlans(true)}>Upgrade now</Button>
            </CardContent>
          </Card>
        )}

        {/* Current plan card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Current plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">{plan.name}</span>
                <span className="text-lg font-semibold text-muted-foreground">{plan.priceLabel}</span>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={subscriptionStatus} />
                </div>
                {billing?.current_period_end && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next billing date</span>
                    <span>{format(new Date(billing.current_period_end), "MMM d, yyyy")}</span>
                  </div>
                )}
                {billing?.cancel_at_period_end && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cancels at period end</span>
                    <Badge variant="destructive">Yes</Badge>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment provider</span>
                  <span className="capitalize">{billing?.payment_provider || "PayPal"}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowPlans(true)}>
                  Change plan
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.info("Cancel flow coming soon")}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" /> Usage this period
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">AI call minutes</span>
                  <span className="font-medium">{minutesUsed.toLocaleString()} / {minutesLimit.toLocaleString()}</span>
                </div>
                <Progress value={minutesPercent} className="h-2" />
                {minutesPercent >= 80 && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {minutesPercent >= 100 ? "Limit reached" : "Approaching limit"}
                  </p>
                )}
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Locations
                </span>
                <span className="font-medium">1 / {locationsLimit}</span>
              </div>
              {currentPlanId === "starter" && (
                <div className="rounded-lg border border-dashed border-muted-foreground/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-2">Need more minutes or locations?</p>
                  <Button size="sm" variant="outline" onClick={() => setShowPlans(true)}>
                    View upgrade options
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Billing support */}
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Need help with billing?</p>
                <p className="text-xs text-muted-foreground">Contact our team for questions about invoices, payments, or plan changes.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.open("mailto:billing@receptionistai.pro", "_blank")}>
                Contact support <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Plan comparison dialog */}
        <Dialog open={showPlans} onOpenChange={setShowPlans}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Choose your plan</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              {Object.values(BILLING_PLANS).map((p) => (
                <PlanCard
                  key={p.id}
                  plan={p}
                  isCurrent={p.id === currentPlanId}
                  onSelect={handleSelectPlan}
                  isUpgrade={
                    (currentPlanId === "starter" && p.id === "growth") ||
                    (currentPlanId === "starter" && p.id === "agency")
                  }
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ClientLayout>
  );
}
