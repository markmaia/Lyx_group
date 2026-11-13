# Supabase setup

The LYX Group database migration is in `migrations/202610210001_create_real_estate_schema.sql`.

## Apply the schema and enable the admin page

1. Open the Supabase project dashboard and choose **SQL Editor**.
2. Open the migration file, copy its contents into a new SQL query, and run it with the project database owner.
3. Run `migrations/202610210002_admin_listing_access.sql` the same way. It creates the admin allowlist and restricts edits and photo uploads to allowlisted accounts.
4. In **Authentication → Users**, create or invite a staff user. Then in **SQL Editor**, add that account as an administrator by running this query with its sign-in email:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'admin@example.com'
   on conflict (user_id) do nothing;
   ```

   Replace `admin@example.com` with the exact email used for the Auth user. The query should insert one row. Only add trusted staff accounts.
5. Start the site and open `/admin` (for local Vite, `http://localhost:5173/admin`) to sign in and create listings. Listings remain drafts until you select **Published**. Select **Feature on the homepage** to show them in the featured grid.
6. Restart the Vite development server after changing `.env.local`.

The first migration creates `properties`, `developments`, `articles`, `testimonials`, and `enquiries`; adds the public `property-images` bucket; and enables Row Level Security. Visitors can read published content and submit a consented enquiry. The second migration enables the authenticated admin workflow for properties, developments, articles, testimonials, and property photos. Enquiries stay private.

No example listings or testimonials are inserted. The homepage search and featured cards read published records from Supabase and show empty states while the tables have no published content.

The local `.env.local` uses the supplied project URL and publishable key. `.env.local` is ignored by Git. Copy `.env.example` when configuring another environment; only use the publishable key in browser code. Never place a Supabase secret or service-role key in a `VITE_` variable.
