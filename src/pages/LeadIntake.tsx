import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { calculateScore } from "@/lib/leadScoring";
import { ScorePreview } from "@/components/leads/ScorePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z.string().min(7, "Valid phone required").max(20),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  service_type: z.enum(["repair", "maintenance", "installation", "emergency"]),
  property_type: z.enum(["single_family", "condo", "townhouse", "commercial"]).optional(),
  square_footage: z.coerce.number().min(0).optional(),
  timeline: z.enum(["emergency", "today", "this_week", "this_month", "planning"]).optional(),
  budget: z.enum(["under_500", "500_2000", "2000_5000", "5000_10000", "over_10000", "unknown"]).optional(),
  decision_maker: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export default function LeadIntake() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { decision_maker: false },
    mode: "onChange",
  });

  const values = form.watch();
  const scoreResult = calculateScore({
    timeline: values.timeline,
    budget: values.budget,
    propertyType: values.property_type,
    squareFootage: values.square_footage,
    decisionMaker: values.decision_maker,
  });

  const onSubmit = async (data: FormData) => {
    const { score, category } = calculateScore({
      timeline: data.timeline,
      budget: data.budget,
      propertyType: data.property_type,
      squareFootage: data.square_footage,
      decisionMaker: data.decision_maker,
    });

    const { error } = await supabase.from("leads").insert({
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      service_type: data.service_type,
      property_type: data.property_type ?? null,
      square_footage: data.square_footage ?? null,
      timeline: data.timeline ?? null,
      budget: data.budget ?? null,
      decision_maker: data.decision_maker,
      score,
      category,
      source: "manual",
    });

    if (error) {
      toast.error("Failed to save lead");
      return;
    }
    toast.success(`Lead saved as ${category} (score: ${score})`);
    navigate("/leads");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/leads")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground mt-2">New Lead</h1>
          <p className="text-muted-foreground text-sm">Step {step} of 3</p>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {step === 1 && (
                <>
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" {...form.register("name")} placeholder="John Smith" />
                    {form.formState.errors.name && <p className="text-xs text-destructive mt-1">{form.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" {...form.register("phone")} placeholder="(555) 123-4567" />
                    {form.formState.errors.phone && <p className="text-xs text-destructive mt-1">{form.formState.errors.phone.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" {...form.register("email")} placeholder="john@example.com" />
                  </div>
                  <div>
                    <Label>Service Type *</Label>
                    <Select onValueChange={(v) => form.setValue("service_type", v as FormData["service_type"])} value={values.service_type}>
                      <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="installation">Installation</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <Label>Property Type</Label>
                    <Select onValueChange={(v) => form.setValue("property_type", v as FormData["property_type"])} value={values.property_type}>
                      <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_family">Single Family</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sqft">Square Footage</Label>
                    <Input id="sqft" type="number" {...form.register("square_footage")} placeholder="1500" />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div>
                    <Label>Timeline</Label>
                    <Select onValueChange={(v) => form.setValue("timeline", v as FormData["timeline"])} value={values.timeline}>
                      <SelectTrigger><SelectValue placeholder="Select timeline" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="this_week">This Week</SelectItem>
                        <SelectItem value="this_month">This Month</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Budget</Label>
                    <Select onValueChange={(v) => form.setValue("budget", v as FormData["budget"])} value={values.budget}>
                      <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="under_500">Under $500</SelectItem>
                        <SelectItem value="500_2000">$500 - $2,000</SelectItem>
                        <SelectItem value="2000_5000">$2,000 - $5,000</SelectItem>
                        <SelectItem value="5000_10000">$5,000 - $10,000</SelectItem>
                        <SelectItem value="over_10000">Over $10,000</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Decision Maker?</Label>
                    <Switch checked={values.decision_maker} onCheckedChange={(v) => form.setValue("decision_maker", v)} />
                  </div>
                </>
              )}

              <div className="flex justify-between pt-4">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                ) : <div />}
                {step < 3 ? (
                  <Button type="button" onClick={() => setStep(step + 1)}>
                    Next <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="submit">
                    <Check className="h-4 w-4 mr-1" /> Save Lead
                  </Button>
                )}
              </div>
            </form>
          </Card>

          <div className="space-y-4">
            <ScorePreview result={scoreResult} />
          </div>
        </div>
      </div>
    </div>
  );
}
