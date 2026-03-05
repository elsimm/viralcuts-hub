
CREATE TABLE public.user_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  username text NOT NULL,
  password_plain text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view credentials"
ON public.user_credentials FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can insert credentials"
ON public.user_credentials FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can delete credentials"
ON public.user_credentials FOR DELETE TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can update credentials"
ON public.user_credentials FOR UPDATE TO authenticated
USING (public.is_admin());
