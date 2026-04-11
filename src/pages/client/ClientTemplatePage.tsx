import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Settings,
  Sparkles,
  Check,
  Flame,
  Thermometer,
  Wind,
  Wrench,
  Clock,
  BookOpen,
  AlertTriangle,
  Database,
  ArrowRight,
} from "lucide-react";
import { industryDefaults, type IndustryTemplate } from "@/lib/industryDefaults";

const INDUSTRY_LABELS: Record<string, { label: string; icon: typeof Flame }> = {
  hvac: { label: "HVAC", icon: Thermometer },
  plumbing: { label: "Plumbing", icon: Wrench },
  roofing: { label: "Roofing", icon: Wind },
  solar: { label: "Solar", icon: Flame },
  agency: { label: "Agency", icon: Settings },
};

const ClientTemplatePage = () => {
  const navigate = useNavigate();
  const [currentTemplate] = useState("hvac");
  const [seedingDemo, setSeedingDemo] = useState(false);
  const template = industryDefaults[currentTemplate];
  const meta = INDUSTRY_LABELS[currentTemplate];

  const seedDemoData = async () => {
    setSeedingDemo(true);
    try {
      const sampleLeads = [
        { name: "Mike Johnson", phone: "(555) 234-5678", service_type: "emergency" as const, timeline: "emergency" as const, budget: "500_2000" as const, decision_maker: true, score: 85, category: "Hot" as const, source: "demo", notes: "No cooling — unit not turning on" },
        { name: "Sarah Williams", phone: "(555) 345-6789", service_type: "maintenance" as const, timeline: "this_week" as const, budget: "under_500" as const, decision_maker: true, score: 45, category: "Warm" as const, source: "demo", notes: "Annual AC tune-up" },
        { name: "Tom Davis", phone: "(555) 456-7890", service_type: "installation" as const, timeline: "this_month" as const, budget: "over_10000" as const, decision_maker: true, score: 75, category: "Hot" as const, source: "demo", notes: "New furnace and AC system quote" },
        { name: "Lisa Chen", phone: "(555) 567-8901", service_type: "repair" as const, timeline: "today" as const, budget: "500_2000" as const, decision_maker: false, score: 40, category: "Warm" as const, source: "demo", notes: "Thermostat not responding" },
        { name: "Robert Garcia", phone: "(555) 678-9012", service_type: "repair" as const, timeline: "this_week" as const, budget: "unknown" as const, decision_maker: true, score: 30, category: "Cold" as const, source: "demo", notes: "Ductwork making noise" },
      ];

      const { error: leadsErr } = await supabase.from("leads").insert(sampleLeads);
      if (leadsErr) throw leadsErr;

      const now = new Date();
      const sampleAppointments = [
        { datetime: new Date(now.getTime() + 86400000).toISOString(), service_type: "Emergency — No Cooling", status: "scheduled" as const, notes: "Customer: Mike Johnson" },
        { datetime: new Date(now.getTime() + 172800000).toISOString(), service_type: "AC Tune-Up", status: "scheduled" as const, notes: "Customer: Sarah Williams" },
        { datetime: new Date(now.getTime() + 259200000).toISOString(), service_type: "System Replacement Estimate", status: "scheduled" as const, notes: "Customer: Tom Davis" },
      ];

      const { error: apptErr } = await supabase.from("appointments").insert(sampleAppointments);
      if (apptErr) throw apptErr;

      toast.success("Demo data loaded — 5 leads and 3 appointments added");
    } catch {
      toast.error("Failed to seed demo data");
    } finally {
      setSeedingDemo(false);
    }
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Industry template</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your receptionist is configured with industry-specific defaults. Customize anytime.
          </p>
        </div>

        {/* Current template card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {meta && <meta.icon className="w-5 h-5 text-primary" />}
                </div>
                <div>
                  <CardTitle className="text-lg">{meta?.label ?? currentTemplate} setup template</CardTitle>
                  <CardDescription>Preloaded services, questions, and defaults</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" /> Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Services */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Services ({template.services.length})</p>
              <div className="flex flex-wrap gap-2">
                {template.services.map((s, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-normal">{s}</Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Qualification questions */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Qualification questions ({template.qualificationQuestions.length})</p>
              <div className="space-y-1.5">
                {template.qualificationQuestions.map((q, i) => (
                  <p key={i} className="text-xs text-muted-foreground">{i + 1}. {q}</p>
                ))}
              </div>
            </div>

            <Separator />

            {/* Emergency scenarios */}
            {template.emergencyScenarios.length > 0 && (
              <>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" /> Emergency scenarios
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.emergencyScenarios.map((s, i) => (
                      <Badge key={i} variant="destructive" className="text-xs font-normal">{s}</Badge>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Scheduling defaults */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Scheduling defaults
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {template.schedulingDefaults.appointmentTypes.map((t, i) => (
                  <div key={i} className="text-xs text-muted-foreground bg-muted rounded-md px-3 py-2 text-center">{t}</div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Default: {template.schedulingDefaults.defaultDuration} min appointments, {template.schedulingDefaults.bufferTime} min buffer
              </p>
            </div>

            <Separator />

            {/* Behavior defaults */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Receptionist behavior
              </p>
              <div className="space-y-3">
                {([
                  ["prioritizeUrgent", "Prioritize urgent breakdowns"],
                  ["encourageSameDay", "Encourage same-day booking"],
                  ["escalateAfterHoursEmergency", "Escalate after-hours emergencies"],
                  ["captureEquipmentDetails", "Capture equipment details before booking"],
                  ["routeMaintenanceSeparately", "Route maintenance requests separately"],
                ] as const).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-sm text-foreground">{label}</Label>
                    <div className="flex items-center gap-2">
                      {template.behaviorDefaults[key] ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <span className="text-xs text-muted-foreground">Off</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Scoring notes */}
            {template.scoringNotes && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Lead scoring logic
                </p>
                <p className="text-xs text-muted-foreground">{template.scoringNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Settings className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Customize settings</p>
                <p className="text-xs text-muted-foreground mt-0.5">Edit services, questions, and scheduling defaults.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/client/settings")}>
                  Open settings <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Database className="w-4 h-4 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Load demo data</p>
                <p className="text-xs text-muted-foreground mt-0.5">Add sample HVAC leads and appointments for testing.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={seedDemoData} disabled={seedingDemo}>
                  {seedingDemo ? "Loading…" : "Seed demo data"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientTemplatePage;
