
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'client_admin', 'client_viewer');

-- Clients table
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Client settings
CREATE TABLE public.client_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE UNIQUE,
  business_name text,
  business_address text,
  business_phone text,
  business_hours jsonb DEFAULT '{}'::jsonb,
  service_zip_codes text[] DEFAULT '{}',
  logo_url text,
  primary_color text DEFAULT '#3b82f6',
  secondary_color text DEFAULT '#64748b',
  notification_preferences jsonb DEFAULT '{"sms_hot_leads": true, "email_hot_leads": true}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.client_settings ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_client_settings_updated_at
BEFORE UPDATE ON public.client_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles table (separate from profiles per security best practices)
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Add client_id to existing tables
ALTER TABLE public.leads ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.calls ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.appointments ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.escalations ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;

-- Security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_client_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT client_id FROM public.user_roles
  WHERE user_id = _user_id AND client_id IS NOT NULL
  LIMIT 1
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles: users see own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());

-- User roles: users see own roles, admins see all
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'client_admin'));

-- Clients: admins see all, client users see own
CREATE POLICY "Admins can view all clients" ON public.clients FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR id = public.get_user_client_id(auth.uid()));
CREATE POLICY "Admins can manage clients" ON public.clients FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Client settings: client users see/edit own
CREATE POLICY "Client users can view own settings" ON public.client_settings FOR SELECT
  USING (client_id = public.get_user_client_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Client admins can update own settings" ON public.client_settings FOR UPDATE
  USING (client_id = public.get_user_client_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert settings" ON public.client_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Leads: client users see only their client's leads (keep existing public policies for unauthenticated webhook access)
CREATE POLICY "Client users can view own leads" ON public.leads FOR SELECT
  USING (client_id = public.get_user_client_id(auth.uid()));
CREATE POLICY "Client users can update own leads" ON public.leads FOR UPDATE
  USING (client_id = public.get_user_client_id(auth.uid()));

-- Calls: client users see only their client's calls
CREATE POLICY "Client users can view own calls" ON public.calls FOR SELECT
  USING (client_id = public.get_user_client_id(auth.uid()));

-- Appointments: client users see only their client's appointments
CREATE POLICY "Client users can view own appointments" ON public.appointments FOR SELECT
  USING (client_id = public.get_user_client_id(auth.uid()));
CREATE POLICY "Client users can update own appointments" ON public.appointments FOR UPDATE
  USING (client_id = public.get_user_client_id(auth.uid()));

-- Escalations: client users see own
CREATE POLICY "Client users can view own escalations" ON public.escalations FOR SELECT
  USING (client_id = public.get_user_client_id(auth.uid()));

-- Client activity log
CREATE TABLE public.client_activity_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.client_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Client users can view own activity" ON public.client_activity_log FOR SELECT
  USING (client_id = public.get_user_client_id(auth.uid()) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert activity" ON public.client_activity_log FOR INSERT
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_activity_log;
