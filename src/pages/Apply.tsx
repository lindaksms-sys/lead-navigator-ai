import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ArrowRight, Phone, Calendar, Settings, UserPlus } from "lucide-react";

const steps = [
  { icon: UserPlus, label: "Create your account" },
  { icon: Settings, label: "Configure your business" },
  { icon: Phone, label: "Connect your phone and calendar" },
  { icon: Calendar, label: "Start answering calls" },
];

const Apply = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    industry: "",
    locations: "",
    callVolume: "",
    primaryGoal: "",
    wantHelp: false,
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.businessName.trim()) e.businessName = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim()) e.phone = "Required";
    else if (!/^\+?[\d\s\-()]{7,}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    if (!form.industry) e.industry = "Required";
    if (!form.primaryGoal) e.primaryGoal = "Required";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">You're in.</h1>
          <p className="text-muted-foreground">
            Check your email for next steps. We'll help you get your AI receptionist live in under 30 minutes.
          </p>
          <Link to="/">
            <Button variant="outline" className="mt-4">Back to homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-foreground">
            ReceptionistAI Pro
          </Link>
          <Link to="/client/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="grid md:grid-cols-5 gap-12 lg:gap-16">
          {/* Form — 3 cols */}
          <div className="md:col-span-3">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Start your free trial
            </h1>
            <p className="text-muted-foreground mb-8 max-w-lg">
              Set up your AI receptionist and start capturing more calls, leads, and booked jobs.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full name" error={errors.fullName}>
                  <Input
                    placeholder="Jane Smith"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                </Field>
                <Field label="Business name" error={errors.businessName}>
                  <Input
                    placeholder="Smith HVAC"
                    value={form.businessName}
                    onChange={(e) => set("businessName", e.target.value)}
                    className={errors.businessName ? "border-destructive" : ""}
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Email" error={errors.email}>
                  <Input
                    type="email"
                    placeholder="jane@smithhvac.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                  />
                </Field>
                <Field label="Phone number" error={errors.phone}>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={errors.phone ? "border-destructive" : ""}
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Industry" error={errors.industry}>
                  <Select value={form.industry} onValueChange={(v) => set("industry", v)}>
                    <SelectTrigger className={errors.industry ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hvac">HVAC</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="roofing">Roofing</SelectItem>
                      <SelectItem value="solar">Solar</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Number of locations">
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={form.locations}
                    onChange={(e) => set("locations", e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Monthly call volume">
                  <Select value={form.callVolume} onValueChange={(v) => set("callVolume", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estimated range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under_100">Under 100 calls</SelectItem>
                      <SelectItem value="100_500">100–500 calls</SelectItem>
                      <SelectItem value="500_2000">500–2,000 calls</SelectItem>
                      <SelectItem value="over_2000">2,000+ calls</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Primary goal" error={errors.primaryGoal}>
                  <Select value={form.primaryGoal} onValueChange={(v) => set("primaryGoal", v)}>
                    <SelectTrigger className={errors.primaryGoal ? "border-destructive" : ""}>
                      <SelectValue placeholder="What matters most?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="missed_calls">Answer missed calls</SelectItem>
                      <SelectItem value="book_appointments">Book more appointments</SelectItem>
                      <SelectItem value="qualify_leads">Qualify leads faster</SelectItem>
                      <SelectItem value="manage_clients">Manage multiple clients</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="wantHelp"
                  checked={form.wantHelp}
                  onCheckedChange={(v) => set("wantHelp", !!v)}
                />
                <label htmlFor="wantHelp" className="text-sm text-muted-foreground cursor-pointer">
                  I want help setting up my receptionist
                </label>
              </div>

              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
                {loading ? "Setting up…" : "Start Free Trial"}
                {!loading && <ArrowRight className="ml-1 w-4 h-4" />}
              </Button>

              <p className="text-sm text-muted-foreground">
                Want a walkthrough first?{" "}
                <a href="#" className="text-foreground underline underline-offset-4 hover:text-primary">
                  Book a Demo
                </a>
              </p>

              <p className="text-xs text-muted-foreground pt-2">
                14-day money-back guarantee · No contracts
              </p>
            </form>
          </div>

          {/* Side panel — 2 cols */}
          <div className="md:col-span-2">
            <div className="bg-muted rounded-xl p-6 md:p-8 md:sticky md:top-24">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                What happens next
              </h2>
              <div className="space-y-6">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center">
                      <step.icon className="w-4 h-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{step.label}</p>
                      {i === 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">Takes under 2 minutes</p>
                      )}
                      {i === 2 && (
                        <p className="text-xs text-muted-foreground mt-0.5">Works with any phone system</p>
                      )}
                      {i === 3 && (
                        <p className="text-xs text-muted-foreground mt-0.5">Most teams go live same day</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your trial includes full access to AI call answering, lead scoring, SMS alerts, and appointment booking. No credit card required to start.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">{label}</Label>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

export default Apply;
