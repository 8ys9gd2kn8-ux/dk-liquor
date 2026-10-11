-- D&K LIQUOR: database setup. Paste ALL of this into Supabase -> SQL Editor -> Run.

create table if not exists public.docs (
  coll text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (coll, id)
);
alter table public.docs replica identity full;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.docs enable row level security;
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admin reads own row" on public.admins;
create policy "admin reads own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- Everyone can SEE the shop (products, combos, promotions, ads, categories, settings)
drop policy if exists "public read shop" on public.docs;
create policy "public read shop" on public.docs
  for select to anon, authenticated
  using (coll in ('products','combos','promotions','promos','ads','categories','settings'));

-- Only administrators can add, change or delete anything
drop policy if exists "admin full access" on public.docs;
create policy "admin full access" on public.docs
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Customers can place an order (always saved as 'New') and read only their own orders
drop policy if exists "customer places order" on public.docs;
create policy "customer places order" on public.docs
  for insert to authenticated
  with check (coll = 'orders'
              and data->>'uid' = auth.uid()::text
              and data->>'status' = 'New'
              and pg_column_size(data) < 20000);

drop policy if exists "customer reads own orders" on public.docs;
create policy "customer reads own orders" on public.docs
  for select to authenticated
  using (coll = 'orders' and data->>'uid' = auth.uid()::text);

-- Customers can save their own delivery details
drop policy if exists "customer own profile" on public.docs;
create policy "customer own profile" on public.docs
  for all to authenticated
  using (coll = 'profiles' and id = auth.uid()::text)
  with check (coll = 'profiles' and id = auth.uid()::text and pg_column_size(data) < 5000);

-- Live updates
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;

-- ============================================================
-- STEP 2 (run AFTER you create your admin user in
-- Authentication -> Users -> Add user). Replace the email:
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'YOUR-EMAIL@example.com'
-- on conflict do nothing;
-- ============================================================
