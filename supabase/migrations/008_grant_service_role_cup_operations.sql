grant usage on schema public to service_role;

grant select, insert, update, delete
on public.cup_matches,
   public.cup_predictions,
   public.cup_points,
   public.cup_sync_logs
to service_role;

grant select on public.cup_ranking_view to service_role;
