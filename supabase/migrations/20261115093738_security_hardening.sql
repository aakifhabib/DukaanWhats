-- Route anonymous checkout through the server endpoint so it can apply request
-- size/origin/abuse checks before the privileged order function runs.
revoke all on function public.create_store_order(text, text, text, text, text, text, text, jsonb, text, text)
  from public, anon, authenticated;
grant execute on function public.create_store_order(text, text, text, text, text, text, text, jsonb, text, text)
  to service_role;

-- Product images are public to read, but uploads are private to each owner's
-- UID-scoped path. Enforce type and size limits at Storage as well as in the UI.
update storage.buckets
   set file_size_limit = 5242880,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
 where id = 'product-images';
