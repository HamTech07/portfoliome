# Muhammad Hamdan Amir — Portfolio

A responsive React portfolio with Framer Motion, Tailwind CSS, interactive capability showcases, an animated working stack and a Gemini-powered portfolio assistant.

## Run the portfolio locally

```bash
npm install
npm run dev
```

Use Node 22.9+ (Node 24 recommended). `npm run dev` starts both Vite and the assistant backend, loading an optional root `.env` file. The Vite app runs on `http://127.0.0.1:5173` or the URL printed in the terminal. `npm run dev:frontend` starts only Vite.

Without `GEMINI_API_KEY`, the assistant explicitly displays **Portfolio guide · saved answers** and answers from verified project data. This mode is not generative AI. Network/API failures also show a labelled saved-answer fallback. Real Gemini responses require your own server-side key; never send it in chat or add a `VITE_` prefix.

## Vercel deployment

**Admin panel hosting:** the editable website and `/admin` require the persistent Node server, not a Vercel-only static/serverless deployment. For the full site use `npm ci`, `npm run build`, then `npm run server`; the Node server serves `dist`, `/api/site`, `/api/chat`, `/api/admin/*` and `/media/*` together. Use HTTPS, set `ALLOWED_ORIGINS` to your exact website origin, and mount permanent storage at `DATA_DIR`. Do not use ephemeral filesystem hosting for admin content. The Vercel route below supports the assistant only and does not persist admin changes.

## Admin panel

Open `http://127.0.0.1:5173/admin` after `npm run dev`. Admin authentication uses Google OAuth through the dedicated **Portfolio Admin** Supabase project. Password login is disabled. The protected owner is `hamdanamir2005@gmail.com`; authorization comes from a confirmed Google identity and a fresh database membership check on every protected request, never editable user metadata.

One-time Supabase setup:

1. Run [`supabase/setup.sql`](supabase/setup.sql) in the Portfolio Admin project's SQL editor.
2. In Authentication → URL Configuration, use the production website as the Site URL and add `http://127.0.0.1:5173/admin` plus the production `/admin` URL to Redirect URLs.
3. Create a Google Web OAuth client, register `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`, then enable the Google provider in Supabase with that client ID and secret.
4. Set `SUPABASE_URL` and the browser-safe `SUPABASE_PUBLISHABLE_KEY` in the server environment. Never configure a `service_role` or secret key in frontend-accessible variables.

The owner can add or remove Google-account emails in **Admin access**. Added admins may edit and publish content, but cannot manage admins or remove the owner. Removing an admin revokes portfolio access on their next request without deleting their Google or Supabase user account. Google profile names and photos are display-only.

- **Projects:** add, edit, reorder or remove projects; upload cover images (JPG/PNG/WebP up to 8 MB) and APKs (up to 160 MB).
- **Website:** edit identity, contact/social links, page title/description, hero, about, contact, headings and capability content.
- **Appearance:** change the default visitor theme, accent color, live background, scroll animation and assistant visibility.
- **Publish changes:** validates and saves to the server; reload or focus the public website to see updates. Concurrent edits are rejected rather than overwritten.
- **Backup:** export content JSON; back up the entire data directory separately for uploaded files. The previous published content is kept as `content.previous.json`. Removing a project does not delete its uploaded files.

The CMS manages content and appearance, not hosting credentials, DNS, source code or the Gemini secret. Set `GEMINI_API_KEY` only in the server environment. The assistant reads the current published content.

## Optional assistant-only serverless deployment

`api/chat.js` supplies a same-origin serverless assistant endpoint. Leave `VITE_ASSISTANT_API_URL` unset (or `/api/chat`) and configure `GEMINI_API_KEY` and your exact production origin in `ALLOWED_ORIGINS` in the hosting environment. The separate Render deployment below remains optional. In-memory rate limits reset on serverless cold starts and are per instance; use persistent shared rate limiting before relying on them as a production spending cap.

## Rock AI download

The exact supplied Expo build was downloaded to `public/downloads/rock-ai-detective.apk` before its signed link expired. Vite serves it locally and includes it in `dist` on build. The roughly 140 MB APK is excluded from Git because it exceeds GitHub's regular file limit. A Git-based deployment therefore needs this APK uploaded to durable asset storage and the project's `downloadUrl` changed to that public URL, or the APK supplied in the deployment's `public/downloads` directory before building. Do not deploy the Git checkout alone and assume the APK is included. The original temporary signed URL is not embedded in the website.

## Run the AI assistant backend locally

Copy `.env.example` to `.env`, add your own Gemini API key from Google AI Studio, then run (only if not already using `npm run dev`):

```bash
npm run server
```

The backend listens on port `8787`. Vite proxies `/api` to this local service.

## Deploy the backend to Render

This repository includes `render.yaml`. Create a Render Blueprint/Web Service from the GitHub repository and configure:

- `GEMINI_API_KEY`: your secret key from Google AI Studio.
- `GEMINI_MODEL`: `gemini-2.5-flash-lite` for the supported free-tier model.
- `MAX_DAILY_REQUESTS`: a server-side safety cap such as `200`.
- `ALLOWED_ORIGINS`: the exact Vercel portfolio URL. Multiple origins can be comma-separated.

After Render deploys, set this variable in the Vercel frontend project and redeploy it:

```text
VITE_ASSISTANT_API_URL=https://your-render-service.onrender.com/api/chat
```

Never place `GEMINI_API_KEY` in a `VITE_` variable or commit it to Git. The Gemini free tier is quota-limited and its prompts may be used to improve Google products, so the assistant warns visitors not to share sensitive information.

## Validation

```bash
npm test
npm run lint
npm run build
```
