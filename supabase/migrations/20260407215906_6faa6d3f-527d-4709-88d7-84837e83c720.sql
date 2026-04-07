
CREATE TABLE public.agency_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'starter',
  amount INTEGER NOT NULL DEFAULT 60000,
  status TEXT NOT NULL DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agency_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view all subscriptions"
ON public.agency_subscriptions FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage subscriptions"
ON public.agency_subscriptions FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.admin_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_agency_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view activity log"
ON public.admin_activity_log FOR SELECT
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert activity log"
ON public.admin_activity_log FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_agency_subscriptions_updated_at
BEFORE UPDATE ON public.agency_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
