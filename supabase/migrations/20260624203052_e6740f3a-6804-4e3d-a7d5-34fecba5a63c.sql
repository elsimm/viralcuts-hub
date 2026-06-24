
-- Add image_url to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url text;

-- Storage policies for category-images bucket
CREATE POLICY "Authenticated can view category images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'category-images');

CREATE POLICY "Admins can upload category images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'category-images' AND public.is_admin());

CREATE POLICY "Admins can update category images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'category-images' AND public.is_admin());

CREATE POLICY "Admins can delete category images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'category-images' AND public.is_admin());
