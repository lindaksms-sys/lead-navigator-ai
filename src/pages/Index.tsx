import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import {
  Phone, PhoneOff, TrendingDown, Clock, Zap, ClipboardCheck, CalendarCheck,
  BarChart3, Calendar, MessageSquare, FileText, LayoutDashboard, Check,
  ArrowRight, Shield, Users, Menu, X, Bell, Star, Building2, Flame, Wrench,
  Sun, Droplets, HardHat
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const { ref, visible } = useInView();
  return (
    <section id={id} ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}>
      {children}
    </section>
  );
}

function Logo({ size = "default" }: { size?: "default" | "small" }) {
  const h = size === "small" ? 28 : 32;
  return (
    <svg width={h * 1.1} height={h} viewBox="0 0 36 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#2563EB" />
      <path d="M10 12C10 10.8954 10.8954 10 12 10H14C15.1046 10 16 10.8954 16 12V20C16 21.1046 15.1046 22 14 22H12C10.8954 22 10 21.1046 10 20V12Z" fill="white" />
      <path d="M18 14C18 13.4477 18.4477 13 19 13H21C21.5523 13 22 13.4477 22 14V20C22 20.5523 21.5523 21 21 21H19C18.4477 21 18 20.5523 18 20V14Z" fill="white" fillOpacity="0.7" />
      <circle cx="26" cy="12" r="2.5" fill="#22D3EE" />
    </svg>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenu(false);
  };

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "Pricing", id: "pricing" },
    { label: "FAQ", id: "faq" },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="font-semibold text-[17px] tracking-tight text-gray-900">ReceptionistAI Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">{l.label}</button>
            ))}
            <button onClick={() => navigate("/client/login")} className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">Login</button>
            <Button onClick={() => navigate("/apply")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 h-9 text-sm font-medium shadow-sm">
              Start Free Trial
            </Button>
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="block w-full text-left text-sm py-2.5 text-gray-600 hover:text-gray-900 font-medium">{l.label}</button>
            ))}
            <button onClick={() => { navigate("/client/login"); setMobileMenu(false); }} className="block w-full text-left text-sm py-2.5 text-gray-600 hover:text-gray-900 font-medium">Login</button>
            <div className="pt-2 flex flex-col gap-2">
              <Button onClick={() => navigate("/apply")} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Start Free Trial</Button>
              <Button variant="outline" onClick={() => scrollTo("demo")} className="w-full rounded-lg">Book a Demo</Button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="pt-28 pb-16 sm:pt-36 sm:pb-24 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-7">
            <p className="text-sm font-medium text-blue-600 tracking-wide">AI Receptionist for Home Services</p>
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.08] tracking-tight text-gray-900">
              Every missed call is a job you already lost
            </h1>
            <p className="text-lg text-gray-500 max-w-lg leading-relaxed">
              ReceptionistAI Pro picks up every call, qualifies the lead, texts your team, and books the appointment. Your phone never goes unanswered again.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => navigate("/apply")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-7 text-[15px] font-semibold h-12 shadow-md shadow-blue-600/20">
                Start Free Trial <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo("demo")} className="rounded-lg px-7 text-[15px] font-semibold h-12 border-gray-200 text-gray-700 hover:bg-gray-50">
                Book a Demo
              </Button>
            </div>
            <p className="text-sm text-gray-400 pt-1">Used by HVAC, plumbing, roofing, and solar contractors.</p>
          </div>

          {/* Dashboard mockup */}
          <div className="relative hidden lg:block">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/60 p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                <span className="ml-3 text-xs text-gray-400 font-medium">ReceptionistAI Dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Hot Leads", value: "12", icon: Flame, accent: "text-red-500" },
                  { label: "Calls Today", value: "47", icon: Phone, accent: "text-blue-600" },
                  { label: "Jobs Booked", value: "8", icon: CalendarCheck, accent: "text-emerald-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl p-3.5 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{s.label}</p>
                      <s.icon className={`h-3.5 w-3.5 ${s.accent}`} />
                    </div>
                    <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { tag: "HOT", tagColor: "bg-red-100 text-red-600", text: "John M. — HVAC Repair — Score 92", time: "2m ago" },
                  { tag: "NEW", tagColor: "bg-blue-100 text-blue-600", text: "Sarah K. — Solar Install Quote", time: "5m ago" },
                  { tag: "BOOKED", tagColor: "bg-emerald-100 text-emerald-600", text: "Mike R. — Plumbing — Tomorrow 2PM", time: "8m ago" },
                ].map((item) => (
                  <div key={item.text} className="bg-white rounded-lg p-3 border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.tagColor}`}>{item.tag}</span>
                      <span className="text-sm text-gray-700">{item.text}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating alert */}
            <div className="absolute -bottom-3 -right-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-lg flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                <Bell className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Hot Lead Alert</p>
                <p className="text-[11px] text-gray-400">SMS sent to your team</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <Section className="py-20 sm:py-28 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3">The problem</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Your phone rings. Nobody picks up. The job goes to someone else.</h2>
            <p className="text-gray-500 text-lg">Most home service businesses lose calls every day. Crews are on the roof. The office closes at five. Callers don't leave voicemails — they call the next company.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: PhoneOff, title: "Your crew is working, not answering", desc: "Technicians can't stop a repair to pick up the phone. Those calls go to voicemail — and voicemail goes nowhere.", color: "text-red-500", bg: "bg-red-50" },
              { icon: Clock, title: "Nights and weekends are dead zones", desc: "A large share of service calls come outside business hours. No one's there to answer. No one books the job.", color: "text-amber-500", bg: "bg-amber-50" },
              { icon: TrendingDown, title: "Slow response loses the job", desc: "The contractor who picks up first usually wins. Every unanswered ring is money walking out the door.", color: "text-orange-500", bg: "bg-orange-50" },
            ].map((p) => (
              <Card key={p.title} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
                <CardContent className="pt-6 pb-6">
                  <div className={`h-11 w-11 rounded-xl ${p.bg} ${p.color} flex items-center justify-center mb-4`}>
                    <p.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-[17px] mb-2 text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ── How It Works ── */}
      <Section className="py-20 sm:py-28 px-4" id="demo">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Five steps between a ringing phone and a booked job</h2>
            <p className="text-gray-500 text-lg">No staff needed. No hold music. No callbacks.</p>
          </div>
          <div className="grid sm:grid-cols-5 gap-6">
            {[
              { step: "1", icon: Phone, title: "Call picked up", desc: "Every inbound call is answered on the first ring. Day or night." },
              { step: "2", icon: ClipboardCheck, title: "Caller screened", desc: "The AI asks what they need, when they need it, and where." },
              { step: "3", icon: BarChart3, title: "Lead scored", desc: "Each caller is rated Hot, Warm, or Cold based on real buying signals." },
              { step: "4", icon: Bell, title: "Team notified", desc: "High-intent leads trigger an instant text to your team." },
              { step: "5", icon: CalendarCheck, title: "Appointment set", desc: "The job gets booked on your calendar before the caller hangs up." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-md shadow-blue-600/20">
                  {s.step}
                </div>
                <s.icon className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-[15px] mb-1 text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Features ── */}
      <Section className="py-20 sm:py-28 bg-gray-50 px-4" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">A full front office that never clocks out</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Phone, title: "24/7 call answering", desc: "Picks up every call on the first ring. Nights, weekends, holidays — covered." },
              { icon: ClipboardCheck, title: "Lead qualification", desc: "Asks what service they need, their timeline, budget, and property type." },
              { icon: BarChart3, title: "Lead scoring", desc: "Scores every caller from 0 to 100. You see who's ready to buy right now." },
              { icon: MessageSquare, title: "Instant SMS alerts", desc: "Hot lead calls in. Your phone buzzes within seconds. No delay." },
              { icon: Calendar, title: "Appointment booking", desc: "Checks your availability and books the job while the caller is still on the line." },
              { icon: FileText, title: "Call transcripts", desc: "Full transcript of every conversation. Review what was said, when." },
              { icon: Users, title: "Multi-client portal", desc: "Agencies run multiple contractor accounts from one login." },
              { icon: Shield, title: "Access controls", desc: "Set roles and permissions. Keep client data separate and secure." },
            ].map((f) => (
              <Card key={f.title} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
                <CardContent className="pt-5 pb-5">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-[15px] mb-1 text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Who It's For ── */}
      <Section className="py-20 sm:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Who it's for</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Built for contractors. Ready for agencies.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { icon: Flame, label: "HVAC", desc: "Pick up emergency repair calls. Book seasonal tune-ups while your crew is in the field." },
              { icon: Droplets, label: "Plumbing", desc: "Answer burst-pipe calls instantly. Schedule drain cleanings without lifting a finger." },
              { icon: HardHat, label: "Roofing", desc: "Screen storm damage inquiries. Get inspections on the calendar the same day." },
              { icon: Sun, label: "Solar", desc: "Qualify homeowners around the clock. Book consultations while you sleep." },
              { icon: Building2, label: "Agencies", desc: "Run multiple contractor accounts from one dashboard. White-label included." },
            ].map((ind) => (
              <Card key={ind.label} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white text-center">
                <CardContent className="pt-6 pb-5">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <ind.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-base mb-1 text-gray-900">{ind.label}</h3>
                  <p className="text-sm text-gray-500">{ind.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ── ROI ── */}
      <Section className="py-20 sm:py-28 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Why it pays for itself</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">The math is simple. Missed calls cost jobs.</h2>
              <p className="text-gray-500 text-lg leading-relaxed">
                One unanswered call can be a $2,000 repair or a $15,000 install. ReceptionistAI Pro makes sure that call gets answered, the lead gets scored, and the job gets booked — before anyone else has a chance.
              </p>
              <div className="space-y-4">
                {[
                  "Answer faster than any competitor in your market",
                  "Cover nights and weekends without adding payroll",
                  "Close more leads by responding while intent is high",
                  "Stop losing after-hours callers to your competition",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-gray-700 text-[15px]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { metric: "< 2s", label: "Average answer time" },
                { metric: "24/7", label: "Call coverage" },
                { metric: "100%", label: "Calls answered" },
                { metric: "0", label: "Missed opportunities" },
              ].map((m) => (
                <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
                  <p className="text-3xl font-bold text-blue-600 mb-1">{m.metric}</p>
                  <p className="text-sm text-gray-500">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Social Proof ── */}
      <Section className="py-20 sm:py-28 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">What customers say</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-gray-900">Contractors using it. Results speaking.</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: "Mike Rodriguez", co: "Rodriguez HVAC", quote: "We used to miss half our calls. Now every one gets answered, scored, and sent to my phone. The hot lead texts alone cover the cost." },
              { name: "Sarah Chen", co: "SunPower Solar Co.", quote: "Callers don't know it's AI. It sounds sharp, asks the right questions, and the lead scores tell us exactly who to call back first." },
              { name: "James Wilson", co: "Wilson Plumbing", quote: "Took 20 minutes to set up. Now when a high-value lead calls, I get a text and the appointment is already on my calendar." },
            ].map((t) => (
              <Card key={t.name} className="text-left border border-gray-200 shadow-sm bg-white">
                <CardContent className="pt-6 pb-6">
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-gray-600 mb-5 leading-relaxed">"{t.quote}"</p>
                  <div className="border-t border-gray-100 pt-4">
                    <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.co}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section className="py-20 sm:py-28 bg-gray-50 px-4" id="pricing">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">Pick a plan. Start answering calls today.</h2>
          <p className="text-gray-500 mb-12 text-lg">14-day money-back guarantee on all plans. No contracts.</p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Starter", price: "$497", period: "/mo", popular: false, desc: "One location. Full coverage. The basics done right.",
                features: ["1 location", "500 minutes/month", "Lead scoring", "SMS alerts", "Call transcripts", "Email support"],
              },
              {
                name: "Growth", price: "$997", period: "/mo", popular: true, desc: "Multiple locations. More minutes. Appointment booking included.",
                features: ["Up to 3 locations", "2,000 minutes/month", "Lead scoring + automation", "Priority SMS & email alerts", "Appointment booking", "Calendar integration", "Priority support"],
              },
              {
                name: "Agency", price: "Custom", period: "", popular: false, desc: "Unlimited clients. White-label ready. Built for scale.",
                features: ["Unlimited locations", "Unlimited minutes", "Multi-tenant portal", "White-label branding", "API access", "Dedicated account manager", "Custom integrations", "SLA guarantee"],
              },
            ].map((tier) => (
              <Card key={tier.name} className={`text-left relative overflow-hidden ${tier.popular ? "border-2 border-blue-600 shadow-xl" : "border border-gray-200 shadow-sm"} bg-white`}>
                {tier.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900">{tier.name}</CardTitle>
                    {tier.popular && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Most Popular</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{tier.desc}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                    <span className="text-gray-400 text-sm">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="text-gray-600">{f}</span>
                    </div>
                  ))}
                  <Button
                    className={`w-full mt-5 rounded-lg h-11 font-semibold ${tier.popular ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => navigate("/apply")}
                  >
                    {tier.name === "Agency" ? "Contact Sales" : "Start Free Trial"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section className="py-20 sm:py-28 px-4" id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Common questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              { q: "Does it only answer calls?", a: "No. It answers the call, asks qualifying questions, scores the lead, sends your team an SMS, and books the appointment. All automatic." },
              { q: "Who is this for?", a: "HVAC, plumbing, roofing, solar, and general contractors. Also built for agencies that manage multiple contractor accounts." },
              { q: "Does it work nights and weekends?", a: "Yes. It runs 24/7. Nights, weekends, holidays. That's when most of your competitors miss calls." },
              { q: "Will my team know when someone calls?", a: "Yes. Hot leads trigger an instant text to your team. Every call is also logged in your dashboard with a full transcript." },
              { q: "Can it actually book appointments?", a: "Yes. It checks your calendar in real time and books the job on the spot. No phone tag. No back-and-forth." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-xl border border-gray-200 px-5 shadow-sm">
                <AccordionTrigger className="text-left font-medium text-gray-900 text-[15px] hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-gray-500 text-sm leading-relaxed">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* ── Final CTA ── */}
      <Section className="py-20 sm:py-28 px-4 bg-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Your phone should never go unanswered again.</h2>
          <p className="text-gray-400 mb-8 text-lg">Start today. No credit card required. Cancel anytime.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate("/apply")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 h-12 text-[15px] font-semibold shadow-lg shadow-blue-600/30">
              Start Free Trial <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollTo("demo")} className="rounded-lg px-8 h-12 text-[15px] font-semibold border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              Book a Demo
            </Button>
          </div>
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer className="py-12 px-4 bg-gray-950 text-gray-500">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <Logo size="small" />
              <span className="font-semibold text-white text-sm">ReceptionistAI Pro</span>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <button onClick={() => navigate("/client/login")} className="hover:text-white transition-colors">Login</button>
              <a href="mailto:hello@receptionistai.pro" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} ReceptionistAI Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
