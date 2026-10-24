-- Admin access for the LYX listing workspace.
-- Create or invite the staff Auth account first, then add its UUID to admin_users.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists "Admins can read their own access" on public.admin_users;
create policy "Admins can read their own access" on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()));

grant insert, update, delete on public.properties, public.developments, public.articles, public.testimonials to authenticated;

drop policy if exists "Admins can view all properties" on public.properties;
create policy "Admins can view all properties" on public.properties
  for select to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
drop policy if exists "Admins manage properties" on public.properties;
create policy "Admins manage properties" on public.properties
  for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Admins can view all developments" on public.developments;
create policy "Admins can view all developments" on public.developments
  for select to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
drop policy if exists "Admins manage developments" on public.developments;
create policy "Admins manage developments" on public.developments
  for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Admins can view all articles" on public.articles;
create policy "Admins can view all articles" on public.articles
  for select to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
drop policy if exists "Admins manage articles" on public.articles;
create policy "Admins manage articles" on public.articles
  for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Admins can view all testimonials" on public.testimonials;
create policy "Admins can view all testimonials" on public.testimonials
  for select to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
drop policy if exists "Admins manage testimonials" on public.testimonials;
create policy "Admins manage testimonials" on public.testimonials
  for all to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

grant insert, update, delete on storage.objects to authenticated;
drop policy if exists "Admins upload property photos" on storage.objects;
create policy "Admins upload property photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'property-images'
    and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );
drop policy if exists "Admins update property photos" on storage.objects;
create policy "Admins update property photos" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'property-images'
    and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  )
  with check (
    bucket_id = 'property-images'
    and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );
drop policy if exists "Admins delete property photos" on storage.objects;
create policy "Admins delete property photos" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'property-images'
    and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );
