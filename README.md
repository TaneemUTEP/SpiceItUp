# SpiceItUp

An Expo app with party games, Supabase email/password authentication, and private Action Cam video storage in Cloudflare R2.

## Project layout

- `assets/` - checked-in app images and icons
- `server/` - Cloudflare Worker that authenticates video uploads and writes to private R2
- `src/` - Expo screens, authentication, navigation, and services
- `supabase/` - Supabase project setup notes
- `tests/` - Worker authorization and upload checks
- `notes/` - product update notes

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set the Supabase project URL and publishable key.
3. In Supabase, enable email/password sign-in and choose whether signup requires email confirmation.
4. Run `npm run web` to test the app in a browser at `http://localhost:8081`; `npm start` remains available for Expo Go and native testing.
5. In a second terminal, run `npm run worker:dev` to test video uploads locally. The example environment points uploads to `http://localhost:8787/api/recordings`.

The app opens on a public landing page. Game screens require a Supabase session. Old browser-local accounts are cleared because their passwords were stored in plain text; create a new account through Supabase.

## Video uploads

Follow [server/README.md](server/README.md) to create the private R2 bucket and configure the upload Worker. Set `EXPO_PUBLIC_VIDEO_UPLOAD_URL` to the Worker endpoint. Action Cam uploads a recording after the user stops it; successful storage is silent and the local preview remains available.

## Vercel

Import the repository into Vercel. The included `vercel.json` exports the Expo web build to `dist`. Set `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `EXPO_PUBLIC_VIDEO_UPLOAD_URL` in Vercel's environment settings before deploying.

## Checks

- `npm run build:web` - export the Expo web app
- `npm run test:worker` - run Worker upload and authorization tests
- `npm run worker:dev` - run the Worker locally
- `npm run worker:deploy` - deploy the Worker
