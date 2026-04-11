
-- Create event_logs table
CREATE TABLE public.event_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  call_id uuid REFERENCES public.calls(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'system',
  status text NOT NULL DEFAULT 'success',
  title text NOT NULL,
  message text,
  payload jsonb,
  actor_role text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_event_logs_client_id ON public.event_logs(client_id);
CREATE INDEX idx_event_logs_event_type ON public.event_logs(event_type);
CREATE INDEX idx_event_logs_status ON public.event_logs(status);
CREATE INDEX idx_event_logs_created_at ON public.event_logs(created_at DESC);
CREATE INDEX idx_event_logs_source ON public.event_logs(source);

-- Enable RLS
ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

-- Service role / edge functions can insert
CREATE POLICY "Allow public insert on event_logs"
ON public.event_logs FOR INSERT
TO public
WITH CHECK (true);

-- Super admins see all
CREATE POLICY "Super admins can view all event logs"
ON public.event_logs FOR SELECT
TO public
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Client users see own tenant logs
CREATE POLICY "Client users can view own event logs"
ON public.event_logs FOR SELECT
TO public
USING (client_id = get_user_client_id(auth.uid()));
