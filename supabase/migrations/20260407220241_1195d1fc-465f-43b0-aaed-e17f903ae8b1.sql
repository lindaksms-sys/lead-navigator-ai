
-- Add new columns to client_settings
ALTER TABLE public.client_settings
  ADD COLUMN IF NOT EXISTS service_address TEXT,
  ADD COLUMN IF NOT EXISTS service_radius_miles INTEGER DEFAULT 25,
  ADD COLUMN IF NOT EXISTS quiet_hours_start TEXT DEFAULT '22:00',
  ADD COLUMN IF NOT EXISTS quiet_hours_end TEXT DEFAULT '07:00',
  ADD COLUMN IF NOT EXISTS quiet_hours_days TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS escalation_timeout_minutes INTEGER DEFAULT 15,
  ADD COLUMN IF NOT EXISTS escalation_manager_phone TEXT;

-- Allow client_admins to insert their own settings
CREATE POLICY "Client admins can insert own settings"
ON public.client_settings FOR INSERT
WITH CHECK (client_id = get_user_client_id(auth.uid()));
