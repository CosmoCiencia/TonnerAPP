alter table public.profiles
add column if not exists cup_user_type text not null default 'public';

update public.profiles
set cup_user_type = 'public'
where cup_user_type is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_cup_user_type_check'
  ) then
    alter table public.profiles
    add constraint profiles_cup_user_type_check
    check (cup_user_type in ('public', 'internal', 'distributor'));
  end if;
end;
$$;

create or replace function public.resolve_cup_user_type(access_code text default null)
returns text
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  normalized_code text := nullif(btrim(coalesce(access_code, '')), '');
  internal_code text;
  distributor_code text;
begin
  if normalized_code is null then
    return 'public';
  end if;

  select decrypted_secret
  into internal_code
  from vault.decrypted_secrets
  where name = 'CUP_INTERNAL_ACCESS_CODE'
  limit 1;

  select decrypted_secret
  into distributor_code
  from vault.decrypted_secrets
  where name = 'CUP_DISTRIBUTOR_ACCESS_CODE'
  limit 1;

  if internal_code is not null and normalized_code = internal_code then
    return 'internal';
  end if;

  if distributor_code is not null and normalized_code = distributor_code then
    return 'distributor';
  end if;

  raise exception 'Código de acceso inválido.';
end;
$$;

create or replace function public.upsert_own_customer_profile(
  profile_full_name text,
  access_code text default null
)
returns table (
  id uuid,
  email text,
  full_name text,
  role text,
  cup_user_type text
)
language plpgsql
security definer
set search_path = public, auth, vault
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text := auth.jwt() ->> 'email';
  resolved_type text;
  profile_record public.profiles%rowtype;
begin
  if current_user_id is null then
    raise exception 'Usuario no autenticado.';
  end if;

  resolved_type := public.resolve_cup_user_type(access_code);

  insert into public.profiles as profile (
    id,
    email,
    full_name,
    role,
    cup_user_type
  )
  values (
    current_user_id,
    current_email,
    nullif(btrim(coalesce(profile_full_name, '')), ''),
    'customer',
    resolved_type
  )
  on conflict on constraint profiles_pkey do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role = 'customer'
  returning
    profile.*
  into profile_record;

  return query
  select
    profile_record.id,
    profile_record.email,
    profile_record.full_name,
    profile_record.role,
    profile_record.cup_user_type;
end;
$$;

drop policy if exists "users can create own customer profile" on public.profiles;
drop policy if exists "users can create own public customer profile" on public.profiles;
create policy "users can create own public customer profile"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and role = 'customer'
  and cup_user_type = 'public'
);

drop policy if exists "users can update own customer profile" on public.profiles;
drop policy if exists "users can update own customer profile data" on public.profiles;
create policy "users can update own customer profile data"
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
)
with check (
  id = auth.uid()
  and role = 'customer'
);

revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

grant execute on function public.resolve_cup_user_type(text) to authenticated;
grant execute on function public.upsert_own_customer_profile(text, text) to authenticated;

drop view if exists public.cup_ranking_view;

create view public.cup_ranking_view
with (security_invoker = false)
as
with current_profile as (
  select profiles.cup_user_type
  from public.profiles profiles
  where profiles.id = auth.uid()
),
participants as (
  select
    predictions.user_id,
    count(*)::integer as prediction_count
  from public.cup_predictions predictions
  inner join public.profiles profiles on profiles.id = predictions.user_id
  inner join current_profile on current_profile.cup_user_type = profiles.cup_user_type
  group by predictions.user_id
),
point_totals as (
  select
    points.user_id,
    coalesce(sum(points.points_awarded), 0)::integer as total_points,
    coalesce(sum(case when points.result_hit then 1 else 0 end), 0)::integer as exact_hits
  from public.cup_points points
  group by points.user_id
),
ranked as (
  select
    participants.user_id,
    profiles.cup_user_type,
    coalesce(
      case
        when btrim(coalesce(profiles.full_name, '')) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
          then null
        else nullif(btrim(coalesce(profiles.full_name, '')), '')
      end,
      nullif(split_part(coalesce(profiles.email, auth_users.email, ''), '@', 1), ''),
      'Participante'
    ) as display_name,
    coalesce(point_totals.total_points, 0)::integer as total_points,
    coalesce(point_totals.exact_hits, 0)::integer as exact_hits,
    participants.prediction_count
  from participants
  left join point_totals on point_totals.user_id = participants.user_id
  left join public.profiles profiles on profiles.id = participants.user_id
  left join auth.users auth_users on auth_users.id = participants.user_id
)
select
  row_number() over (
    order by
      ranked.total_points desc,
      ranked.exact_hits desc,
      ranked.prediction_count desc,
      ranked.display_name asc
  )::integer as position,
  ranked.user_id,
  ranked.display_name,
  ranked.cup_user_type,
  ranked.total_points,
  ranked.exact_hits,
  ranked.prediction_count
from ranked;

revoke all on public.cup_ranking_view from anon, authenticated;
grant select on public.cup_ranking_view to authenticated;
