
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_downloads(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_downloads(UUID) TO authenticated;

DROP POLICY IF EXISTS "Public can view resource files" ON storage.objects;
CREATE POLICY "Public can read resource files" ON storage.objects FOR SELECT USING (bucket_id = 'resources');
