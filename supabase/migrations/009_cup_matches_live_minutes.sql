alter table public.cup_matches
add column if not exists elapsed_minutes integer
check (elapsed_minutes is null or elapsed_minutes >= 0);

alter table public.cup_matches
add column if not exists extra_minutes integer
check (extra_minutes is null or extra_minutes >= 0);

update public.cup_matches
set
  elapsed_minutes = nullif(raw #>> '{fixture,status,elapsed}', '')::integer,
  extra_minutes = nullif(raw #>> '{fixture,status,extra}', '')::integer
where raw #> '{fixture,status}' is not null
  and (
    raw #>> '{fixture,status,elapsed}' is not null
    or raw #>> '{fixture,status,extra}' is not null
  );
