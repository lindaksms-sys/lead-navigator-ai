
-- Enums
CREATE TYPE public.service_type AS ENUM ('repair', 'maintenance', 'installation', 'emergency');
CREATE TYPE public.property_type AS ENUM ('single_family', 'condo', 'townhouse', 'commercial');
CREATE TYPE public.timeline_type AS ENUM ('emergency', 'today', 'this_week', 'this_month', 'planning');
CREATE TYPE public.budget_type AS ENUM ('under_500', '500_2000', '2000_5000', '5000_10000', 'over_10000', 'unknown');
CREATE TYPE public.lead_category AS ENUM ('Hot', 'Warm', 'Cold');
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'quoted', 'scheduled', 'won', 'lost', 'nurture');
CREATE TYPE public.call_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.escalation_reason AS ENUM ('complex_project', 'pricing_complaint', 'robot_question', 'language_barrier', 'other');

-- Leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  service_type public.service_type,
  property_type public.property_type,
  square_footage INTEGER,
  timeline public.timeline_type,
  budget public.budget_type,
  decision_maker BOOLEAN DEFAULT false,
  notes TEXT,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  category public.lead_category NOT NULL DEFAULT 'Cold',
  status public.lead_status NOT NULL DEFAULT 'new',
  source TEXT DEFAULT 'voice_ai',
  call_sid TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Calls table
CREATE TABLE public.calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_sid TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  transcript TEXT,
  direction public.call_direction,
  status TEXT,
  duration_seconds INTEGER,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  service_type TEXT,
  notes TEXT,
  status public.appointment_status NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Escalations table
CREATE TABLE public.escalations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_sid TEXT NOT NULL,
  reason public.escalation_reason NOT NULL,
  notes TEXT,
  handled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;

-- Public access policies (webhook/service access)
CREATE POLICY "Allow public read on leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert on leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on leads" ON public.leads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on leads" ON public.leads FOR DELETE USING (true);

CREATE POLICY "Allow public read on calls" ON public.calls FOR SELECT USING (true);
CREATE POLICY "Allow public insert on calls" ON public.calls FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on calls" ON public.calls FOR UPDATE USING (true);

CREATE POLICY "Allow public read on appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on appointments" ON public.appointments FOR UPDATE USING (true);

CREATE POLICY "Allow public read on escalations" ON public.escalations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on escalations" ON public.escalations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on escalations" ON public.escalations FOR UPDATE USING (true);

-- Indexes
CREATE INDEX idx_leads_category ON public.leads(category);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_leads_score ON public.leads(score);
CREATE INDEX idx_calls_lead_id ON public.calls(lead_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.escalations;
