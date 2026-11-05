# Supabase

Supabase Auth manages login credentials and sessions; do not create or store passwords in an app table. Create a Supabase project, enable email and password sign-in, and put its project URL and publishable key in the root `.env`. The publishable key is intended for client use; never put a secret/service-role key in the Expo app.

## Profile schema

In the Supabase Dashboard, open **SQL Editor**, create a query, paste the contents of `schema.sql`, and run it once. It creates a `public.profiles` row for each new Auth user and applies row-level security so users can only read or update their own display name. Existing Auth accounts are not modified; create profile rows for existing users separately if needed.
