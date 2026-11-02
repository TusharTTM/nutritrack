-- Give the verified NutriTrack owner account read-only access to Community
-- profiles, requests, and the daily summaries currently retained in Supabase.
-- This does not upload device-only meal logs or restore summaries removed when
-- a user disabled sharing.

create or replace function public.assign_nutritrack_admin_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(coalesce(new.email, '')) = 'tusharttm@gmail.com'
    and new.email_confirmed_at is not null then
    new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('nutritrack_role', 'admin');
    new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb)
      || jsonb_build_object('display_name', 'Tushar');
  elsif lower(coalesce(new.email, '')) = 'tusharttm@gmail.com'
    or (tg_op = 'UPDATE'
      and lower(coalesce(old.email, '')) = 'tusharttm@gmail.com') then
    new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb)
      - 'nutritrack_role';
  end if;

  return new;
end;
$$;

drop trigger if exists sync_nutritrack_admin_metadata on auth.users;
create trigger sync_nutritrack_admin_metadata
  before insert or update of email, email_confirmed_at on auth.users
  for each row execute function public.assign_nutritrack_admin_metadata();

revoke all on function public.assign_nutritrack_admin_metadata()
  from public, anon, authenticated;

drop policy if exists "Users can read own and accepted profiles"
  on public.community_profiles;
create policy "Users can read own and accepted profiles"
  on public.community_profiles for select to authenticated
  using (
    (select auth.jwt()) -> 'app_metadata' ->> 'nutritrack_role' = 'admin'
    or user_id = (select auth.uid())
    or exists (
      select 1
      from public.community_requests as request
      where request.status = 'accepted'
        and (
          (request.requester_id = (select auth.uid()) and request.recipient_id = community_profiles.user_id)
          or
          (request.recipient_id = (select auth.uid()) and request.requester_id = community_profiles.user_id)
        )
    )
  );

drop policy if exists "Request parties can read requests"
  on public.community_requests;
create policy "Request parties can read requests"
  on public.community_requests for select to authenticated
  using (
    (select auth.jwt()) -> 'app_metadata' ->> 'nutritrack_role' = 'admin'
    or requester_id = (select auth.uid())
    or recipient_id = (select auth.uid())
  );

drop policy if exists "Own or shared recent summaries are visible"
  on public.community_daily_reports;
create policy "Own or shared recent summaries are visible"
  on public.community_daily_reports for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select auth.jwt()) -> 'app_metadata' ->> 'nutritrack_role' = 'admin'
    or (
      report_date between current_date - 29 and current_date
      and exists (
        select 1
        from public.community_profiles as owner
        where owner.user_id = community_daily_reports.user_id
          and owner.share_reports
      )
      and exists (
        select 1
        from public.community_requests as request
        where request.status = 'accepted'
          and (
            (request.requester_id = (select auth.uid()) and request.recipient_id = community_daily_reports.user_id)
            or
            (request.recipient_id = (select auth.uid()) and request.requester_id = community_daily_reports.user_id)
          )
      )
    )
  );
