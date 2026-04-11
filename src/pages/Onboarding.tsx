import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Phone,
  Calendar,
  Settings,
  Clock,
  Bell,
  BookOpen,
  Sparkles,
  PhoneCall,
  LayoutDashboard,
  Plug,
  Users,
  X,
  Plus,
} from "lucide-react";
import { industryDefaults } from "@/lib/industryDefaults";

// ─── Types ──────────────────────────────────────────────────
interface OnboardingData {
  // Business
  businessName: string;
  industry: string;
  locations: string;
  mainPhone: string;
  website: string;
  serviceArea: string;
  businessDescription: string;
  // Hours
  businessHours: Record<string, { open: string; close: string; enabled: boolean }>;
  afterHoursAction: string;
  emergencyCallsEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
  // Services
  services: string[];
  emergencyServices: boolean;
  qualificationQuestions: string[];
  scoringPreference: string;
  // Scheduling
  bookingEnabled: boolean;
  calendarConnected: boolean;
  appointmentTypes: string[];
  appointmentDuration: string;
  bufferTime: string;
  bookingNotes: string;
  // Notifications
  smsRecipients: string[];
  emailRecipients: string[];
  escalateToHuman: boolean;
  escalationContact: string;
  // Knowledge
  faqs: string;
  serviceNotes: string;
  pricingGuidance: string;
  areasServed: string;
  policies: string;
}

const defaultHours = (): OnboardingData["businessHours"] => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const h: OnboardingData["businessHours"] = {};
  days.forEach((d) => {
    h[d] = { open: "08:00", close: "17:00", enabled: d !== "Saturday" && d !== "Sunday" };
  });
  return h;
};

const initialData: OnboardingData = {
  businessName: "",
  industry: "",
  locations: "1",
  mainPhone: "",
  website: "",
  serviceArea: "",
  businessDescription: "",
  businessHours: defaultHours(),
  afterHoursAction: "voicemail",
  emergencyCallsEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  timezone: "America/New_York",
  services: [],
  emergencyServices: false,
  qualificationQuestions: [],
  scoringPreference: "default",
  bookingEnabled: true,
  calendarConnected: false,
  appointmentTypes: ["Service Call"],
  appointmentDuration: "60",
  bufferTime: "15",
  bookingNotes: "",
  smsRecipients: [""],
  emailRecipients: [""],
  escalateToHuman: true,
  escalationContact: "",
  faqs: "",
  serviceNotes: "",
  pricingGuidance: "",
  areasServed: "",
  policies: "",
};

const STEPS = [
  { label: "Welcome", icon: Sparkles },
  { label: "Business", icon: Settings },
  { label: "Hours", icon: Clock },
  { label: "Services", icon: BookOpen },
  { label: "Scheduling", icon: Calendar },
  { label: "Notifications", icon: Bell },
  { label: "Knowledge", icon: BookOpen },
  { label: "Review", icon: Check },
];

// ─── Field helper ───────────────────────────────────────────
const Field = ({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">{label}</Label>
    {children}
    {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

// ─── Main component ────────────────────────────────────────
const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  const set = useCallback(<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  }, []);

  const progress = Math.round((step / (STEPS.length - 1)) * 100);

  // Apply industry defaults when industry changes
  const handleIndustryChange = (industry: string) => {
    set("industry", industry);
    const defaults = industryDefaults[industry];
    if (defaults) {
      if (defaults.services.length) set("services", defaults.services);
      if (defaults.qualificationQuestions.length) set("qualificationQuestions", defaults.qualificationQuestions);
      if (defaults.description) set("businessDescription", defaults.description);
    }
  };

  const validateStep = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!data.businessName.trim()) e.businessName = "Required";
      if (!data.industry) e.industry = "Required";
      if (!data.mainPhone.trim()) e.mainPhone = "Required";
      else if (!/^\+?[\d\s\-()]{7,}$/.test(data.mainPhone)) e.mainPhone = "Enter a valid phone number";
    }
    return e;
  };

  const next = () => {
    const v = validateStep(step);
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const finish = () => {
    setCompleted(true);
  };

  // ─── Success ──────────────────────────────────────────────
  if (completed) {
    const actions = [
      { icon: PhoneCall, label: "Make a test call", desc: "Call your number and try the AI receptionist" },
      { icon: LayoutDashboard, label: "View your leads dashboard", desc: "See incoming leads in real time" },
      { icon: Plug, label: "Connect more integrations", desc: "Add calendar, CRM, and other tools" },
      { icon: Users, label: "Invite a team member", desc: "Give your team access to the portal" },
    ];
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg text-center space-y-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your AI receptionist is ready</h1>
            <p className="text-muted-foreground mt-2">Everything is configured. Here's what to do next.</p>
          </div>
          <div className="grid gap-3 text-left">
            {actions.map((a) => (
              <div key={a.label} className="flex items-start gap-4 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <a.icon className="w-4 h-4 text-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={() => navigate("/client/dashboard")} className="w-full sm:w-auto">
            Go to dashboard <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── Wizard ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-foreground">ReceptionistAI Pro</Link>
          <span className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
        </div>
      </nav>

      {/* Progress */}
      <div className="px-6 pt-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <Progress value={progress} className="h-1.5" />
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => i < step && setStep(i)}
                className={`text-[10px] font-medium transition-colors hidden sm:block ${
                  i === step ? "text-foreground" : i < step ? "text-primary cursor-pointer" : "text-muted-foreground/50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {step === 0 && <StepWelcome onStart={next} />}
          {step === 1 && <StepBusiness data={data} errors={errors} set={set} onIndustryChange={handleIndustryChange} />}
          {step === 2 && <StepHours data={data} set={set} />}
          {step === 3 && <StepServices data={data} set={set} />}
          {step === 4 && <StepScheduling data={data} set={set} />}
          {step === 5 && <StepNotifications data={data} set={set} />}
          {step === 6 && <StepKnowledge data={data} set={set} />}
          {step === 7 && <StepReview data={data} onFinish={finish} onEdit={setStep} />}
        </div>
      </div>

      {/* Footer nav */}
      {step > 0 && step < STEPS.length - 1 && (
        <div className="border-t border-border px-6 py-4 flex-shrink-0">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
            <Button onClick={next}>Continue <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Step 0: Welcome ────────────────────────────────────────
const StepWelcome = ({ onStart }: { onStart: () => void }) => {
  const checklist = [
    "Set up your business profile",
    "Configure hours and availability",
    "Choose your services and lead qualification",
    "Connect scheduling and notifications",
    "Add knowledge base content",
    "Review and test your receptionist",
  ];
  return (
    <div className="max-w-xl mx-auto text-center space-y-8 py-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Welcome to ReceptionistAI Pro</h1>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">
          Let's get your AI receptionist ready to answer calls, qualify leads, and book appointments.
        </p>
      </div>
      <div className="text-left bg-muted rounded-xl p-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">What we'll set up</p>
        {checklist.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-medium text-muted-foreground">{i + 1}</span>
            </div>
            <span className="text-sm text-foreground">{item}</span>
          </div>
        ))}
      </div>
      <Button size="lg" onClick={onStart}>
        Start setup <ArrowRight className="ml-1 w-4 h-4" />
      </Button>
      <p className="text-xs text-muted-foreground">Takes about 10 minutes. You can save and finish later.</p>
    </div>
  );
};

// ─── Step 1: Business ───────────────────────────────────────
const StepBusiness = ({
  data, errors, set, onIndustryChange,
}: {
  data: OnboardingData;
  errors: Record<string, string>;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  onIndustryChange: (v: string) => void;
}) => (
  <div className="max-w-2xl mx-auto space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-foreground">Business setup</h2>
      <p className="text-sm text-muted-foreground mt-1">Tell us about your business so we can configure your receptionist.</p>
    </div>
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="Business name" error={errors.businessName}>
        <Input value={data.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="Smith HVAC" className={errors.businessName ? "border-destructive" : ""} />
      </Field>
      <Field label="Industry" error={errors.industry}>
        <Select value={data.industry} onValueChange={onIndustryChange}>
          <SelectTrigger className={errors.industry ? "border-destructive" : ""}><SelectValue placeholder="Select industry" /></SelectTrigger>
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
    </div>
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="Number of locations">
        <Input type="number" min="1" value={data.locations} onChange={(e) => set("locations", e.target.value)} placeholder="1" />
      </Field>
      <Field label="Main business phone" error={errors.mainPhone}>
        <Input value={data.mainPhone} onChange={(e) => set("mainPhone", e.target.value)} placeholder="(555) 123-4567" className={errors.mainPhone ? "border-destructive" : ""} />
      </Field>
    </div>
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="Website" hint="Optional">
        <Input value={data.website} onChange={(e) => set("website", e.target.value)} placeholder="https://smithhvac.com" />
      </Field>
      <Field label="Service area" hint="City, county, or zip codes">
        <Input value={data.serviceArea} onChange={(e) => set("serviceArea", e.target.value)} placeholder="Dallas–Fort Worth metro" />
      </Field>
    </div>
    <Field label="What does your business do?" hint="A short description helps the AI answer questions about your company.">
      <Textarea value={data.businessDescription} onChange={(e) => set("businessDescription", e.target.value)} placeholder="We provide residential and commercial HVAC repair, installation, and maintenance." rows={3} />
    </Field>
  </div>
);

// ─── Step 2: Hours ──────────────────────────────────────────
const StepHours = ({ data, set }: { data: OnboardingData; set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void }) => {
  const toggleDay = (day: string) => {
    const h = { ...data.businessHours };
    h[day] = { ...h[day], enabled: !h[day].enabled };
    set("businessHours", h);
  };
  const setTime = (day: string, field: "open" | "close", value: string) => {
    const h = { ...data.businessHours };
    h[day] = { ...h[day], [field]: value };
    set("businessHours", h);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Hours and availability</h2>
        <p className="text-sm text-muted-foreground mt-1">Set when your business is open. Your AI receptionist answers 24/7 regardless.</p>
      </div>

      <div className="space-y-2">
        {Object.entries(data.businessHours).map(([day, h]) => (
          <div key={day} className="flex items-center gap-3 py-2">
            <Checkbox checked={h.enabled} onCheckedChange={() => toggleDay(day)} />
            <span className="text-sm font-medium w-24 text-foreground">{day}</span>
            {h.enabled ? (
              <div className="flex items-center gap-2">
                <Input type="time" value={h.open} onChange={(e) => setTime(day, "open", e.target.value)} className="w-28 text-sm" />
                <span className="text-muted-foreground text-xs">to</span>
                <Input type="time" value={h.close} onChange={(e) => setTime(day, "close", e.target.value)} className="w-28 text-sm" />
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Closed</span>
            )}
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
        <Field label="After-hours behavior">
          <Select value={data.afterHoursAction} onValueChange={(v) => set("afterHoursAction", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="voicemail">Take a message</SelectItem>
              <SelectItem value="qualify">Qualify and alert</SelectItem>
              <SelectItem value="book">Qualify and book appointment</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Time zone">
          <Select value={data.timezone} onValueChange={(v) => set("timezone", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="America/New_York">Eastern</SelectItem>
              <SelectItem value="America/Chicago">Central</SelectItem>
              <SelectItem value="America/Denver">Mountain</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-border">
        <div>
          <p className="text-sm font-medium text-foreground">Emergency calls</p>
          <p className="text-xs text-muted-foreground">Always escalate emergency calls to a live person</p>
        </div>
        <Switch checked={data.emergencyCallsEnabled} onCheckedChange={(v) => set("emergencyCallsEnabled", v)} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Quiet hours start" hint="No non-emergency alerts after this time">
          <Input type="time" value={data.quietHoursStart} onChange={(e) => set("quietHoursStart", e.target.value)} />
        </Field>
        <Field label="Quiet hours end">
          <Input type="time" value={data.quietHoursEnd} onChange={(e) => set("quietHoursEnd", e.target.value)} />
        </Field>
      </div>
    </div>
  );
};

// ─── Step 3: Services ───────────────────────────────────────
const StepServices = ({ data, set }: { data: OnboardingData; set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void }) => {
  const [newService, setNewService] = useState("");
  const [newQuestion, setNewQuestion] = useState("");

  const addService = () => {
    if (newService.trim()) {
      set("services", [...data.services, newService.trim()]);
      setNewService("");
    }
  };
  const removeService = (i: number) => set("services", data.services.filter((_, idx) => idx !== i));

  const addQuestion = () => {
    if (newQuestion.trim()) {
      set("qualificationQuestions", [...data.qualificationQuestions, newQuestion.trim()]);
      setNewQuestion("");
    }
  };
  const removeQuestion = (i: number) => set("qualificationQuestions", data.qualificationQuestions.filter((_, idx) => idx !== i));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Services and lead qualification</h2>
        <p className="text-sm text-muted-foreground mt-1">Define what you offer and how the AI should qualify callers.</p>
      </div>

      {/* Services */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Services offered</Label>
        <div className="flex flex-wrap gap-2">
          {data.services.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-3 py-1.5 text-foreground">
              {s}
              <button onClick={() => removeService(i)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newService} onChange={(e) => setNewService(e.target.value)} placeholder="Add a service" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())} />
          <Button variant="outline" size="sm" onClick={addService}><Plus className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-border">
        <div>
          <p className="text-sm font-medium text-foreground">Emergency services</p>
          <p className="text-xs text-muted-foreground">Do you offer emergency or same-day service?</p>
        </div>
        <Switch checked={data.emergencyServices} onCheckedChange={(v) => set("emergencyServices", v)} />
      </div>

      {/* Qualification questions */}
      <div className="space-y-3 pt-4 border-t border-border">
        <Label className="text-sm font-medium">Qualification questions</Label>
        <p className="text-xs text-muted-foreground">Questions the AI will ask callers to qualify the lead.</p>
        <div className="space-y-2">
          {data.qualificationQuestions.map((q, i) => (
            <div key={i} className="flex items-start gap-2 text-sm bg-muted rounded-lg px-3 py-2">
              <span className="text-muted-foreground text-xs mt-0.5">{i + 1}.</span>
              <span className="flex-1 text-foreground">{q}</span>
              <button onClick={() => removeQuestion(i)} className="hover:text-destructive flex-shrink-0"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="Add a question" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addQuestion())} />
          <Button variant="outline" size="sm" onClick={addQuestion}><Plus className="w-4 h-4" /></Button>
        </div>
      </div>

      <Field label="Lead scoring preference">
        <Select value={data.scoringPreference} onValueChange={(v) => set("scoringPreference", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default — balanced scoring</SelectItem>
            <SelectItem value="urgency">Prioritize urgency and timeline</SelectItem>
            <SelectItem value="budget">Prioritize budget and project size</SelectItem>
            <SelectItem value="readiness">Prioritize decision-maker readiness</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
};

// ─── Step 4: Scheduling ─────────────────────────────────────
const StepScheduling = ({ data, set }: { data: OnboardingData; set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void }) => {
  const [newType, setNewType] = useState("");
  const addType = () => {
    if (newType.trim()) {
      set("appointmentTypes", [...data.appointmentTypes, newType.trim()]);
      setNewType("");
    }
  };
  const removeType = (i: number) => set("appointmentTypes", data.appointmentTypes.filter((_, idx) => idx !== i));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Scheduling</h2>
        <p className="text-sm text-muted-foreground mt-1">Let your AI receptionist book appointments on the first call.</p>
      </div>

      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Enable appointment booking</p>
          <p className="text-xs text-muted-foreground">Let callers book directly with your AI</p>
        </div>
        <Switch checked={data.bookingEnabled} onCheckedChange={(v) => set("bookingEnabled", v)} />
      </div>

      {data.bookingEnabled && (
        <>
          <div className="rounded-lg border border-border p-4 bg-muted/50">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Connect your calendar</p>
                <p className="text-xs text-muted-foreground">Google Calendar, Outlook, or Calendly</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => set("calendarConnected", true)}>
                {data.calendarConnected ? <><Check className="w-4 h-4 mr-1" /> Connected</> : "Connect"}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Appointment types</Label>
            <div className="flex flex-wrap gap-2">
              {data.appointmentTypes.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-muted rounded-full px-3 py-1.5 text-foreground">
                  {t}
                  <button onClick={() => removeType(i)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="e.g. Estimate, Service Call" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addType())} />
              <Button variant="outline" size="sm" onClick={addType}><Plus className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Default duration">
              <Select value={data.appointmentDuration} onValueChange={(v) => set("appointmentDuration", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Buffer between appointments">
              <Select value={data.bufferTime} onValueChange={(v) => set("bufferTime", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Booking notes or restrictions" hint="Optional">
            <Textarea value={data.bookingNotes} onChange={(e) => set("bookingNotes", e.target.value)} placeholder="e.g. No bookings on holidays. Commercial jobs need 2-hour windows." rows={2} />
          </Field>
        </>
      )}
    </div>
  );
};

// ─── Step 5: Notifications ──────────────────────────────────
const StepNotifications = ({ data, set }: { data: OnboardingData; set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void }) => {
  const updateRecipient = (type: "smsRecipients" | "emailRecipients", i: number, value: string) => {
    const arr = [...data[type]];
    arr[i] = value;
    set(type, arr);
  };
  const addRecipient = (type: "smsRecipients" | "emailRecipients") => {
    set(type, [...data[type], ""]);
  };
  const removeRecipient = (type: "smsRecipients" | "emailRecipients", i: number) => {
    set(type, data[type].filter((_, idx) => idx !== i));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Notifications and escalation</h2>
        <p className="text-sm text-muted-foreground mt-1">Decide who gets alerted when a hot lead comes in.</p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Hot lead SMS recipients</Label>
        {data.smsRecipients.map((r, i) => (
          <div key={i} className="flex gap-2">
            <Input value={r} onChange={(e) => updateRecipient("smsRecipients", i, e.target.value)} placeholder="(555) 123-4567" />
            {data.smsRecipients.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeRecipient("smsRecipients", i)}><X className="w-4 h-4" /></Button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addRecipient("smsRecipients")}><Plus className="w-4 h-4 mr-1" /> Add phone</Button>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <Label className="text-sm font-medium">Email alert recipients</Label>
        {data.emailRecipients.map((r, i) => (
          <div key={i} className="flex gap-2">
            <Input value={r} onChange={(e) => updateRecipient("emailRecipients", i, e.target.value)} placeholder="jane@smithhvac.com" />
            {data.emailRecipients.length > 1 && (
              <Button variant="ghost" size="icon" onClick={() => removeRecipient("emailRecipients", i)}><X className="w-4 h-4" /></Button>
            )}
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => addRecipient("emailRecipients")}><Plus className="w-4 h-4 mr-1" /> Add email</Button>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-border">
        <div>
          <p className="text-sm font-medium text-foreground">Escalate to human</p>
          <p className="text-xs text-muted-foreground">Transfer complex or urgent calls to a live person</p>
        </div>
        <Switch checked={data.escalateToHuman} onCheckedChange={(v) => set("escalateToHuman", v)} />
      </div>

      {data.escalateToHuman && (
        <Field label="Escalation contact phone" hint="The number to forward escalated calls to">
          <Input value={data.escalationContact} onChange={(e) => set("escalationContact", e.target.value)} placeholder="(555) 123-4567" />
        </Field>
      )}

      <div className="rounded-lg bg-muted p-4">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Quiet hours reminder:</strong> Non-emergency alerts are paused from {data.quietHoursStart} to {data.quietHoursEnd}. You can change this in the Hours step.
        </p>
      </div>
    </div>
  );
};

// ─── Step 6: Knowledge base ─────────────────────────────────
const StepKnowledge = ({ data, set }: { data: OnboardingData; set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void }) => (
  <div className="max-w-2xl mx-auto space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-foreground">Knowledge base</h2>
      <p className="text-sm text-muted-foreground mt-1">Help your AI receptionist answer questions accurately.</p>
    </div>

    <div className="rounded-lg bg-muted p-4">
      <p className="text-xs text-muted-foreground">
        <strong className="text-foreground">Tip:</strong> Start with your top 10–20 common customer questions. You can always add more later.
      </p>
    </div>

    <Field label="FAQs" hint="Common questions and answers your receptionist should know">
      <Textarea value={data.faqs} onChange={(e) => set("faqs", e.target.value)} placeholder={"Q: Do you offer free estimates?\nA: Yes, we offer free on-site estimates for all residential jobs.\n\nQ: What areas do you serve?\nA: We serve the greater Dallas–Fort Worth metro area."} rows={6} />
    </Field>

    <Field label="Service notes" hint="Details about your services the AI should know">
      <Textarea value={data.serviceNotes} onChange={(e) => set("serviceNotes", e.target.value)} placeholder="We specialize in Carrier and Trane systems. Minimum service call fee is $89." rows={3} />
    </Field>

    <Field label="Pricing guidance" hint="Quote ranges or pricing rules for the AI to reference">
      <Textarea value={data.pricingGuidance} onChange={(e) => set("pricingGuidance", e.target.value)} placeholder="AC diagnostic: $89–$129. Furnace tune-up: $99. We don't quote full replacements over the phone." rows={3} />
    </Field>

    <Field label="Areas served">
      <Textarea value={data.areasServed} onChange={(e) => set("areasServed", e.target.value)} placeholder="Dallas, Fort Worth, Arlington, Plano, Frisco, McKinney" rows={2} />
    </Field>

    <Field label="Policies or special instructions" hint="Anything else the AI should know">
      <Textarea value={data.policies} onChange={(e) => set("policies", e.target.value)} placeholder="We require a credit card on file for after-hours emergency visits. Commercial jobs need approval from the operations manager." rows={3} />
    </Field>
  </div>
);

// ─── Step 7: Review ─────────────────────────────────────────
const StepReview = ({ data, onFinish, onEdit }: { data: OnboardingData; onFinish: () => void; onEdit: (step: number) => void }) => {
  const sections = [
    {
      title: "Business",
      step: 1,
      items: [
        { label: "Name", value: data.businessName },
        { label: "Industry", value: data.industry },
        { label: "Phone", value: data.mainPhone },
        { label: "Locations", value: data.locations },
        { label: "Service area", value: data.serviceArea },
      ],
    },
    {
      title: "Hours",
      step: 2,
      items: [
        { label: "After-hours", value: data.afterHoursAction },
        { label: "Emergency calls", value: data.emergencyCallsEnabled ? "Enabled" : "Disabled" },
        { label: "Time zone", value: data.timezone },
      ],
    },
    {
      title: "Services",
      step: 3,
      items: [
        { label: "Services", value: data.services.join(", ") || "None added" },
        { label: "Questions", value: `${data.qualificationQuestions.length} configured` },
        { label: "Emergency services", value: data.emergencyServices ? "Yes" : "No" },
      ],
    },
    {
      title: "Scheduling",
      step: 4,
      items: [
        { label: "Booking", value: data.bookingEnabled ? "Enabled" : "Disabled" },
        { label: "Calendar", value: data.calendarConnected ? "Connected" : "Not connected" },
        { label: "Duration", value: `${data.appointmentDuration} min` },
      ],
    },
    {
      title: "Notifications",
      step: 5,
      items: [
        { label: "SMS recipients", value: data.smsRecipients.filter(Boolean).length.toString() },
        { label: "Email recipients", value: data.emailRecipients.filter(Boolean).length.toString() },
        { label: "Escalation", value: data.escalateToHuman ? "Enabled" : "Disabled" },
      ],
    },
    {
      title: "Knowledge",
      step: 6,
      items: [
        { label: "FAQs", value: data.faqs ? "Added" : "Empty" },
        { label: "Service notes", value: data.serviceNotes ? "Added" : "Empty" },
        { label: "Pricing", value: data.pricingGuidance ? "Added" : "Empty" },
      ],
    },
  ];

  const missing: string[] = [];
  if (!data.businessName) missing.push("Business name");
  if (!data.industry) missing.push("Industry");
  if (!data.mainPhone) missing.push("Main phone");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Review and test</h2>
        <p className="text-sm text-muted-foreground mt-1">Review your setup before going live.</p>
      </div>

      {missing.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">Missing required fields:</p>
          <ul className="text-xs text-destructive mt-1 space-y-0.5">
            {missing.map((m) => <li key={m}>• {m}</li>)}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((s) => (
          <div key={s.title} className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => onEdit(s.step)}>Edit</Button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {s.items.map((item) => (
                <div key={item.label}>
                  <p className="text-[11px] text-muted-foreground">{item.label}</p>
                  <p className="text-sm text-foreground truncate">{item.value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Test panel */}
      <div className="rounded-xl bg-muted p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Test your receptionist</h3>
        <p className="text-xs text-muted-foreground">Once you finish setup, try these to make sure everything works:</p>
        <div className="space-y-2">
          {[
            "Call your number and ask about a service",
            "Try booking an appointment",
            "Call after business hours",
            "Ask an emergency question",
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] text-muted-foreground">{i + 1}</span>
              </div>
              <span className="text-sm text-foreground">{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" onClick={onFinish} disabled={missing.length > 0}>
          Test my receptionist <ArrowRight className="ml-1 w-4 h-4" />
        </Button>
        <Button variant="outline" size="lg">Save and finish later</Button>
      </div>
    </div>
  );
};

export default Onboarding;
