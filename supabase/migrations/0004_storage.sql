-- =========================================================
-- Migração 0004: Supabase Storage — buckets e políticas
-- =========================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('logos', 'logos', true, 5242880, array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('event-images', 'event-images', true, 8388608, array['image/png','image/jpeg','image/webp']),
  ('gallery', 'gallery', true, 8388608, array['image/png','image/jpeg','image/webp']),
  ('avatars', 'avatars', true, 3145728, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

-- ---------------------------------------------------------
-- LOGOS: leitura pública; escrita apenas administradores.
-- Permite trocar o logótipo dos Bombeiros Voluntários sem alterar código.
-- ---------------------------------------------------------
create policy "logos_public_read"
  on storage.objects for select
  using (bucket_id = 'logos');

create policy "logos_admin_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'logos' and public.is_admin(auth.uid()));

create policy "logos_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'logos' and public.is_admin(auth.uid()));

create policy "logos_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'logos' and public.is_admin(auth.uid()));

-- ---------------------------------------------------------
-- EVENT-IMAGES (cartaz principal): leitura pública; upload por
-- qualquer utilizador autenticado na sua própria pasta (uid/...).
-- ---------------------------------------------------------
create policy "event_images_public_read"
  on storage.objects for select
  using (bucket_id = 'event-images');

create policy "event_images_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'event-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "event_images_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'event-images'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin(auth.uid()))
  );

create policy "event_images_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'event-images'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin(auth.uid()))
  );

-- ---------------------------------------------------------
-- GALLERY (imagens adicionais do evento): mesmas regras.
-- ---------------------------------------------------------
create policy "gallery_public_read"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "gallery_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'gallery'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "gallery_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'gallery'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin(auth.uid()))
  );

create policy "gallery_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gallery'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin(auth.uid()))
  );

-- ---------------------------------------------------------
-- AVATARS: leitura pública; cada utilizador só escreve na sua pasta.
-- ---------------------------------------------------------
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
