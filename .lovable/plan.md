

## Marketing Landing Page for ReceptionistAI Pro

### Overview
Replace the current simple `Index.tsx` with a full marketing landing page. The page will be a single long-scroll page with all requested sections, using the blue primary (#3B82F6) color scheme while keeping the existing app routing intact.

### Implementation

**File: `src/pages/Index.tsx`** — Complete rewrite with these sections:

1. **Navbar** — Logo + nav links (Features, Pricing, FAQ, Login) + "Start Free Trial" CTA button. Sticky on scroll.

2. **Hero** — Split layout. Left: headline, subhead, two CTA buttons. Right: stylized dashboard mockup built with divs/cards (no external images needed). Subtle fade-in animation.

3. **Problem Section** — Stat headline "35% of Calls Missed", three pain-point cards with lucide icons (PhoneOff, Star, TrendingDown).

4. **Solution Section** — Three feature cards with icons (Zap, ClipboardCheck, CalendarCheck).

5. **How It Works** — Three numbered steps with connecting visual flow. Icons + descriptions.

6. **Social Proof** — "Trusted by 50+ contractors" + three testimonial cards with star ratings + overall 4.9/5 rating.

7. **Features Grid** — 3x2 grid of feature cards with icons (Phone, BarChart3, Calendar, MessageSquare, FileText, LayoutDashboard).

8. **Pricing** — Three tier cards. Professional tier highlighted with "Most Popular" badge. Setup fee note + guarantee badge below.

9. **FAQ** — Six questions using shadcn Accordion component.

10. **CTA Section** — Dark blue background, headline, email input + button, "schedule a call" link.

11. **Footer** — Logo, tagline, links (Privacy, Terms, Login, Contact), copyright.

**Color approach**: Use inline Tailwind classes with blue-500/600/700 for the landing page branding (#3B82F6 = blue-500), keeping the existing CSS variables untouched for the app sections.

**Responsive**: Mobile-first. Hero stacks vertically on mobile. Pricing cards stack. Features grid goes 1-col on mobile, 2-col on tablet.

**Animations**: Minimal — fade-in on scroll sections using intersection observer or simple CSS animations from tailwindcss-animate.

### Technical Details
- Single file change: `src/pages/Index.tsx`
- No database changes needed
- No new dependencies — uses existing shadcn components (Accordion, Button, Input, Badge, Card)
- Route stays at `/` as-is in App.tsx
- `/apply` link will be a placeholder href

