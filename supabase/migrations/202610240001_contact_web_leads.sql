-- Let visitors omit email on the Contact Us lead form and let staff review submissions.

alter table public.enquiries alter column email drop not null;

alter table public.enquiries drop constraint if exists enquiries_email_length;
alter table public.enquiries
  add constraint enquiries_email_length
  check (email is null or char_length(trim(email)) between 5 and 254);

drop policy if exists "Visitors can submit consented enquiries" on public.enquiries;
create policy "Visitors can submit consented enquiries" on public.enquiries
  for insert to anon, authenticated
  with check (
    consent_to_contact = true
    and char_length(trim(contact_name)) between 2 and 120
    and phone is not null
    and char_length(trim(phone)) between 7 and 40
    and (email is null or char_length(trim(email)) between 5 and 254)
    and char_length(trim(message)) between 10 and 5000
    and status = 'new'
  );

grant select, update on public.enquiries to authenticated;

drop policy if exists "Admins can view enquiries" on public.enquiries;
create policy "Admins can view enquiries" on public.enquiries
  for select to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

drop policy if exists "Admins can update enquiries" on public.enquiries;
create policy "Admins can update enquiries" on public.enquiries
  for update to authenticated
  using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
