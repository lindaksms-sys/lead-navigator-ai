
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on settings" ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on settings" ON public.settings FOR UPDATE USING (true);

CREATE TABLE public.sms_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  phone_sent_to text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  twilio_sid text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on sms_logs" ON public.sms_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on sms_logs" ON public.sms_logs FOR INSERT WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sms_logs;
