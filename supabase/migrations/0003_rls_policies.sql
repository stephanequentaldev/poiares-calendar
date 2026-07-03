-- =========================================================
-- Migração 0003: Row Level Security completo
-- Nunca confiar apenas no frontend: todas as tabelas com
-- dados sensíveis ou de escrita pública têm RLS ativo.
-- =========================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.events enable row level security;
alter table public.event_gallery enable row level security;
alter table public.suggestions enable row level security;
alter table public.site_settings enable row level security;

-- ---------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Um utilizador nunca pode alterar a sua própria flag is_admin via API
-- (só é possível manualmente no painel do Supabase). Reforçado por trigger,
-- evitando qualquer recursão nas políticas de RLS.
create or replace function public.protect_is_admin_field()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin and not public.is_admin(auth.uid()) then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_is_admin
  before update on public.profiles
  for each row execute function public.protect_is_admin_field();

-- ---------------------------------------------------------
-- CATEGORIES — leitura pública, escrita apenas admin
-- ---------------------------------------------------------
create policy "categories_select_public"
  on public.categories for select
  using (true);

create policy "categories_admin_write"
  on public.categories for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------
-- SITE_SETTINGS — leitura pública, escrita apenas admin
-- ---------------------------------------------------------
create policy "settings_select_public"
  on public.site_settings for select
  using (true);

create policy "settings_admin_write"
  on public.site_settings for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------
-- EVENTS
-- ---------------------------------------------------------

-- Visitantes e utilizadores autenticados veem eventos aprovados,
-- terminados ou cancelados (histórico público); utilizadores veem
-- também os seus próprios eventos em qualquer estado; admins veem tudo.
create policy "events_select_public_approved"
  on public.events for select
  using (
    status in ('aprovado', 'terminado', 'cancelado')
    or created_by = auth.uid()
    or public.is_admin(auth.uid())
  );

-- Qualquer utilizador autenticado pode criar eventos, desde que
-- o campo created_by corresponda ao seu próprio id.
create policy "events_insert_authenticated"
  on public.events for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and (
      status = 'pendente'
      or public.is_admin(auth.uid())
    )
  );

-- Donos podem editar os seus próprios eventos; admins podem editar qualquer um.
create policy "events_update_own_or_admin"
  on public.events for update
  to authenticated
  using (created_by = auth.uid() or public.is_admin(auth.uid()))
  with check (created_by = auth.uid() or public.is_admin(auth.uid()));

-- Donos podem eliminar os seus próprios eventos; admins podem eliminar qualquer um.
create policy "events_delete_own_or_admin"
  on public.events for delete
  to authenticated
  using (created_by = auth.uid() or public.is_admin(auth.uid()));

-- ---------------------------------------------------------
-- EVENT_GALLERY
-- ---------------------------------------------------------
create policy "gallery_select_matches_event"
  on public.event_gallery for select
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and (
          e.status in ('aprovado', 'terminado', 'cancelado')
          or e.created_by = auth.uid()
          or public.is_admin(auth.uid())
        )
    )
  );

create policy "gallery_write_owner_or_admin"
  on public.event_gallery for all
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and (e.created_by = auth.uid() or public.is_admin(auth.uid()))
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and (e.created_by = auth.uid() or public.is_admin(auth.uid()))
    )
  );

-- ---------------------------------------------------------
-- SUGGESTIONS — qualquer pessoa (incluindo anónimos) pode
-- submeter; apenas administradores podem ler.
-- ---------------------------------------------------------
create policy "suggestions_insert_anyone"
  on public.suggestions for insert
  to anon, authenticated
  with check (char_length(message) between 5 and 3000);

create policy "suggestions_select_admin"
  on public.suggestions for select
  using (public.is_admin(auth.uid()));

create policy "suggestions_update_admin"
  on public.suggestions for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
