-- NutriTrack Community: private daily summaries for accepted connections only.
-- Apply once to a Supabase Free project. Never put a service-role key in the app.
create table if not exists public.community_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 60),
  share_reports boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.community_profiles
  add column if not exists share_reports boolean not null default false;

create table if not exists public.community_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_request_not_self check (requester_id <> recipient_id)
);

create unique index if not exists community_requests_unique_active_pair
  on public.community_requests (
    least(requester_id, recipient_id),
    greatest(requester_id, recipient_id)
  )
  where status in ('pending', 'accepted');

create index if not exists community_requests_recipient_status_idx
  on public.community_requests (recipient_id, status, created_at desc);

create table if not exists public.community_daily_reports (
  user_id uuid not null references auth.users(id) on delete cascade,
  report_date date not null,
  calories numeric(8, 2) not null default 0 check (calories >= 0),
  protein numeric(8, 2) not null default 0 check (protein >= 0),
  carbs numeric(8, 2) not null default 0 check (carbs >= 0),
  fat numeric(8, 2) not null default 0 check (fat >= 0),
  fiber numeric(8, 2) not null default 0 check (fiber >= 0),
  water numeric(8, 2) not null default 0 check (water >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, report_date)
);

create index if not exists community_daily_reports_date_idx
  on public.community_daily_reports (user_id, report_date desc);

alter table public.community_profiles enable row level security;
alter table public.community_requests enable row level security;
alter table public.community_daily_reports enable row level security;

revoke all on public.community_profiles from anon, authenticated;
revoke all on public.community_requests from anon, authenticated;
revoke all on public.community_daily_reports from anon, authenticated;

grant select, update on public.community_profiles to authenticated;
grant select, insert on public.community_requests to authenticated;
grant select, insert, update, delete on public.community_daily_reports to authenticated;

drop policy if exists "Users can read own and accepted profiles" on public.community_profiles;
create policy "Users can read own and accepted profiles"
  on public.community_profiles for select to authenticated
  using (
    user_id = (select auth.uid())
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

drop policy if exists "Users can update own community profile" on public.community_profiles;
create policy "Users can update own community profile"
  on public.community_profiles for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Request parties can read requests" on public.community_requests;
create policy "Request parties can read requests"
  on public.community_requests for select to authenticated
  using (
    requester_id = (select auth.uid())
    or recipient_id = (select auth.uid())
  );

drop policy if exists "Users can send a request" on public.community_requests;
create policy "Users can send a request"
  on public.community_requests for insert to authenticated
  with check (
    requester_id = (select auth.uid())
    and recipient_id <> (select auth.uid())
    and status = 'pending'
  );

drop policy if exists "Own or shared recent summaries are visible" on public.community_daily_reports;
create policy "Own or shared recent summaries are visible"
  on public.community_daily_reports for select to authenticated
  using (
    report_date between current_date - 29 and current_date
    and (
      user_id = (select auth.uid())
      or (
        exists (
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
    )
  );

drop policy if exists "Users can publish own recent reports" on public.community_daily_reports;
create policy "Users can publish own recent reports"
  on public.community_daily_reports for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and report_date between current_date - 29 and current_date
  );

drop policy if exists "Users can update own recent reports" on public.community_daily_reports;
create policy "Users can update own recent reports"
  on public.community_daily_reports for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and report_date between current_date - 29 and current_date
  );

drop policy if exists "Users can delete own reports" on public.community_daily_reports;
create policy "Users can delete own reports"
  on public.community_daily_reports for delete to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.handle_new_community_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
begin
  profile_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Member'
  );

  insert into public.community_profiles (user_id, display_name)
  values (
    new.id,
    case when char_length(left(profile_name, 60)) < 2 then 'Member' else left(profile_name, 60) end
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_community_profile on auth.users;
create trigger on_auth_user_created_community_profile
  after insert on auth.users
  for each row execute procedure public.handle_new_community_profile();

create or replace function public.search_community_profiles(search_name text)
returns table (user_id uuid, display_name text, member_code text)
language sql
stable
security definer
set search_path = ''
as $$
  select
    profile.user_id,
    profile.display_name,
    right(replace(profile.user_id::text, '-', ''), 6)
  from public.community_profiles as profile
  where (select auth.uid()) is not null
    and char_length(trim(search_name)) between 2 and 60
    and profile.user_id <> (select auth.uid())
    and lower(trim(profile.display_name)) = lower(trim(search_name))
  order by profile.display_name
  limit 10;
$$;

create or replace function public.get_my_community_requests()
returns table (
  request_id uuid,
  requester_id uuid,
  recipient_id uuid,
  status text,
  created_at timestamptz,
  requester_name text,
  requester_code text,
  recipient_name text,
  recipient_code text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    request.id,
    request.requester_id,
    request.recipient_id,
    request.status,
    request.created_at,
    requester.display_name,
    right(replace(requester.user_id::text, '-', ''), 6),
    recipient.display_name,
    right(replace(recipient.user_id::text, '-', ''), 6)
  from public.community_requests as request
  join public.community_profiles as requester on requester.user_id = request.requester_id
  join public.community_profiles as recipient on recipient.user_id = request.recipient_id
  where (select auth.uid()) is not null
    and (
      request.requester_id = (select auth.uid())
      or request.recipient_id = (select auth.uid())
    )
  order by request.created_at desc;
$$;

create or replace function public.respond_to_community_request(p_request_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.community_requests
  set status = case when p_accept then 'accepted' else 'rejected' end,
      updated_at = now()
  where id = p_request_id
    and recipient_id = (select auth.uid())
    and status = 'pending';

  if not found then
    raise exception 'Request is no longer pending or does not belong to this user.';
  end if;
end;
$$;

create or replace function public.remove_community_member(p_member_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.community_requests
  where status = 'accepted'
    and (
      (requester_id = (select auth.uid()) and recipient_id = p_member_id)
      or
      (recipient_id = (select auth.uid()) and requester_id = p_member_id)
    );

  if not found then
    raise exception 'Accepted group member not found.';
  end if;
end;
$$;

revoke all on function public.handle_new_community_profile() from public, anon, authenticated;
revoke all on function public.search_community_profiles(text) from public, anon;
revoke all on function public.get_my_community_requests() from public, anon;
revoke all on function public.respond_to_community_request(uuid, boolean) from public, anon;
revoke all on function public.remove_community_member(uuid) from public, anon;

grant execute on function public.search_community_profiles(text) to authenticated;
grant execute on function public.get_my_community_requests() to authenticated;
grant execute on function public.respond_to_community_request(uuid, boolean) to authenticated;
grant execute on function public.remove_community_member(uuid) to authenticated;

-- Turning sharing off removes that user's previously published summaries, even
-- if the preference is changed outside the app's normal settings control.
create or replace function public.clear_reports_when_sharing_is_disabled()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.share_reports and not new.share_reports then
    delete from public.community_daily_reports
    where user_id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists clear_reports_after_sharing_disabled on public.community_profiles;
create trigger clear_reports_after_sharing_disabled
  after update of share_reports on public.community_profiles
  for each row execute procedure public.clear_reports_when_sharing_is_disabled();

revoke all on function public.clear_reports_when_sharing_is_disabled() from public, anon, authenticated;
