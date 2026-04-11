
DROP POLICY "System can insert billing" ON public.billing_subscriptions;

CREATE POLICY "Admins can insert billing"
ON public.billing_subscriptions
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'client_admin'::app_role)
);
