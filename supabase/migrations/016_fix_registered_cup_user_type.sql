drop function if exists public.upsert_own_customer_profile(text, text);

create or replace function public.upsert_own_customer_profile(
  profile_full_name text,
  access_code text default null,
  requested_cup_user_type text default 'public'
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
  normalized_requested_type text := coalesce(nullif(btrim(requested_cup_user_type), ''), 'public');
  resolved_type text;
  profile_record public.profiles%rowtype;
begin
  if current_user_id is null then
    raise exception 'Usuario no autenticado.';
  end if;

  if normalized_requested_type not in ('public', 'internal', 'distributor') then
    raise exception 'Tipo de participante inválido.';
  end if;

  resolved_type := public.resolve_cup_user_type(access_code);

  if resolved_type <> normalized_requested_type then
    raise exception 'El código de acceso no corresponde al tipo de participante seleccionado.';
  end if;

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
    role = 'customer',
    cup_user_type = excluded.cup_user_type
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

grant execute on function public.upsert_own_customer_profile(text, text, text) to authenticated;
