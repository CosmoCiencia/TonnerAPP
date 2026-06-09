do $$
begin
  if exists (select 1 from cron.job where jobname = 'tonnercup-sync-standard') then
    perform cron.unschedule('tonnercup-sync-standard');
  end if;
end;
$$;

select cron.schedule(
  'tonnercup-sync-standard',
  '17 */6 * * *',
  $$
  select net.http_post(
    url := 'https://zwyvdhextasmpomyykce.supabase.co/functions/v1/sync-cup-fixtures',
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'x-tonner-sync-secret', (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'SYNC_CUP_SECRET'
        limit 1
      )
    ),
    body := jsonb_build_object(
      'mode', 'standard',
      'targets', jsonb_build_array(
        jsonb_build_object('league', 1, 'season', 2026)
      )
    )
  );
  $$
);
