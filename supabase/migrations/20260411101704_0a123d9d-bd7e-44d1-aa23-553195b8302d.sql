
-- Create billing subscriptions table
CREATE TABLE public.billing_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  payment_provider text NOT NULL DEFAULT 'paypal',
  provider_customer_id text,
  provider_subscription_id text,
  plan_id text NOT NULL DEFAULT 'starter',
  subscription_status text NOT NULL DEFAULT 'trialing',
  trial_end timestamp with time zone,
  current_period_start timestamp with time zone DEFAULT now(),
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  usage_minutes_current_period integer NOT NULL DEFAULT 0,
  usage_reset_at timestamp with time zone,
  billing_email text,
  last_payment_status text,
  max_locations integer NOT NULL DEFAULT 1,
  max_minutes integer NOT NULL DEFAULT 500,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(client_id)
);

-- Enable RLS
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

-- Client users can view their own billing
CREATE POLICY "Client users can view own billing"
ON public.billing_subscriptions
FOR SELECT
USING (
  client_id = get_user_client_id(auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Client admins can update billing email
CREATE POLICY "Client admins can update own billing"
ON public.billing_subscriptions
FOR UPDATE
USING (
  client_id = get_user_client_id(auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- System/admins can insert billing records
CREATE POLICY "System can insert billing"
ON public.billing_subscriptions
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR true
);

-- Timestamp trigger
CREATE TRIGGER update_billing_subscriptions_updated_at
BEFORE UPDATE ON public.billing_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
