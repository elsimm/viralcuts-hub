
-- Create packs table
CREATE TABLE public.packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  clip_count integer NOT NULL DEFAULT 0,
  drive_link text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view packs
CREATE POLICY "Authenticated users can view packs"
ON public.packs FOR SELECT TO authenticated
USING (true);

-- Only admins can manage packs
CREATE POLICY "Only admins can insert packs"
ON public.packs FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update packs"
ON public.packs FOR UPDATE TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can delete packs"
ON public.packs FOR DELETE TO authenticated
USING (public.is_admin());

-- Update trigger
CREATE TRIGGER update_packs_updated_at
  BEFORE UPDATE ON public.packs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
