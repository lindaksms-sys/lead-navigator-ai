
ALTER TABLE public.appointments
ADD COLUMN calendly_event_id text,
ADD COLUMN calendly_invitee_uri text,
ADD COLUMN calendar_link text;

CREATE TABLE public.integrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL,
  access_token text,
  settings jsonb DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on integrations" ON public.integrations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on integrations" ON public.integrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on integrations" ON public.integrations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on integrations" ON public.integrations FOR DELETE USING (true);

CREATE TRIGGER update_integrations_updated_at
BEFORE UPDATE ON public.integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
