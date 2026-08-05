-- Contenido administrable de TonnerApp.
-- La app publicada solo lee registros activos; Tonner Manager escribe con un
-- usuario autenticado cuyo perfil tenga rol admin o internal.

create or replace function public.is_tonner_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'internal')
  );
$$;

revoke all on function public.is_tonner_manager() from public;
grant execute on function public.is_tonner_manager() to anon, authenticated;

create table if not exists public.tonner_catalog_products (
  id text primary key,
  name text not null,
  line text not null,
  category text,
  subline text,
  segment text,
  description text not null default '',
  short_description text,
  attributes jsonb not null default '[]'::jsonb,
  characteristics jsonb not null default '[]'::jsonb,
  uses jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  presentations jsonb not null default '[]'::jsonb,
  image_url text,
  datasheet_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tonner_catalog_colors (
  id text primary key,
  name text not null,
  code text not null default '',
  hex text not null,
  line text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tonner_catalog_distributors (
  id text primary key,
  name text not null,
  address text not null default '',
  phone text not null default '',
  city text not null default '',
  email text not null default '',
  lat double precision,
  lng double precision,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tonner_app_content (
  id text primary key default 'default',
  payload jsonb not null default '{}'::jsonb,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_tonner_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tonner_catalog_products_updated_at on public.tonner_catalog_products;
create trigger tonner_catalog_products_updated_at
before update on public.tonner_catalog_products
for each row execute function public.set_tonner_updated_at();

drop trigger if exists tonner_catalog_colors_updated_at on public.tonner_catalog_colors;
create trigger tonner_catalog_colors_updated_at
before update on public.tonner_catalog_colors
for each row execute function public.set_tonner_updated_at();

drop trigger if exists tonner_catalog_distributors_updated_at on public.tonner_catalog_distributors;
create trigger tonner_catalog_distributors_updated_at
before update on public.tonner_catalog_distributors
for each row execute function public.set_tonner_updated_at();

drop trigger if exists tonner_app_content_updated_at on public.tonner_app_content;
create trigger tonner_app_content_updated_at
before update on public.tonner_app_content
for each row execute function public.set_tonner_updated_at();

create index if not exists tonner_catalog_products_active_order_idx
  on public.tonner_catalog_products (is_active, sort_order, name);

create index if not exists tonner_catalog_products_line_idx
  on public.tonner_catalog_products (line, is_active, sort_order);

create index if not exists tonner_catalog_colors_active_order_idx
  on public.tonner_catalog_colors (is_active, sort_order, name);

create index if not exists tonner_catalog_distributors_active_order_idx
  on public.tonner_catalog_distributors (is_active, sort_order, name);

grant usage on schema public to anon, authenticated;
grant select on
  public.tonner_catalog_products,
  public.tonner_catalog_colors,
  public.tonner_catalog_distributors,
  public.tonner_app_content
to anon, authenticated;

grant insert, update, delete on
  public.tonner_catalog_products,
  public.tonner_catalog_colors,
  public.tonner_catalog_distributors,
  public.tonner_app_content
to authenticated;

alter table public.tonner_catalog_products enable row level security;
alter table public.tonner_catalog_colors enable row level security;
alter table public.tonner_catalog_distributors enable row level security;
alter table public.tonner_app_content enable row level security;

drop policy if exists "public can read active tonner products" on public.tonner_catalog_products;
create policy "public can read active tonner products"
on public.tonner_catalog_products
for select
to anon, authenticated
using (is_active = true or public.is_tonner_manager());

drop policy if exists "tonner managers can write products" on public.tonner_catalog_products;
create policy "tonner managers can write products"
on public.tonner_catalog_products
for all
to authenticated
using (public.is_tonner_manager())
with check (public.is_tonner_manager());

drop policy if exists "public can read active tonner colors" on public.tonner_catalog_colors;
create policy "public can read active tonner colors"
on public.tonner_catalog_colors
for select
to anon, authenticated
using (is_active = true or public.is_tonner_manager());

drop policy if exists "tonner managers can write colors" on public.tonner_catalog_colors;
create policy "tonner managers can write colors"
on public.tonner_catalog_colors
for all
to authenticated
using (public.is_tonner_manager())
with check (public.is_tonner_manager());

drop policy if exists "public can read active tonner distributors" on public.tonner_catalog_distributors;
create policy "public can read active tonner distributors"
on public.tonner_catalog_distributors
for select
to anon, authenticated
using (is_active = true or public.is_tonner_manager());

drop policy if exists "tonner managers can write distributors" on public.tonner_catalog_distributors;
create policy "tonner managers can write distributors"
on public.tonner_catalog_distributors
for all
to authenticated
using (public.is_tonner_manager())
with check (public.is_tonner_manager());

drop policy if exists "public can read tonner app content" on public.tonner_app_content;
create policy "public can read tonner app content"
on public.tonner_app_content
for select
to anon, authenticated
using (id = 'default' or public.is_tonner_manager());

drop policy if exists "tonner managers can write app content" on public.tonner_app_content;
create policy "tonner managers can write app content"
on public.tonner_app_content
for all
to authenticated
using (public.is_tonner_manager())
with check (public.is_tonner_manager());

-- Imágenes administradas desde Tonner Manager.
insert into storage.buckets (id, name, public)
values ('tonner-media', 'tonner-media', true)
on conflict (id) do update set public = true;

drop policy if exists "public can read tonner media" on storage.objects;
create policy "public can read tonner media"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'tonner-media');

drop policy if exists "tonner managers can upload media" on storage.objects;
create policy "tonner managers can upload media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'tonner-media' and public.is_tonner_manager());

drop policy if exists "tonner managers can update media" on storage.objects;
create policy "tonner managers can update media"
on storage.objects
for update
to authenticated
using (bucket_id = 'tonner-media' and public.is_tonner_manager())
with check (bucket_id = 'tonner-media' and public.is_tonner_manager());

drop policy if exists "tonner managers can delete media" on storage.objects;
create policy "tonner managers can delete media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'tonner-media' and public.is_tonner_manager());
