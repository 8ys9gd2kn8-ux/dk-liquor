-- =====================================================================================
-- D&K PARTY PLANNER | closed-app push alerts (run AFTER supabase-planner.sql)
-- Stores one row per device that agreed to alerts. Browsers can never read or write this table directly;
-- they use the two functions below, and the server-side function `pp-push` reads it with the service key.
-- =====================================================================================
create table if not exists public.pp_push_subs(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique check (char_length(endpoint)<=1200),
  p256dh text not null check (char_length(p256dh)<=200),
  auth text not null check (char_length(auth)<=100),
  user_agent text check (user_agent is null or char_length(user_agent)<=200),
  created_at timestamptz not null default now());
create index if not exists pp_push_subs_user on public.pp_push_subs(user_id);
alter table public.pp_push_subs enable row level security;
revoke all on public.pp_push_subs from anon, authenticated;

-- A device belongs to whoever is signed in on it (so a shared phone never alerts the previous person).
create or replace function public.pp_save_push(p_endpoint text, p_p256dh text, p_auth text, p_ua text) returns void
language plpgsql security definer set search_path='' as $$
begin
  if public.pp_uid() is null or not public.pp_is_registered(public.pp_uid()) then raise exception 'not allowed'; end if;
  insert into public.pp_push_subs(user_id,endpoint,p256dh,auth,user_agent) values(public.pp_uid(),p_endpoint,p_p256dh,p_auth,left(coalesce(p_ua,''),200))
  on conflict (endpoint) do update set user_id=excluded.user_id, p256dh=excluded.p256dh, auth=excluded.auth, user_agent=excluded.user_agent;
end $$;

create or replace function public.pp_drop_push(p_endpoint text) returns void
language plpgsql security definer set search_path='' as $$
begin
  delete from public.pp_push_subs where endpoint=p_endpoint and user_id=public.pp_uid();
end $$;

revoke all on function public.pp_save_push(text,text,text,text), public.pp_drop_push(text) from public;
grant execute on function public.pp_save_push(text,text,text,text), public.pp_drop_push(text) to authenticated;
