-- =========================================================
-- Migração 0002: funções e triggers
-- =========================================================

-- ---------------------------------------------------------
-- Função auxiliar: verifica se um utilizador é administrador
-- SECURITY DEFINER para poder ser usada dentro das políticas RLS
-- sem causar recursão infinita na tabela profiles.
-- ---------------------------------------------------------
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select is_admin from public.profiles where id = user_id),
    false
  );
$$;

-- ---------------------------------------------------------
-- Trigger: cria automaticamente um perfil quando um novo
-- utilizador se regista via Supabase Auth.
-- ---------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------
-- Trigger: mantém updated_at atualizado
-- ---------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------
-- Trigger: gera slug único a partir do título antes de inserir
-- ---------------------------------------------------------
create or replace function public.generate_event_slug()
returns trigger
language plpgsql
as $$
declare
  base_slug text;
  final_slug text;
  counter integer := 0;
begin
  base_slug := trim(both '-' from regexp_replace(
    lower(unaccent(new.title)), '[^a-z0-9]+', '-', 'g'
  ));
  final_slug := base_slug || '-' || to_char(new.event_date, 'yyyy-mm-dd');

  while exists (
    select 1 from public.events
    where slug = final_slug and id <> coalesce(new.id, uuid_nil())
  ) loop
    counter := counter + 1;
    final_slug := base_slug || '-' || to_char(new.event_date, 'yyyy-mm-dd') || '-' || counter;
  end loop;

  new.slug := final_slug;
  return new;
end;
$$;

create extension if not exists unaccent;

create trigger events_generate_slug
  before insert or update of title, event_date on public.events
  for each row execute function public.generate_event_slug();

-- ---------------------------------------------------------
-- Trigger: sempre que um evento JÁ APROVADO é editado por um
-- utilizador que NÃO é administrador, o estado volta para
-- 'pendente' automaticamente, exigindo nova aprovação.
-- ---------------------------------------------------------
create or replace function public.reset_status_on_edit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'aprovado'
     and not public.is_admin(auth.uid())
     and (
       new.title is distinct from old.title or
       new.location_name is distinct from old.location_name or
       new.address is distinct from old.address or
       new.event_date is distinct from old.event_date or
       new.end_date is distinct from old.end_date or
       new.start_time is distinct from old.start_time or
       new.end_time is distinct from old.end_time or
       new.poster_url is distinct from old.poster_url or
       new.description is distinct from old.description or
       new.category_id is distinct from old.category_id
     ) then
    new.status := 'pendente';
    new.rejection_reason := null;
  end if;
  return new;
end;
$$;

create trigger events_reset_status_on_edit
  before update on public.events
  for each row execute function public.reset_status_on_edit();

-- ---------------------------------------------------------
-- Função utilitária: marca eventos passados como 'terminado'
-- (a agendar via Supabase Cron / pg_cron, plano gratuito permite).
-- ---------------------------------------------------------
create or replace function public.mark_events_finished()
returns void
language sql
security definer
set search_path = public
as $$
  update public.events
  set status = 'terminado'
  where status = 'aprovado'
    and coalesce(end_date, event_date) < current_date;
$$;
