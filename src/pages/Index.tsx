import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import {
  Phone, PhoneOff, Star, TrendingDown, Zap, ClipboardCheck, CalendarCheck,
  BarChart3, Calendar, MessageSquare, FileText, LayoutDashboard, Check,
  ArrowRight, Shield, Clock, Users, ChevronRight, Menu, X
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

function useInView(threshold = 0.15) {
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
    <section id={id} ref={ref} className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </section>
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

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-500 flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">ReceptionistAI Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo("features")} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Features</button>
            <button onClick={() => scrollTo("pricing")} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Pricing</button>
            <button onClick={() => scrollTo("faq")} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">FAQ</button>
            <button onClick={() => navigate("/client/login")} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Login</button>
            <Button onClick={() => navigate("/apply")} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6">Start Free Trial</Button>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-white border-t px-4 py-4 space-y-3">
            <button onClick={() => scrollTo("features")} className="block w-full text-left text-sm py-2">Features</button>
            <button onClick={() => scrollTo("pricing")} className="block w-full text-left text-sm py-2">Pricing</button>
            <button onClick={() => scrollTo("faq")} className="block w-full text-left text-sm py-2">FAQ</button>
            <button onClick={() => { navigate("/client/login"); setMobileMenu(false); }} className="block w-full text-left text-sm py-2">Login</button>
            <Button onClick={() => navigate("/apply")} className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full">Start Free Trial</Button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-16 sm:pt-36 sm:pb-24 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-50">🚀 AI-Powered Receptionist</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
              Never Miss a Call.<br />
              <span className="text-blue-500">Never Lose a Lead.</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-lg">
              AI receptionists that answer 24/7, qualify leads, and book appointments directly into your calendar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => scrollTo("demo")} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-8 text-base">
                Watch 2-Min Demo <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/apply")} className="rounded-full px-8 text-base border-gray-300">
                Start Free Trial
              </Button>
            </div>
            <div className="flex items-center gap-4 pt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Check className="h-4 w-4 text-green-500" /> No credit card</span>
              <span className="flex items-center gap-1"><Check className="h-4 w-4 text-green-500" /> Setup in 24h</span>
              <span className="flex items-center gap-1"><Check className="h-4 w-4 text-green-500" /> 14-day guarantee</span>
            </div>
          </div>
          {/* Dashboard Mockup */}
          <div className="relative hidden md:block">
            <div className="bg-gray-50 rounded-2xl border shadow-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-gray-400">ReceptionistAI Dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Hot Leads", value: "12", color: "text-red-500" },
                  { label: "Calls Today", value: "47", color: "text-blue-500" },
                  { label: "Booked", value: "8", color: "text-green-500" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl p-3 border">
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {["🔥 Hot Lead: John M. — HVAC Repair — Score 92", "📞 Incoming: Sarah K. — Solar Install", "✅ Booked: Mike R. — Tomorrow 2PM"].map((t) => (
                  <div key={t} className="bg-white rounded-lg p-3 border text-sm text-gray-700">{t}</div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-blue-500 text-white rounded-xl px-4 py-2 text-sm font-medium shadow-lg animate-bounce">
              +3 Hot Leads Today 🔥
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <Section className="py-16 sm:py-24 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold text-red-500 uppercase tracking-wide mb-2">The Problem</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">The Average Home Service Business <span className="text-red-500">Misses 35% of Calls</span></h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">Every missed call is a missed opportunity. Here's what it's costing you.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: PhoneOff, title: "Lost Revenue", desc: "$1,200 average job × 10 missed calls/week = $62,000/year in lost revenue", color: "text-red-500 bg-red-50" },
              { icon: Star, title: "Bad Reviews", desc: "\"They never answered\" — 68% of callers won't leave a voicemail, they'll call your competitor", color: "text-yellow-500 bg-yellow-50" },
              { icon: TrendingDown, title: "Competitor Wins", desc: "The first contractor to answer gets the job 78% of the time. Speed wins.", color: "text-orange-500 bg-orange-50" },
            ].map((p) => (
              <Card key={p.title} className="text-left border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className={`h-12 w-12 rounded-xl ${p.color} flex items-center justify-center mb-4`}>
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-600">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Solution */}
      <Section className="py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-500 uppercase tracking-wide mb-2">The Solution</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Your AI Receptionist Works <span className="text-blue-500">24/7</span></h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">Never miss another call. Your AI answers instantly, qualifies every lead, and books appointments automatically.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Answers Instantly", desc: "Picks up in under 2 seconds. Professional, friendly, and always on-brand." },
              { icon: ClipboardCheck, title: "Qualifies Leads", desc: "Asks the right questions: service needed, timeline, budget, property type." },
              { icon: CalendarCheck, title: "Books Appointments", desc: "Checks your real-time availability and books directly into your calendar." },
            ].map((s) => (
              <Card key={s.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4">
                    <s.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section className="py-16 sm:py-24 bg-gray-50 px-4" id="demo">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-500 uppercase tracking-wide mb-2">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-12">Three Steps to Never Missing a Lead</h2>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            {[
              { step: "1", icon: Phone, title: "Customer Calls", desc: "AI answers in under 2 seconds with a professional, customized greeting." },
              { step: "2", icon: ClipboardCheck, title: "AI Qualifies", desc: "Asks 5 key questions. Scores the lead as Hot, Warm, or Cold automatically." },
              { step: "3", icon: MessageSquare, title: "You Get Notified", desc: "Hot leads = instant SMS alert. Booked = calendar invite. All logged." },
            ].map((s) => (
              <div key={s.step} className="relative flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
                  {s.step}
                </div>
                <s.icon className="h-6 w-6 text-blue-500 mb-3" />
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 max-w-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Social Proof */}
      <Section className="py-16 sm:py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
            <span className="ml-2 font-semibold">4.9/5</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">Trusted by <span className="text-blue-500">50+ Contractors</span></h2>
          <p className="text-gray-600 mb-12">See why home service businesses love ReceptionistAI Pro</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: "Mike Rodriguez", co: "Rodriguez HVAC", quote: "We went from missing 40% of calls to capturing every single one. Revenue jumped 35% in the first month." },
              { name: "Sarah Chen", co: "SunPower Solar Co.", quote: "The AI sounds so natural, customers don't even realize. And the lead scoring is incredibly accurate." },
              { name: "James Wilson", co: "Wilson Plumbing", quote: "Setup took 20 minutes. Now I get SMS alerts for hot leads and appointments auto-book. Game changer." },
            ].map((t) => (
              <Card key={t.name} className="text-left border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div>
                  <p className="text-sm text-gray-700 mb-4 italic">"{t.quote}"</p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.co}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Features Grid */}
      <Section className="py-16 sm:py-24 bg-gray-50 px-4" id="features">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-500 uppercase tracking-wide mb-2">Features</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-12">Everything You Need to Capture Every Lead</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Phone, title: "24/7 Call Answering", desc: "Never miss a call again. AI answers every call instantly, day or night." },
              { icon: BarChart3, title: "Smart Lead Scoring", desc: "BANT-based scoring: Budget, Authority, Need, Timeline. Scored 0-100." },
              { icon: Calendar, title: "Calendly Integration", desc: "Real-time availability checks and one-click appointment booking." },
              { icon: MessageSquare, title: "Instant SMS Alerts", desc: "Hot lead? Get an SMS within seconds with all the details you need." },
              { icon: FileText, title: "Call Transcripts", desc: "Every call recorded and transcribed. Review conversations anytime." },
              { icon: LayoutDashboard, title: "Real-time Dashboard", desc: "Live Kanban board, analytics, and lead management in one place." },
            ].map((f) => (
              <Card key={f.title} className="text-left border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Pricing */}
      <Section className="py-16 sm:py-24 px-4" id="pricing">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold text-blue-500 uppercase tracking-wide mb-2">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 mb-12">All plans include a 14-day money-back guarantee</p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Starter", price: "$600", period: "/mo", popular: false,
                features: ["1 location", "500 minutes/month", "Basic CRM", "Lead scoring", "Email support", "SMS alerts"],
              },
              {
                name: "Professional", price: "$1,200", period: "/mo", popular: true,
                features: ["3 locations", "2,000 minutes/month", "Advanced CRM", "Lead scoring + automation", "Priority support", "SMS + email alerts", "Calendly integration", "Custom greeting"],
              },
              {
                name: "Enterprise", price: "Custom", period: "", popular: false,
                features: ["Unlimited locations", "Unlimited minutes", "White-label", "API access", "Dedicated account manager", "Custom integrations", "SLA guarantee", "Training included"],
              },
            ].map((tier) => (
              <Card key={tier.name} className={`text-left relative overflow-hidden ${tier.popular ? "border-2 border-blue-500 shadow-xl scale-[1.02]" : "border shadow-md"}`}>
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">Most Popular</div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-extrabold">{tier.price}</span>
                    <span className="text-gray-500">{tier.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-blue-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                  <Button
                    className={`w-full mt-4 rounded-full ${tier.popular ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}`}
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => navigate("/apply")}
                  >
                    {tier.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-8">All plans include a one-time $1,500 setup fee · 14-day money-back guarantee</p>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="py-16 sm:py-24 bg-gray-50 px-4" id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-500 uppercase tracking-wide mb-2">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              { q: "How does the AI know my business info?", a: "During onboarding, we customize the AI with your business name, services, pricing, service area, and FAQs. The AI sounds like a trained receptionist who knows your business inside and out." },
              { q: "What if the AI can't answer a question?", a: "The AI gracefully escalates to a human. It collects the caller's info, explains a team member will call back, and sends you an immediate notification with the details." },
              { q: "How long does setup take?", a: "Most businesses are live within 24 hours. We handle the phone number setup, AI training, and integration configuration. You just review and approve." },
              { q: "Can I listen to call recordings?", a: "Yes! Every call is recorded and transcribed. You can listen to recordings and read transcripts directly from your dashboard." },
              { q: "What phone number do I use?", a: "We provide a dedicated local or toll-free number, or you can forward your existing business number to your AI receptionist. Callers won't notice any difference." },
              { q: "How do I receive my leads?", a: "Hot leads trigger instant SMS alerts. All leads appear in your real-time dashboard with scores, call transcripts, and recommended actions. You can also get daily email summaries." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-lg border px-4">
                <AccordionTrigger className="text-left font-medium">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      {/* CTA */}
      <Section className="py-16 sm:py-24 px-4 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Stop Losing Leads?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join 50+ home service businesses capturing every call and converting more leads.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input placeholder="Enter your email" className="rounded-full bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus-visible:ring-white" />
            <Button className="bg-white text-blue-600 hover:bg-blue-50 rounded-full px-8 whitespace-nowrap font-semibold">
              Get Started <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <button onClick={() => scrollTo("demo")} className="mt-4 text-sm text-blue-200 hover:text-white underline underline-offset-4 transition-colors">
            Or schedule a call →
          </button>
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">ReceptionistAI Pro</span>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <button onClick={() => navigate("/client/login")} className="hover:text-white transition-colors">Login</button>
              <a href="mailto:hello@receptionistai.pro" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>© 2024 ReceptionistAI Pro. All rights reserved.</p>
            <p className="mt-1 text-gray-500">AI-powered receptionist for home service businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
