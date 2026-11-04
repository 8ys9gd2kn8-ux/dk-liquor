-- =====================================================================================
-- D&K PARTY PLANNER  |  Supabase / PostgreSQL schema + security policies
-- Run ONCE in Supabase > SQL Editor (as the postgres role). Safe to re-run.
-- Security model: default-deny. Every table has Row Level Security (RLS) enabled and the
-- anon role has NO access. Planner features require a REAL (non-anonymous) signed-in user.
-- Message text is end-to-end encrypted in the browser; the database only ever stores ciphertext.
-- =====================================================================================
create extension if not exists pgcrypto with schema extensions;

-- ---------- helpers ----------------------------------------------------------------
create or replace function public.pp_uid() returns uuid language sql stable set search_path='' as $$
  select case when coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then null else auth.uid() end $$;

create or replace function public.pp_digits(p text) returns text language sql immutable set search_path='' as $$
  select regexp_replace(coalesce(p,''),'\D','','g') $$;

-- ---------- tables -----------------------------------------------------------------
create table if not exists public.pp_profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  name text not null check (char_length(name) between 1 and 80),
  phone text check (phone ~ '^[0-9]{9,15}$'),
  phone_hash text,
  phone_verified boolean not null default false,
  email text check (email is null or char_length(email)<=254),
  avatar_path text check (avatar_path is null or char_length(avatar_path)<=200),
  pubkey jsonb,
  created_at timestamptz not null default now());
create index if not exists pp_profiles_phone_hash on public.pp_profiles(phone_hash) where phone_verified;

create table if not exists public.pp_conversations(
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('dm','group')),
  name text check (name is null or char_length(name)<=80),
  category text check (category is null or char_length(category)<=40),
  guests int not null default 30 check (guests between 1 and 100000),
  budget numeric not null default 0 check (budget>=0),
  avatar_path text check (avatar_path is null or char_length(avatar_path)<=200),
  admin_only boolean not null default false,
  key_version int not null default 1,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now());

create table if not exists public.pp_members(
  conversation_id uuid not null references public.pp_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('organiser','admin','member')),
  muted boolean not null default false,
  last_read_at timestamptz not null default now(),
  joined_at timestamptz not null default now(),
  primary key(conversation_id,user_id));
create index if not exists pp_members_user on public.pp_members(user_id);

create table if not exists public.pp_member_keys(
  conversation_id uuid not null references public.pp_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  version int not null,
  wrapped_key text not null check (char_length(wrapped_key)<=400),
  wrapped_by uuid not null references auth.users(id),
  recipient_fp text not null,
  created_at timestamptz not null default now(),
  primary key(conversation_id,user_id,version));

create table if not exists public.pp_messages(
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.pp_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  kind text not null check (kind in ('text','sys','prod','share','poll')),
  ciphertext text check (ciphertext is null or char_length(ciphertext)<=12000),
  iv text check (iv is null or char_length(iv)<=40),
  key_version int,
  payload jsonb not null default '{}' check (pg_column_size(payload)<=2000),
  reactions jsonb not null default '{}',
  deleted_at timestamptz,
  created_at timestamptz not null default now());
create index if not exists pp_messages_conv on public.pp_messages(conversation_id,created_at desc);

create table if not exists public.pp_items(
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.pp_conversations(id) on delete cascade,
  product_id text, name text not null check (char_length(name)<=120),
  category text check (category is null or char_length(category)<=60),
  qty int not null default 1 check (qty between 1 and 100000),
  price_at numeric not null default 0 check (price_at>=0),
  status text not null default 'Suggested' check (status in ('Suggested','Under discussion','Approved','Rejected','Purchased','Cancelled')),
  suggested_by uuid[] not null default '{}',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now());
create index if not exists pp_items_conv on public.pp_items(conversation_id);

create table if not exists public.pp_plan_options(
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.pp_conversations(id) on delete cascade,
  field text not null check (field in ('date','time','venue')),
  value text not null check (char_length(value)<=120),
  proposed_by uuid not null references auth.users(id),
  locked boolean not null default false,
  created_at timestamptz not null default now());
create index if not exists pp_options_conv on public.pp_plan_options(conversation_id);

create table if not exists public.pp_votes(
  conversation_id uuid not null references public.pp_conversations(id) on delete cascade,
  target_type text not null check (target_type in ('item','option')),
  target_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1,1)),
  primary key(target_type,target_id,user_id));
create index if not exists pp_votes_conv on public.pp_votes(conversation_id);

create table if not exists public.pp_activity(
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.pp_conversations(id) on delete cascade,
  actor uuid not null references auth.users(id),
  text text not null check (char_length(text)<=300),
  item_id uuid,
  created_at timestamptz not null default now());
create index if not exists pp_activity_conv on public.pp_activity(conversation_id,created_at desc);

create table if not exists public.pp_invites(
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.pp_conversations(id) on delete cascade,
  token_hash text not null unique,           -- sha-256 of the secret link token; the token itself is never stored
  label text check (label is null or char_length(label)<=80),
  created_by uuid not null references auth.users(id),
  expires_at timestamptz not null default now()+interval '7 days',
  used_by uuid references auth.users(id), used_at timestamptz,
  created_at timestamptz not null default now());

create table if not exists public.pp_key_backups(   -- passphrase-encrypted private key; useless without the passphrase
  user_id uuid primary key references auth.users(id) on delete cascade,
  salt text not null, iv text not null, blob text not null check (char_length(blob)<=4000),
  updated_at timestamptz not null default now());

create table if not exists public.pp_audit(          -- tamper-evident trail; no client access at all
  id bigint generated always as identity primary key,
  user_id uuid, action text not null, conversation_id uuid, meta jsonb,
  created_at timestamptz not null default now());

-- ---------- access helpers (SECURITY DEFINER so policies never recurse) ---------------
create or replace function public.pp_is_member(cid uuid) returns boolean language sql stable security definer set search_path='' as $$
  select public.pp_uid() is not null and exists(select 1 from public.pp_members where conversation_id=cid and user_id=public.pp_uid()) $$;
create or replace function public.pp_is_admin(cid uuid) returns boolean language sql stable security definer set search_path='' as $$
  select public.pp_uid() is not null and exists(select 1 from public.pp_members where conversation_id=cid and user_id=public.pp_uid() and role in ('organiser','admin')) $$;
create or replace function public.pp_shares_conv(other uuid) returns boolean language sql stable security definer set search_path='' as $$
  select public.pp_uid() is not null and exists(select 1 from public.pp_members a join public.pp_members b on a.conversation_id=b.conversation_id where a.user_id=public.pp_uid() and b.user_id=other) $$;
create or replace function public.pp_is_registered(uid uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.pp_profiles where id=uid) $$;
create or replace function public.pp_can_post(cid uuid) returns boolean language sql stable security definer set search_path='' as $$
  select public.pp_is_member(cid) and (not (select admin_only from public.pp_conversations where id=cid) or public.pp_is_admin(cid)) $$;

-- ---------- triggers -------------------------------------------------------------------
create or replace function public.pp_profile_guard() returns trigger language plpgsql security definer set search_path='' as $$
declare u record;
begin
  select phone, phone_confirmed_at into u from auth.users where id=new.id;
  new.username:=lower(new.username);
  if new.phone is not null then
    new.phone_verified := (u.phone_confirmed_at is not null and public.pp_digits(u.phone)=new.phone);
    new.phone_hash := encode(extensions.digest('dk-pp-v1:'||new.phone,'sha256'),'hex');  -- computed here, never trusted from the client
  else new.phone_verified:=false; new.phone_hash:=null; end if;
  return new;
end $$;
drop trigger if exists pp_profile_guard on public.pp_profiles;
create trigger pp_profile_guard before insert or update on public.pp_profiles for each row execute function public.pp_profile_guard();

create or replace function public.pp_msg_rate() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if (select count(*) from public.pp_messages where sender_id=new.sender_id and created_at>now()-interval '1 minute')>=60 then
    raise exception 'Slow down: too many messages' using errcode='P0001'; end if;
  return new; end $$;
drop trigger if exists pp_msg_rate on public.pp_messages;
create trigger pp_msg_rate before insert on public.pp_messages for each row execute function public.pp_msg_rate();

create or replace function public.pp_item_guard() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.status is distinct from old.status and not public.pp_is_admin(new.conversation_id) then raise exception 'Only admins can change item status'; end if;
  new.conversation_id:=old.conversation_id; new.product_id:=old.product_id; new.created_by:=old.created_by; new.price_at:=old.price_at;
  return new; end $$;
drop trigger if exists pp_item_guard on public.pp_items;
create trigger pp_item_guard before update on public.pp_items for each row execute function public.pp_item_guard();

create or replace function public.pp_audit_members() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if tg_op='DELETE' then
    insert into public.pp_audit(user_id,action,conversation_id,meta) values(public.pp_uid(),'remove member',old.conversation_id,jsonb_build_object('target',old.user_id,'role',old.role));
    return old;
  end if;
  insert into public.pp_audit(user_id,action,conversation_id,meta) values(public.pp_uid(),lower(tg_op)||' member',new.conversation_id,jsonb_build_object('target',new.user_id,'role',new.role));
  return new;
end $$;
drop trigger if exists pp_audit_members on public.pp_members;
create trigger pp_audit_members after insert or update of role or delete on public.pp_members for each row execute function public.pp_audit_members();

-- ---------- Row Level Security ----------------------------------------------------------
do $$ declare t text; begin
  foreach t in array array['pp_profiles','pp_conversations','pp_members','pp_member_keys','pp_messages','pp_items','pp_plan_options','pp_votes','pp_activity','pp_invites','pp_key_backups','pp_audit'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
  end loop; end $$;

-- grants: column-level where a table is only partly editable
grant select on public.pp_profiles, public.pp_conversations, public.pp_members, public.pp_member_keys, public.pp_messages, public.pp_items, public.pp_plan_options, public.pp_votes, public.pp_activity, public.pp_invites, public.pp_key_backups to authenticated;
grant insert on public.pp_profiles to authenticated;
grant update(name,avatar_path,pubkey,email) on public.pp_profiles to authenticated;
grant update(name,category,guests,budget,avatar_path,admin_only,key_version) on public.pp_conversations to authenticated;
grant insert, delete on public.pp_members to authenticated;
grant update(muted,last_read_at) on public.pp_members to authenticated;
grant insert on public.pp_member_keys to authenticated;
grant update(wrapped_key,wrapped_by,recipient_fp) on public.pp_member_keys to authenticated;
grant insert on public.pp_messages to authenticated;
grant insert, delete on public.pp_items to authenticated;
grant update(qty,status,suggested_by) on public.pp_items to authenticated;
grant insert, update(locked), delete on public.pp_plan_options to authenticated;
grant insert, update, delete on public.pp_votes to authenticated;
grant insert on public.pp_activity to authenticated;
grant insert on public.pp_invites to authenticated;
grant insert, update on public.pp_key_backups to authenticated;

drop policy if exists p_prof_sel on public.pp_profiles; create policy p_prof_sel on public.pp_profiles for select to authenticated using (id=public.pp_uid() or public.pp_shares_conv(id));
drop policy if exists p_prof_ins on public.pp_profiles; create policy p_prof_ins on public.pp_profiles for insert to authenticated with check (id=public.pp_uid());
drop policy if exists p_prof_upd on public.pp_profiles; create policy p_prof_upd on public.pp_profiles for update to authenticated using (id=public.pp_uid()) with check (id=public.pp_uid());

drop policy if exists p_conv_sel on public.pp_conversations; create policy p_conv_sel on public.pp_conversations for select to authenticated using (public.pp_is_member(id));
drop policy if exists p_conv_upd on public.pp_conversations; create policy p_conv_upd on public.pp_conversations for update to authenticated using (public.pp_is_admin(id)) with check (public.pp_is_admin(id));

drop policy if exists p_mem_sel on public.pp_members; create policy p_mem_sel on public.pp_members for select to authenticated using (public.pp_is_member(conversation_id));
drop policy if exists p_mem_ins on public.pp_members; create policy p_mem_ins on public.pp_members for insert to authenticated with check (public.pp_is_admin(conversation_id) and role='member' and public.pp_is_registered(user_id));
drop policy if exists p_mem_upd on public.pp_members; create policy p_mem_upd on public.pp_members for update to authenticated using (user_id=public.pp_uid()) with check (user_id=public.pp_uid());
drop policy if exists p_mem_del on public.pp_members; create policy p_mem_del on public.pp_members for delete to authenticated using (public.pp_is_admin(conversation_id) and role<>'organiser' and user_id<>public.pp_uid());

drop policy if exists p_key_sel on public.pp_member_keys; create policy p_key_sel on public.pp_member_keys for select to authenticated using (user_id=public.pp_uid() or public.pp_is_admin(conversation_id));  -- admins only see WRAPPED keys (useless without the member's private key)
drop policy if exists p_key_ins on public.pp_member_keys; create policy p_key_ins on public.pp_member_keys for insert to authenticated with check (public.pp_is_admin(conversation_id) and wrapped_by=public.pp_uid() and exists(select 1 from public.pp_members m where m.conversation_id=pp_member_keys.conversation_id and m.user_id=pp_member_keys.user_id));

drop policy if exists p_key_upd on public.pp_member_keys; create policy p_key_upd on public.pp_member_keys for update to authenticated using (public.pp_is_admin(conversation_id)) with check (public.pp_is_admin(conversation_id) and wrapped_by=public.pp_uid());

drop policy if exists p_msg_sel on public.pp_messages; create policy p_msg_sel on public.pp_messages for select to authenticated using (public.pp_is_member(conversation_id));
drop policy if exists p_msg_ins on public.pp_messages; create policy p_msg_ins on public.pp_messages for insert to authenticated with check (sender_id=public.pp_uid() and public.pp_can_post(conversation_id));

drop policy if exists p_item_sel on public.pp_items; create policy p_item_sel on public.pp_items for select to authenticated using (public.pp_is_member(conversation_id));
drop policy if exists p_item_ins on public.pp_items; create policy p_item_ins on public.pp_items for insert to authenticated with check (created_by=public.pp_uid() and public.pp_is_member(conversation_id));
drop policy if exists p_item_upd on public.pp_items; create policy p_item_upd on public.pp_items for update to authenticated using (public.pp_is_member(conversation_id)) with check (public.pp_is_member(conversation_id));
drop policy if exists p_item_del on public.pp_items; create policy p_item_del on public.pp_items for delete to authenticated using (public.pp_is_admin(conversation_id));

drop policy if exists p_opt_sel on public.pp_plan_options; create policy p_opt_sel on public.pp_plan_options for select to authenticated using (public.pp_is_member(conversation_id));
drop policy if exists p_opt_ins on public.pp_plan_options; create policy p_opt_ins on public.pp_plan_options for insert to authenticated with check (proposed_by=public.pp_uid() and public.pp_is_member(conversation_id) and locked=false);
drop policy if exists p_opt_upd on public.pp_plan_options; create policy p_opt_upd on public.pp_plan_options for update to authenticated using (public.pp_is_admin(conversation_id)) with check (public.pp_is_admin(conversation_id));
drop policy if exists p_opt_del on public.pp_plan_options; create policy p_opt_del on public.pp_plan_options for delete to authenticated using (public.pp_is_admin(conversation_id));

drop policy if exists p_vote_sel on public.pp_votes; create policy p_vote_sel on public.pp_votes for select to authenticated using (public.pp_is_member(conversation_id));
drop policy if exists p_vote_all on public.pp_votes; create policy p_vote_all on public.pp_votes for all to authenticated using (user_id=public.pp_uid() and public.pp_is_member(conversation_id)) with check (user_id=public.pp_uid() and public.pp_is_member(conversation_id));

drop policy if exists p_act_sel on public.pp_activity; create policy p_act_sel on public.pp_activity for select to authenticated using (public.pp_is_member(conversation_id));
drop policy if exists p_act_ins on public.pp_activity; create policy p_act_ins on public.pp_activity for insert to authenticated with check (actor=public.pp_uid() and public.pp_is_member(conversation_id));

drop policy if exists p_inv_sel on public.pp_invites; create policy p_inv_sel on public.pp_invites for select to authenticated using (public.pp_is_admin(conversation_id));
drop policy if exists p_inv_ins on public.pp_invites; create policy p_inv_ins on public.pp_invites for insert to authenticated with check (created_by=public.pp_uid() and public.pp_is_admin(conversation_id));

drop policy if exists p_bk_sel on public.pp_key_backups; create policy p_bk_sel on public.pp_key_backups for select to authenticated using (user_id=public.pp_uid());
drop policy if exists p_bk_ins on public.pp_key_backups; create policy p_bk_ins on public.pp_key_backups for insert to authenticated with check (user_id=public.pp_uid());
drop policy if exists p_bk_upd on public.pp_key_backups; create policy p_bk_upd on public.pp_key_backups for update to authenticated using (user_id=public.pp_uid()) with check (user_id=public.pp_uid());
-- pp_audit: RLS on, no policy, no grant => unreadable and unwritable from the browser.

-- ---------- RPC functions (the only way to do privileged things) -----------------------
create or replace function public.pp_username_available(p_username text) returns boolean language sql stable security definer set search_path='' as $$
  select not exists(select 1 from public.pp_profiles where username=lower(p_username)) $$;

create or replace function public.pp_match_contacts(p_hashes text[]) returns table(id uuid, username text, name text, avatar_path text, phone_hash text)
language plpgsql stable security definer set search_path='' as $$
begin
  if public.pp_uid() is null then raise exception 'not allowed'; end if;
  if coalesce(array_length(p_hashes,1),0)>1000 then raise exception 'too many contacts'; end if;
  return query select p.id,p.username,p.name,p.avatar_path,p.phone_hash from public.pp_profiles p where p.phone_verified and p.phone_hash=any(p_hashes) and p.id<>public.pp_uid();
end $$;

create or replace function public.pp_lookup(p_username text, p_phone_hash text) returns table(id uuid, username text, name text, avatar_path text)
language plpgsql stable security definer set search_path='' as $$
begin
  if public.pp_uid() is null then raise exception 'not allowed'; end if;   -- exact match only: no browsing the user list
  return query select p.id,p.username,p.name,p.avatar_path from public.pp_profiles p where p.id<>public.pp_uid()
    and ((p_username is not null and p.username=lower(p_username)) or (p_phone_hash is not null and p.phone_verified and p.phone_hash=p_phone_hash)) limit 5;
end $$;

create or replace function public.pp_create_conversation(p_type text, p_name text, p_category text, p_guests int, p_budget numeric, p_members uuid[]) returns uuid
language plpgsql security definer set search_path='' as $$
declare cid uuid; u uuid;
begin
  if public.pp_uid() is null then raise exception 'not allowed'; end if;
  if p_type<>'group' then raise exception 'use pp_open_dm for direct chats'; end if;
  if coalesce(array_length(p_members,1),0)>200 then raise exception 'too many members'; end if;
  insert into public.pp_conversations(type,name,category,guests,budget,created_by) values('group',left(p_name,80),left(p_category,40),greatest(1,coalesce(p_guests,30)),greatest(0,coalesce(p_budget,0)),public.pp_uid()) returning id into cid;
  insert into public.pp_members(conversation_id,user_id,role) values(cid,public.pp_uid(),'organiser');
  foreach u in array coalesce(p_members,'{}') loop
    if u<>public.pp_uid() and public.pp_is_registered(u) then insert into public.pp_members(conversation_id,user_id) values(cid,u) on conflict do nothing; end if;
  end loop;
  return cid;
end $$;

create or replace function public.pp_open_dm(p_other uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare cid uuid;
begin
  if public.pp_uid() is null or p_other=public.pp_uid() or not public.pp_is_registered(p_other) then raise exception 'not allowed'; end if;
  select c.id into cid from public.pp_conversations c where c.type='dm'
    and exists(select 1 from public.pp_members m where m.conversation_id=c.id and m.user_id=public.pp_uid())
    and exists(select 1 from public.pp_members m where m.conversation_id=c.id and m.user_id=p_other) limit 1;
  if cid is null then
    insert into public.pp_conversations(type,created_by) values('dm',public.pp_uid()) returning id into cid;
    insert into public.pp_members(conversation_id,user_id,role) values(cid,public.pp_uid(),'admin'),(cid,p_other,'admin');
  end if;
  return cid;
end $$;

create or replace function public.pp_set_role(p_cid uuid, p_user uuid, p_role text) returns void language plpgsql security definer set search_path='' as $$
begin
  if not public.pp_is_admin(p_cid) or p_role not in ('admin','member') then raise exception 'not allowed'; end if;
  update public.pp_members set role=p_role where conversation_id=p_cid and user_id=p_user and role<>'organiser';
end $$;

create or replace function public.pp_leave(p_cid uuid) returns void language plpgsql security definer set search_path='' as $$
declare nxt uuid;
begin
  if not public.pp_is_member(p_cid) then raise exception 'not allowed'; end if;
  if (select role from public.pp_members where conversation_id=p_cid and user_id=public.pp_uid())='organiser' then
    select user_id into nxt from public.pp_members where conversation_id=p_cid and user_id<>public.pp_uid() order by (role='admin') desc, joined_at limit 1;
    if nxt is not null then update public.pp_members set role='organiser' where conversation_id=p_cid and user_id=nxt; end if;
  end if;
  delete from public.pp_members where conversation_id=p_cid and user_id=public.pp_uid();
  if not exists(select 1 from public.pp_members where conversation_id=p_cid) then delete from public.pp_conversations where id=p_cid; end if;
end $$;

create or replace function public.pp_react(p_mid uuid, p_emoji text) returns void language plpgsql security definer set search_path='' as $$
declare cid uuid; me text:=public.pp_uid()::text;
begin
  select conversation_id into cid from public.pp_messages where id=p_mid;
  if cid is null or not public.pp_is_member(cid) or char_length(p_emoji)>8 then raise exception 'not allowed'; end if;
  update public.pp_messages set reactions = case when reactions->>me = p_emoji then reactions - me else reactions || jsonb_build_object(me,p_emoji) end where id=p_mid;
end $$;

create or replace function public.pp_delete_message(p_mid uuid) returns void language plpgsql security definer set search_path='' as $$
begin
  update public.pp_messages set deleted_at=now(), ciphertext=null, iv=null, payload='{}' where id=p_mid and sender_id=public.pp_uid();
end $$;

create or replace function public.pp_accept_invite(p_token text) returns uuid language plpgsql security definer set search_path='' as $$
declare inv public.pp_invites;
begin
  if public.pp_uid() is null or not public.pp_is_registered(public.pp_uid()) then raise exception 'register first'; end if;
  select * into inv from public.pp_invites where token_hash=encode(extensions.digest(p_token,'sha256'),'hex') and used_by is null and expires_at>now();
  if inv.id is null then raise exception 'This invitation link is invalid or has expired'; end if;
  insert into public.pp_members(conversation_id,user_id) values(inv.conversation_id,public.pp_uid()) on conflict do nothing;
  update public.pp_invites set used_by=public.pp_uid(), used_at=now() where id=inv.id;
  insert into public.pp_audit(user_id,action,conversation_id) values(public.pp_uid(),'accept invite',inv.conversation_id);
  return inv.conversation_id;
end $$;

revoke all on function public.pp_username_available(text), public.pp_match_contacts(text[]), public.pp_lookup(text,text), public.pp_create_conversation(text,text,text,int,numeric,uuid[]),
  public.pp_open_dm(uuid), public.pp_set_role(uuid,uuid,text), public.pp_leave(uuid), public.pp_react(uuid,text), public.pp_delete_message(uuid), public.pp_accept_invite(text) from public;
grant execute on function public.pp_username_available(text) to anon, authenticated;
grant execute on function public.pp_match_contacts(text[]), public.pp_lookup(text,text), public.pp_create_conversation(text,text,text,int,numeric,uuid[]),
  public.pp_open_dm(uuid), public.pp_set_role(uuid,uuid,text), public.pp_leave(uuid), public.pp_react(uuid,text), public.pp_delete_message(uuid), public.pp_accept_invite(text) to authenticated;
revoke execute on function public.pp_is_member(uuid), public.pp_is_admin(uuid), public.pp_shares_conv(uuid), public.pp_is_registered(uuid), public.pp_can_post(uuid) from public;
grant execute on function public.pp_is_member(uuid), public.pp_is_admin(uuid), public.pp_shares_conv(uuid), public.pp_is_registered(uuid), public.pp_can_post(uuid), public.pp_uid() to authenticated;

-- ---------- profile pictures: PRIVATE storage bucket (signed URLs only) -------------------
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('pp-avatars','pp-avatars',false,524288,array['image/jpeg'])
  on conflict (id) do update set public=false, file_size_limit=524288, allowed_mime_types=array['image/jpeg'];
-- path convention:  users/<user-uuid>/<file>.jpg   |   groups/<conversation-uuid>/<file>.jpg
create or replace function public.pp_avatar_ok(p_name text, p_write boolean) returns boolean language plpgsql stable security definer set search_path='' as $$
declare parts text[]:=string_to_array(p_name,'/'); id uuid;
begin
  if public.pp_uid() is null or array_length(parts,1)<>3 or parts[2] !~ '^[0-9a-f-]{36}$' then return false; end if;
  id:=parts[2]::uuid;
  if parts[1]='users' then return id=public.pp_uid() or (not p_write and public.pp_shares_conv(id)); end if;
  if parts[1]='groups' then return case when p_write then public.pp_is_admin(id) else public.pp_is_member(id) end; end if;
  return false;
end $$;
revoke all on function public.pp_avatar_ok(text,boolean) from public; grant execute on function public.pp_avatar_ok(text,boolean) to authenticated;
drop policy if exists pp_av_read on storage.objects;   create policy pp_av_read   on storage.objects for select to authenticated using (bucket_id='pp-avatars' and public.pp_avatar_ok(name,false));
drop policy if exists pp_av_ins on storage.objects;    create policy pp_av_ins    on storage.objects for insert to authenticated with check (bucket_id='pp-avatars' and public.pp_avatar_ok(name,true));
drop policy if exists pp_av_upd on storage.objects;    create policy pp_av_upd    on storage.objects for update to authenticated using (bucket_id='pp-avatars' and public.pp_avatar_ok(name,true));
drop policy if exists pp_av_del on storage.objects;    create policy pp_av_del    on storage.objects for delete to authenticated using (bucket_id='pp-avatars' and public.pp_avatar_ok(name,true));

-- ---------- realtime (RLS applies to realtime too) ------------------------------------------
do $$ declare t text; begin
  foreach t in array array['pp_messages','pp_items','pp_plan_options','pp_votes','pp_members','pp_member_keys','pp_conversations','pp_activity','pp_profiles'] loop
    begin execute format('alter publication supabase_realtime add table public.%I',t); exception when duplicate_object then null; end;
  end loop; end $$;
