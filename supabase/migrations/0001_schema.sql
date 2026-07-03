-- =========================================================
-- Calendário Municipal de Vila Nova de Poiares
-- Migração 0001: esquema base (tabelas, tipos, índices)
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- pesquisa de texto livre com índice

-- ---------------------------------------------------------
-- Tipos enumerados
-- ---------------------------------------------------------
create type public.event_status as enum (
  'pendente',
  'aprovado',
  'rejeitado',
  'cancelado',
  'terminado'
);

-- ---------------------------------------------------------
-- Tabela: profiles
-- Espelha auth.users; guarda dados públicos + flag de admin
-- ---------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfis públicos dos utilizadores registados. is_admin é definido manualmente no Supabase.';

create index idx_profiles_is_admin on public.profiles (is_admin) where is_admin = true;

-- ---------------------------------------------------------
-- Tabela: categories
-- ---------------------------------------------------------
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  icon text not null default 'Tag',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Tabela: site_settings
-- Configurações editáveis sem alterar código (ex: logótipo)
-- ---------------------------------------------------------
create table public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------
-- Tabela: events
-- ---------------------------------------------------------
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null check (char_length(title) between 3 and 150),
  slug text not null,
  location_name text not null check (char_length(location_name) between 2 and 150),
  address text,
  event_date date not null,
  end_date date,
  start_time time not null,
  end_time time,
  poster_url text,
  description text check (char_length(description) <= 5000),
  category_id uuid not null references public.categories(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete cascade,
  status public.event_status not null default 'pendente',
  is_featured boolean not null default false,
  rejection_reason text,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint end_date_after_start check (end_date is null or end_date >= event_date),
  constraint end_time_after_start check (end_time is null or end_time > start_time)
);

comment on table public.events is 'Eventos submetidos ao calendário municipal.';

create index idx_events_status on public.events (status);
create index idx_events_date on public.events (event_date);
create index idx_events_category on public.events (category_id);
create index idx_events_created_by on public.events (created_by);
create index idx_events_featured on public.events (is_featured) where is_featured = true;
create index idx_events_status_date on public.events (status, event_date);
create unique index idx_events_slug on public.events (slug);
create index idx_events_title_trgm on public.events using gin (title gin_trgm_ops);
create index idx_events_location_trgm on public.events using gin (location_name gin_trgm_ops);

-- ---------------------------------------------------------
-- Tabela: event_gallery
-- ---------------------------------------------------------
create table public.event_gallery (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_gallery_event on public.event_gallery (event_id);

-- ---------------------------------------------------------
-- Tabela: suggestions (página Melhorias)
-- ---------------------------------------------------------
create table public.suggestions (
  id uuid primary key default uuid_generate_v4(),
  name text,
  email text,
  message text not null check (char_length(message) between 5 and 3000),
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

create index idx_suggestions_created on public.suggestions (created_at desc);

-- ---------------------------------------------------------
-- Categorias iniciais
-- ---------------------------------------------------------
insert into public.categories (name, slug, icon, sort_order) values
  ('Concerto', 'concerto', 'Music', 1),
  ('Festa Popular', 'festa-popular', 'PartyPopper', 2),
  ('Teatro', 'teatro', 'Drama', 3),
  ('Exposição', 'exposicao', 'Image', 4),
  ('Cinema', 'cinema', 'Film', 5),
  ('Desporto', 'desporto', 'Trophy', 6),
  ('Feira', 'feira', 'Store', 7),
  ('Mercado', 'mercado', 'ShoppingBasket', 8),
  ('Infantil', 'infantil', 'Baby', 9),
  ('Cultura', 'cultura', 'Landmark', 10),
  ('Religião', 'religiao', 'Church', 11),
  ('Outro', 'outro', 'Tag', 12);

insert into public.site_settings (key, value) values
  ('logo_url', null),
  ('site_name', 'Calendário Municipal de Vila Nova de Poiares'),
  ('contact_email', 'geral@cm-vilanovadepoiares.pt');
