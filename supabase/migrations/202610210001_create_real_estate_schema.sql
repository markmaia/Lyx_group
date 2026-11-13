-- LYX Group real-estate schema for Supabase/Postgres.
-- Apply this migration from the Supabase SQL Editor or Supabase CLI.

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  description text,
  property_type text not null check (property_type in ('residential', 'commercial', 'off_plan', 'land_plot', 'rental', 'holiday_home', 'luxury')),
  transaction_type text not null check (transaction_type in ('sale', 'rent')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  price_ksh numeric(15, 2) check (price_ksh is null or price_ksh >= 0),
  city text not null default 'Kenya',
  area text,
  bedrooms smallint check (bedrooms is null or bedrooms >= 0),
  bathrooms smallint check (bathrooms is null or bathrooms >= 0),
  floor_area_sqm numeric(10, 2) check (floor_area_sqm is null or floor_area_sqm > 0),
  land_area_sqm numeric(12, 2) check (land_area_sqm is null or land_area_sqm > 0),
  image_urls text[] not null default '{}',
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.developments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  city text not null default 'Kenya',
  area text,
  starting_price_ksh numeric(15, 2) check (starting_price_ksh is null or starting_price_ksh >= 0),
  construction_status text check (construction_status in ('planning', 'under_construction', 'completed')),
  expected_completion date,
  image_urls text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body_markdown text not null default '',
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  quote text not null,
  rating smallint check (rating is null or rating between 1 and 5),
  status text not null default 'pending' check (status in ('pending', 'published', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  enquiry_type text not null check (enquiry_type in ('buying', 'renting', 'selling', 'valuation', 'investment', 'general')),
  contact_name text not null,
  email text not null,
  phone text,
  message text not null,
  consent_to_contact boolean not null default false,
  status text not null default 'new' check (status in ('new', 'in_progress', 'closed')),
  created_at timestamptz not null default now(),
  constraint enquiries_name_length check (char_length(trim(contact_name)) between 2 and 120),
  constraint enquiries_email_length check (char_length(trim(email)) between 5 and 254),
  constraint enquiries_message_length check (char_length(trim(message)) between 10 and 5000)
);

create index if not exists properties_public_search_idx on public.properties (status, transaction_type, property_type, featured desc, created_at desc);
create index if not exists properties_city_idx on public.properties (lower(city));
create index if not exists properties_area_idx on public.properties (lower(area));
create index if not exists developments_public_idx on public.developments (status, featured desc, created_at desc);
create index if not exists articles_public_idx on public.articles (status, published_at desc);
create index if not exists testimonials_public_idx on public.testimonials (status, created_at desc);
create index if not exists enquiries_created_idx on public.enquiries (created_at desc);

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at before update on public.properties for each row execute function public.set_updated_at();
drop trigger if exists developments_set_updated_at on public.developments;
create trigger developments_set_updated_at before update on public.developments for each row execute function public.set_updated_at();
drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at before update on public.articles for each row execute function public.set_updated_at();
drop trigger if exists testimonials_set_updated_at on public.testimonials;
create trigger testimonials_set_updated_at before update on public.testimonials for each row execute function public.set_updated_at();

alter table public.properties enable row level security;
alter table public.developments enable row level security;
alter table public.articles enable row level security;
alter table public.testimonials enable row level security;
alter table public.enquiries enable row level security;

revoke all on public.properties, public.developments, public.articles, public.testimonials, public.enquiries from anon, authenticated;
grant select on public.properties, public.developments, public.articles, public.testimonials to anon, authenticated;
grant insert on public.enquiries to anon, authenticated;

drop policy if exists "Published properties are public" on public.properties;
create policy "Published properties are public" on public.properties for select to anon, authenticated using (status = 'published');
drop policy if exists "Published developments are public" on public.developments;
create policy "Published developments are public" on public.developments for select to anon, authenticated using (status = 'published');
drop policy if exists "Published articles are public" on public.articles;
create policy "Published articles are public" on public.articles for select to anon, authenticated using (status = 'published');
drop policy if exists "Published testimonials are public" on public.testimonials;
create policy "Published testimonials are public" on public.testimonials for select to anon, authenticated using (status = 'published');
drop policy if exists "Visitors can submit consented enquiries" on public.enquiries;
create policy "Visitors can submit consented enquiries" on public.enquiries
  for insert to anon, authenticated
  with check (
    consent_to_contact = true
    and char_length(trim(contact_name)) between 2 and 120
    and char_length(trim(email)) between 5 and 254
    and char_length(trim(message)) between 10 and 5000
    and status = 'new'
  );

drop policy if exists "Property photos are public" on storage.objects;
create policy "Property photos are public" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'property-images');

comment on table public.properties is 'LYX property listings. Publish records by setting status to published.';
comment on table public.developments is 'LYX development opportunities. Publish only verified project details.';
comment on table public.articles is 'LYX property insights. Only published articles are exposed to visitors.';
comment on table public.testimonials is 'Authentic client feedback. New records stay pending until reviewed.';
comment on table public.enquiries is 'Visitor enquiries. Public clients may insert consented messages but cannot read them.';
