# Cloudflare video storage

The Worker accepts authenticated `POST /api/recordings` requests, validates the Supabase access token, and writes videos to a private R2 bucket under the authenticated user's ID. No public R2 URL is created.

## Local setup

1. Create the bucket with `npx wrangler r2 bucket create inilife-videos`.
2. Copy `.dev.vars.example` to `.dev.vars` and fill in the Supabase project URL and publishable key.
3. Set `ALLOWED_ORIGINS` in `wrangler.jsonc` for the local web origin you use.
4. Start the Worker from the project root with `npm run worker:dev`.

## Deploy

Set the Supabase values as Worker secrets with `npx wrangler secret put SUPABASE_URL` and `npx wrangler secret put SUPABASE_PUBLISHABLE_KEY`. Add the production Vercel origin to `ALLOWED_ORIGINS`, then run `npm run worker:deploy`. Set `EXPO_PUBLIC_VIDEO_UPLOAD_URL` in Vercel and local Expo environments to the Worker URL plus `/api/recordings`.

The upload endpoint accepts MP4, WebM, and QuickTime video up to 90 MiB. Only authenticated upload is implemented; recordings remain private in R2 and the app does not announce successful storage.
