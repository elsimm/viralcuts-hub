
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
ALTER TABLE public.packs ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;
