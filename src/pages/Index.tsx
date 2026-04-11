import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import {
  Phone, PhoneOff, TrendingDown, Clock, ClipboardCheck, CalendarCheck,
  BarChart3, Calendar, MessageSquare, FileText, Check,
  ArrowRight, Shield, Users, Menu, X, Bell, Star, Building2, Flame,
  Sun, Droplets, HardHat, ChevronRight
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

function useInView(threshold = 0.1) {
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
    <section id={id} ref={ref} className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </section>
  );
}

function Logo({ size = "default" }: { size?: "default" | "small" }) {
  const h = size === "small" ? 24 : 28;
  return (
    <svg width={h} height={h} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="7" fill="#1e3a5f" />
      <path d="M8 10.5C8 9.67 8.67 9 9.5 9H11.5C12.33 9 13 9.67 13 10.5V17.5C13 18.33 12.33 19 11.5 19H9.5C8.67 19 8 18.33 8 17.5V10.5Z" fill="white" />
      <path d="M15 12.5C15 11.95 15.45 11.5 16 11.5H18C18.55 11.5 19 11.95 19 12.5V17.5C19 18.05 18.55 18.5 18 18.5H16C15.45 18.5 15 18.05 15 17.5V12.5Z" fill="white" fillOpacity="0.6" />
      <circle cx="22" cy="10" r="2" fill="#60a5fa" />
    </svg>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
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
    <div className="min-h-screen bg-[#fafafa] text-gray-900 antialiased selection:bg-blue-100">
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? "bg-white/90 backdrop-blur-xl border-b border-gray-200/60" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-[60px]">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold text-[15px] tracking-tight text-gray-900">ReceptionistAI<span className="text-gray-400 font-normal ml-0.5">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors font-medium">{l.label}</button>
            ))}
            <button onClick={() => navigate("/client/login")} className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors font-medium">Login</button>
            <Button onClick={() => navigate("/apply")} className="bg-gray-900 hover:bg-gray-800 text-white rounded-md px-4 h-8 text-[13px] font-medium">
              Start Free Trial
            </Button>
          </div>
          <button className="md:hidden p-2 -mr-2" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 px-5 py-4 space-y-1 shadow-lg">
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => scrollTo(l.id)} className="block w-full text-left text-sm py-2.5 text-gray-600 hover:text-gray-900 font-medium">{l.label}</button>
            ))}
            <button onClick={() => { navigate("/client/login"); setMobileMenu(false); }} className="block w-full text-left text-sm py-2.5 text-gray-600 hover:text-gray-900 font-medium">Login</button>
            <div className="pt-3 flex flex-col gap-2">
              <Button onClick={() => navigate("/apply")} className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-md text-sm">Start Free Trial</Button>
              <Button variant="outline" onClick={() => scrollTo("demo")} className="w-full rounded-md text-sm border-gray-300">Book a Demo</Button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-32 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-16 lg:gap-20 items-start">
            <div className="space-y-8 pt-4">
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-gray-600 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                AI Receptionist for Home Services
              </div>
              <h1 className="text-[40px] sm:text-[52px] lg:text-[58px] font-extrabold leading-[1.05] tracking-[-0.025em] text-gray-900">
                Every missed call<br className="hidden sm:block" /> is a job you<br className="hidden sm:block" /> already lost
              </h1>
              <p className="text-[17px] text-gray-500 max-w-md leading-[1.65] font-normal">
                ReceptionistAI Pro picks up every call, qualifies the lead, texts your team, and books the appointment. Your phone never goes unanswered again.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Button size="lg" onClick={() => navigate("/apply")} className="bg-gray-900 hover:bg-gray-800 text-white rounded-md px-6 text-[14px] font-semibold h-11 shadow-none">
                  Start Free Trial <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => scrollTo("demo")} className="rounded-md px-6 text-[14px] font-semibold h-11 border-gray-300 text-gray-600 hover:bg-white hover:border-gray-400 shadow-none">
                  Book a Demo
                </Button>
              </div>
              <p className="text-[13px] text-gray-400 font-normal">Used by HVAC, plumbing, roofing, and solar contractors.</p>
            </div>

            {/* Dashboard mockup — refined */}
            <div className="relative hidden lg:block">
              <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_20px_60px_rgba(0,0,0,0.06)] p-0 overflow-hidden">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-300/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-300/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-300/80" />
                  </div>
                  <span className="ml-2 text-[11px] text-gray-400 font-medium tracking-wide">Dashboard — Today</span>
                </div>
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-px bg-gray-100">
                  {[
                    { label: "Hot Leads", value: "12", sub: "+3 today", accent: "text-red-600" },
                    { label: "Calls Handled", value: "47", sub: "100% answered", accent: "text-gray-900" },
                    { label: "Jobs Booked", value: "8", sub: "2 pending", accent: "text-emerald-600" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white p-4">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.08em] mb-1">{s.label}</p>
                      <p className={`text-2xl font-bold tracking-tight ${s.accent}`}>{s.value}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
                    </div>
                  ))}
                </div>
                {/* Lead list */}
                <div className="divide-y divide-gray-100">
                  {[
                    { tag: "HOT", tagBg: "bg-red-500", text: "John M.", detail: "HVAC Repair · Score 92", time: "2m ago" },
                    { tag: "NEW", tagBg: "bg-blue-500", text: "Sarah K.", detail: "Solar Install Quote", time: "5m ago" },
                    { tag: "BOOKED", tagBg: "bg-emerald-500", text: "Mike R.", detail: "Plumbing · Tomorrow 2PM", time: "8m ago" },
                  ].map((item) => (
                    <div key={item.text} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold px-1.5 py-[3px] rounded text-white tracking-wide ${item.tagBg}`}>{item.tag}</span>
                        <div>
                          <span className="text-[13px] font-medium text-gray-900">{item.text}</span>
                          <span className="text-[13px] text-gray-400 ml-1.5">{item.detail}</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-gray-400 tabular-nums">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating SMS alert */}
              <div className="absolute -bottom-5 -left-4 bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-3.5 w-3.5 text-red-500" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-gray-900">Hot Lead Alert</p>
                  <p className="text-[11px] text-gray-400">SMS sent to your team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Logos / Trust bar ── */}
      <div className="border-y border-gray-200/60 bg-white py-6 px-5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {["HVAC Pros", "Solar Direct", "Apex Roofing", "Metro Plumbing", "ServiceFlow Agency"].map((name) => (
            <span key={name} className="text-[13px] font-semibold text-gray-300 uppercase tracking-[0.1em]">{name}</span>
          ))}
        </div>
      </div>

      {/* ── Problem ── */}
      <Section className="py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-16">
            <p className="text-[12px] font-semibold text-red-500 uppercase tracking-[0.12em] mb-3">The problem</p>
            <h2 className="text-[32px] sm:text-[40px] font-bold leading-[1.12] tracking-tight text-gray-900 mb-4">Your phone rings. Nobody picks up. The job goes to someone else.</h2>
            <p className="text-[16px] text-gray-500 leading-relaxed">Most home service businesses lose calls every day. Crews are on the roof. The office closes at five. Callers don't leave voicemails — they call the next company.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: PhoneOff, title: "Your crew is working, not answering", desc: "Technicians can't stop a repair to pick up the phone. Those calls go to voicemail — and voicemail goes nowhere.", color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
              { icon: Clock, title: "Nights and weekends are dead zones", desc: "A large share of service calls come outside business hours. No one's there to answer. No one books the job.", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
              { icon: TrendingDown, title: "Slow response loses the job", desc: "The contractor who picks up first usually wins. Every unanswered ring is money walking out the door.", color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
            ].map((p) => (
              <div key={p.title} className={`bg-white rounded-lg border ${p.border} p-6 hover:shadow-sm transition-shadow`}>
                <div className={`h-10 w-10 rounded-lg ${p.bg} ${p.color} flex items-center justify-center mb-5`}>
                  <p.icon className="h-[18px] w-[18px]" />
                </div>
                <h3 className="font-semibold text-[15px] mb-2 text-gray-900 leading-snug">{p.title}</h3>
                <p className="text-[14px] text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── How It Works ── */}
      <Section className="py-24 sm:py-32 px-5 sm:px-8 bg-white" id="demo">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-16">
            <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-[0.12em] mb-3">How it works</p>
            <h2 className="text-[32px] sm:text-[40px] font-bold leading-[1.12] tracking-tight text-gray-900 mb-4">Five steps between a ringing phone and a booked job</h2>
            <p className="text-[16px] text-gray-500 leading-relaxed">No staff needed. No hold music. No callbacks.</p>
          </div>
          <div className="grid sm:grid-cols-5 gap-0">
            {[
              { step: "01", icon: Phone, title: "Call picked up", desc: "Every inbound call is answered on the first ring. Day or night." },
              { step: "02", icon: ClipboardCheck, title: "Caller screened", desc: "The AI asks what they need, when they need it, and where." },
              { step: "03", icon: BarChart3, title: "Lead scored", desc: "Each caller is rated Hot, Warm, or Cold based on real buying signals." },
              { step: "04", icon: Bell, title: "Team notified", desc: "High-intent leads trigger an instant text to your team." },
              { step: "05", icon: CalendarCheck, title: "Appointment set", desc: "The job gets booked on your calendar before the caller hangs up." },
            ].map((s, i) => (
              <div key={s.step} className={`relative p-6 ${i < 4 ? "sm:border-r sm:border-gray-100" : ""}`}>
                <span className="text-[11px] font-bold text-gray-300 uppercase tracking-[0.15em] block mb-4">{s.step}</span>
                <s.icon className="h-5 w-5 text-gray-900 mb-3" />
                <h3 className="font-semibold text-[14px] mb-1.5 text-gray-900">{s.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Product Mock UI ── */}
      <Section className="py-24 sm:py-32 px-5 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-16">
            <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-[0.12em] mb-3">Inside the platform</p>
            <h2 className="text-[32px] sm:text-[40px] font-bold leading-[1.12] tracking-tight text-gray-900 mb-4">See what your team sees every day</h2>
            <p className="text-[16px] text-gray-500 leading-relaxed">Real dashboards. Real data. Built to help contractors act fast and close more jobs.</p>
          </div>

          {/* Row 1: Leads Dashboard + SMS Alert */}
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5 mb-5">
            {/* Leads Kanban Board */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                <span className="text-[13px] font-semibold text-gray-900">Leads Pipeline</span>
                <span className="text-[11px] text-gray-400 font-medium">Today · 14 leads</span>
              </div>
              <div className="grid grid-cols-3 gap-px bg-gray-100 min-h-[280px]">
                {/* Hot Column */}
                <div className="bg-white p-3 space-y-2.5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-[11px] font-bold text-gray-900 uppercase tracking-[0.08em]">Hot</span>
                    <span className="text-[10px] text-gray-400 ml-auto font-medium">5</span>
                  </div>
                  {[
                    { name: "David Park", service: "AC Replacement", score: 94, time: "3m ago", urgent: true },
                    { name: "Maria Santos", service: "Water Heater", score: 88, time: "12m ago", urgent: true },
                    { name: "Tom Bradley", service: "Roof Leak Repair", score: 85, time: "18m ago", urgent: false },
                  ].map((lead) => (
                    <div key={lead.name} className="rounded-md border border-gray-150 bg-white p-2.5 hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-semibold text-gray-900">{lead.name}</span>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{lead.score}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-1">{lead.service}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">{lead.time}</span>
                        {lead.urgent && <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Urgent</span>}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Warm Column */}
                <div className="bg-white p-3 space-y-2.5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-[11px] font-bold text-gray-900 uppercase tracking-[0.08em]">Warm</span>
                    <span className="text-[10px] text-gray-400 ml-auto font-medium">6</span>
                  </div>
                  {[
                    { name: "Lisa Chen", service: "Solar Consultation", score: 62, time: "1h ago" },
                    { name: "Robert Hall", service: "HVAC Tune-Up", score: 55, time: "2h ago" },
                    { name: "Amy Torres", service: "Pipe Inspection", score: 48, time: "3h ago" },
                  ].map((lead) => (
                    <div key={lead.name} className="rounded-md border border-gray-150 bg-white p-2.5 hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-semibold text-gray-900">{lead.name}</span>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{lead.score}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-1">{lead.service}</p>
                      <span className="text-[10px] text-gray-400">{lead.time}</span>
                    </div>
                  ))}
                </div>
                {/* Cold Column */}
                <div className="bg-white p-3 space-y-2.5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    <span className="text-[11px] font-bold text-gray-900 uppercase tracking-[0.08em]">Cold</span>
                    <span className="text-[10px] text-gray-400 ml-auto font-medium">3</span>
                  </div>
                  {[
                    { name: "Kevin Wright", service: "Gutter Quote", score: 28, time: "5h ago" },
                    { name: "Janet Mills", service: "General Inquiry", score: 15, time: "1d ago" },
                  ].map((lead) => (
                    <div key={lead.name} className="rounded-md border border-gray-150 bg-white p-2.5 hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-semibold text-gray-900">{lead.name}</span>
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">{lead.score}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-1">{lead.service}</p>
                      <span className="text-[10px] text-gray-400">{lead.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SMS Alert Preview */}
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                  <span className="text-[13px] font-semibold text-gray-900">SMS Alerts</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { time: "2:34 PM", msg: "🔥 HOT LEAD — David Park, AC Replacement, Score 94. Needs service today. (480) 555-0142", highlight: true },
                    { time: "1:18 PM", msg: "New lead: Lisa Chen, Solar Consultation, Score 62. Wants quote this week.", highlight: false },
                    { time: "11:45 AM", msg: "✅ Appointment booked: Tom Bradley, Roof Leak Repair, Tomorrow 9:00 AM.", highlight: false },
                  ].map((sms, i) => (
                    <div key={i} className={`rounded-lg p-3 ${sms.highlight ? "bg-red-50 border border-red-100" : "bg-gray-50 border border-gray-100"}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${sms.highlight ? "text-red-500" : "text-gray-400"}`}>
                          {sms.highlight ? "Hot Lead Alert" : "Notification"}
                        </span>
                        <span className="text-[10px] text-gray-400">{sms.time}</span>
                      </div>
                      <p className={`text-[12px] leading-relaxed ${sms.highlight ? "text-red-900 font-medium" : "text-gray-600"}`}>{sms.msg}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Score Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[13px] font-semibold text-gray-900">Lead Score — David Park</span>
                  <span className="text-[22px] font-extrabold text-red-600">94</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: "94%" }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex justify-between text-gray-500"><span>Timeline</span><span className="font-semibold text-gray-700">+30</span></div>
                  <div className="flex justify-between text-gray-500"><span>Budget</span><span className="font-semibold text-gray-700">+25</span></div>
                  <div className="flex justify-between text-gray-500"><span>Property</span><span className="font-semibold text-gray-700">+20</span></div>
                  <div className="flex justify-between text-gray-500"><span>Decision Maker</span><span className="font-semibold text-gray-700">+19</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Transcript + Appointment + Admin */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Transcript Preview */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                <span className="text-[13px] font-semibold text-gray-900">Call Transcript</span>
                <span className="text-[11px] text-gray-400 font-medium">4m 22s</span>
              </div>
              <div className="p-4 space-y-3 max-h-[260px] overflow-y-auto">
                {[
                  { speaker: "AI", text: "Thanks for calling Comfort Air HVAC. How can I help you today?" },
                  { speaker: "Caller", text: "Hi, my AC stopped blowing cold air this morning. I need someone out here today if possible." },
                  { speaker: "AI", text: "I can help with that. Is this a residential or commercial property?" },
                  { speaker: "Caller", text: "Residential. Single family home, about 2,400 square feet." },
                  { speaker: "AI", text: "Got it. And do you know the brand or age of your current unit?" },
                  { speaker: "Caller", text: "It's a Carrier, maybe 8 years old. It was running fine yesterday." },
                  { speaker: "AI", text: "Understood. I have a technician available this afternoon between 2 and 4 PM. Would that work for you?" },
                  { speaker: "Caller", text: "That's perfect. Book it." },
                ].map((line, i) => (
                  <div key={i} className={`flex gap-2.5 ${line.speaker === "AI" ? "" : "flex-row-reverse"}`}>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${line.speaker === "AI" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}>
                      {line.speaker === "AI" ? "AI" : "C"}
                    </div>
                    <div className={`rounded-lg px-3 py-2 text-[12px] leading-relaxed max-w-[85%] ${line.speaker === "AI" ? "bg-gray-50 text-gray-700" : "bg-blue-50 text-blue-900"}`}>
                      {line.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Appointment Booking Panel */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                <span className="text-[13px] font-semibold text-gray-900">Appointments</span>
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">3 today</span>
              </div>
              <div className="p-4 space-y-2.5">
                {[
                  { time: "9:00 AM", name: "Tom Bradley", service: "Roof Leak Inspection", status: "Confirmed", statusColor: "text-emerald-600 bg-emerald-50" },
                  { time: "11:30 AM", name: "Sarah Kim", service: "Furnace Maintenance", status: "Confirmed", statusColor: "text-emerald-600 bg-emerald-50" },
                  { time: "2:00 PM", name: "David Park", service: "AC Replacement", status: "Pending", statusColor: "text-amber-600 bg-amber-50" },
                  { time: "4:30 PM", name: "Maria Santos", service: "Water Heater Install", status: "Scheduled", statusColor: "text-blue-600 bg-blue-50" },
                ].map((appt, i) => (
                  <div key={i} className="rounded-md border border-gray-100 p-3 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-semibold text-gray-900">{appt.time}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${appt.statusColor}`}>{appt.status}</span>
                    </div>
                    <p className="text-[12px] text-gray-700 font-medium">{appt.name}</p>
                    <p className="text-[11px] text-gray-400">{appt.service}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Overview */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                <span className="text-[13px] font-semibold text-gray-900">Admin Overview</span>
                <span className="text-[11px] text-gray-400 font-medium">This month</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Active Agencies", value: "24", change: "+3" },
                    { label: "Total Users", value: "142", change: "+18" },
                    { label: "Monthly Revenue", value: "$28.4K", change: "+12%" },
                    { label: "Calls This Month", value: "3,847", change: "+22%" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.08em] mb-1">{stat.label}</p>
                      <div className="flex items-end gap-1.5">
                        <span className="text-[18px] font-bold text-gray-900 leading-none">{stat.value}</span>
                        <span className="text-[10px] font-semibold text-emerald-600 mb-0.5">{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.08em] mb-2.5">Top Agencies</p>
                  {[
                    { name: "ServiceFlow Agency", clients: 8, revenue: "$4,200" },
                    { name: "HomeTeam Partners", clients: 5, revenue: "$3,100" },
                    { name: "Peak Performance Co.", clients: 4, revenue: "$2,800" },
                  ].map((agency) => (
                    <div key={agency.name} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded bg-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-500">{agency.name[0]}</div>
                        <div>
                          <p className="text-[11px] font-medium text-gray-900">{agency.name}</p>
                          <p className="text-[10px] text-gray-400">{agency.clients} clients</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-700">{agency.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Features ── */}
      <Section className="py-24 sm:py-32 px-5 sm:px-8" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-16 items-start">
            <div className="lg:sticky lg:top-28">
              <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-[0.12em] mb-3">Features</p>
              <h2 className="text-[32px] sm:text-[36px] font-bold leading-[1.12] tracking-tight text-gray-900 mb-4">A full front office that never clocks out</h2>
              <p className="text-[15px] text-gray-500 leading-relaxed mb-6">Everything from call answering to appointment booking. Built for contractors who don't have time to sit by the phone.</p>
              <Button onClick={() => navigate("/apply")} className="bg-gray-900 hover:bg-gray-800 text-white rounded-md px-5 h-10 text-[13px] font-semibold shadow-none">
                See all features <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
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
                <div key={f.title} className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all group">
                  <div className="h-9 w-9 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center mb-4 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                    <f.icon className="h-[18px] w-[18px]" />
                  </div>
                  <h3 className="font-semibold text-[14px] mb-1 text-gray-900">{f.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Who It's For ── */}
      <Section className="py-24 sm:py-32 px-5 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-lg mx-auto mb-14">
            <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-[0.12em] mb-3">Who it's for</p>
            <h2 className="text-[32px] sm:text-[40px] font-bold leading-[1.12] tracking-tight text-gray-900">Built for contractors. Ready for agencies.</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: Flame, label: "HVAC", desc: "Pick up emergency repair calls. Book seasonal tune-ups while your crew is in the field." },
              { icon: Droplets, label: "Plumbing", desc: "Answer burst-pipe calls instantly. Schedule drain cleanings without lifting a finger." },
              { icon: HardHat, label: "Roofing", desc: "Screen storm damage inquiries. Get inspections on the calendar the same day." },
              { icon: Sun, label: "Solar", desc: "Qualify homeowners around the clock. Book consultations while you sleep." },
              { icon: Building2, label: "Agencies", desc: "Run multiple contractor accounts from one dashboard. White-label included." },
            ].map((ind) => (
              <div key={ind.label} className="bg-[#fafafa] rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition-colors">
                <ind.icon className="h-5 w-5 text-gray-900 mb-3" />
                <h3 className="font-semibold text-[14px] mb-1.5 text-gray-900">{ind.label}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── ROI ── */}
      <Section className="py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-[0.12em]">Why it pays for itself</p>
              <h2 className="text-[32px] sm:text-[40px] font-bold leading-[1.12] tracking-tight text-gray-900">The math is simple. Missed calls cost jobs.</h2>
              <p className="text-[16px] text-gray-500 leading-relaxed">
                One unanswered call can be a $2,000 repair or a $15,000 install. ReceptionistAI Pro makes sure that call gets answered, the lead gets scored, and the job gets booked — before anyone else has a chance.
              </p>
              <div className="space-y-3.5 pt-2">
                {[
                  "Answer faster than any competitor in your market",
                  "Cover nights and weekends without adding payroll",
                  "Close more leads by responding while intent is high",
                  "Stop losing after-hours callers to your competition",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 h-5 w-5 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-gray-700 text-[15px]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { metric: "< 2s", label: "Average answer time" },
                { metric: "24/7", label: "Call coverage" },
                { metric: "100%", label: "Calls answered" },
                { metric: "0", label: "Missed opportunities" },
              ].map((m) => (
                <div key={m.label} className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-[36px] font-bold text-gray-900 tracking-tight mb-1">{m.metric}</p>
                  <p className="text-[13px] text-gray-400 font-medium">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Social Proof ── */}
      <Section className="py-24 sm:py-32 px-5 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-14">
            <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-[0.12em] mb-3">What customers say</p>
            <h2 className="text-[32px] sm:text-[40px] font-bold leading-[1.12] tracking-tight text-gray-900">Contractors using it. Results speaking.</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { name: "Mike Rodriguez", co: "Rodriguez HVAC", quote: "We used to miss half our calls. Now every one gets answered, scored, and sent to my phone. The hot lead texts alone cover the cost." },
              { name: "Sarah Chen", co: "SunPower Solar Co.", quote: "Callers don't know it's AI. It sounds sharp, asks the right questions, and the lead scores tell us exactly who to call back first." },
              { name: "James Wilson", co: "Wilson Plumbing", quote: "Took 20 minutes to set up. Now when a high-value lead calls, I get a text and the appointment is already on my calendar." },
            ].map((t) => (
              <div key={t.name} className="bg-[#fafafa] rounded-lg border border-gray-200 p-6">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-[14px] text-gray-600 mb-6 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-500">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold text-[13px] text-gray-900">{t.name}</p>
                    <p className="text-[12px] text-gray-400">{t.co}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section className="py-24 sm:py-32 px-5 sm:px-8" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-lg mx-auto mb-14">
            <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-[0.12em] mb-3">Pricing</p>
            <h2 className="text-[32px] sm:text-[40px] font-bold leading-[1.12] tracking-tight text-gray-900 mb-3">Pick a plan. Start answering calls today.</h2>
            <p className="text-[15px] text-gray-500">14-day money-back guarantee on all plans. No contracts.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
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
              <div key={tier.name} className={`rounded-lg p-6 ${tier.popular ? "bg-gray-900 text-white ring-1 ring-gray-900" : "bg-white border border-gray-200"}`}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-semibold text-[15px] ${tier.popular ? "text-white" : "text-gray-900"}`}>{tier.name}</h3>
                  {tier.popular && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">Popular</span>
                  )}
                </div>
                <p className={`text-[13px] mb-5 ${tier.popular ? "text-gray-400" : "text-gray-500"}`}>{tier.desc}</p>
                <div className="mb-6">
                  <span className={`text-[36px] font-extrabold tracking-tight ${tier.popular ? "text-white" : "text-gray-900"}`}>{tier.price}</span>
                  <span className={`text-[14px] ${tier.popular ? "text-gray-400" : "text-gray-400"}`}>{tier.period}</span>
                </div>
                <div className="space-y-2.5 mb-6">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5 text-[13px]">
                      <Check className={`h-3.5 w-3.5 shrink-0 ${tier.popular ? "text-blue-400" : "text-gray-400"}`} />
                      <span className={tier.popular ? "text-gray-300" : "text-gray-600"}>{f}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className={`w-full rounded-md h-10 text-[13px] font-semibold shadow-none ${tier.popular ? "bg-white text-gray-900 hover:bg-gray-100" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-0"}`}
                  onClick={() => navigate("/apply")}
                >
                  {tier.name === "Agency" ? "Contact Sales" : "Start Free Trial"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section className="py-24 sm:py-32 px-5 sm:px-8 bg-white" id="faq">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12">
            <p className="text-[12px] font-semibold text-blue-600 uppercase tracking-[0.12em] mb-3">FAQ</p>
            <h2 className="text-[32px] sm:text-[36px] font-bold leading-[1.12] tracking-tight text-gray-900">Common questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-1">
            {[
              { q: "Does it only answer calls?", a: "No. It answers the call, asks qualifying questions, scores the lead, sends your team an SMS, and books the appointment. All automatic." },
              { q: "Who is this for?", a: "HVAC, plumbing, roofing, solar, and general contractors. Also built for agencies that manage multiple contractor accounts." },
              { q: "Does it work nights and weekends?", a: "Yes. It runs 24/7. Nights, weekends, holidays. That's when most of your competitors miss calls." },
              { q: "Will my team know when someone calls?", a: "Yes. Hot leads trigger an instant text to your team. Every call is also logged in your dashboard with a full transcript." },
              { q: "Can it actually book appointments?", a: "Yes. It checks your calendar in real time and books the job on the spot. No phone tag. No back-and-forth." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-gray-200 rounded-lg px-5 data-[state=open]:bg-gray-50/50">
                <AccordionTrigger className="text-left font-medium text-gray-900 text-[14px] hover:no-underline py-4">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-gray-500 text-[14px] leading-relaxed pb-4">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* ── Final CTA ── */}
      <Section className="py-24 sm:py-32 px-5 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900 rounded-xl px-8 sm:px-16 py-16 sm:py-20">
            <div className="max-w-lg">
              <h2 className="text-[32px] sm:text-[40px] font-bold leading-[1.12] tracking-tight text-white mb-4">Your phone should never go unanswered again.</h2>
              <p className="text-gray-400 mb-8 text-[16px] leading-relaxed">Start today. No credit card required. Cancel anytime.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" onClick={() => navigate("/apply")} className="bg-white text-gray-900 hover:bg-gray-100 rounded-md px-6 h-11 text-[14px] font-semibold shadow-none">
                  Start Free Trial <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => scrollTo("demo")} className="rounded-md px-6 h-11 text-[14px] font-semibold border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white shadow-none">
                  Book a Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer className="py-10 px-5 sm:px-8 border-t border-gray-200/60">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Logo size="small" />
              <span className="font-semibold text-[14px] text-gray-900">ReceptionistAI<span className="text-gray-400 font-normal ml-0.5">Pro</span></span>
            </div>
            <div className="flex gap-6 text-[13px] text-gray-400">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
              <button onClick={() => navigate("/client/login")} className="hover:text-gray-900 transition-colors">Login</button>
              <a href="mailto:hello@receptionistai.pro" className="hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </div>
          <p className="mt-8 text-[12px] text-gray-300">© {new Date().getFullYear()} ReceptionistAI Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
