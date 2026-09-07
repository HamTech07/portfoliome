# Muhammad Hamdan Amir — Portfolio

A responsive React portfolio with Framer Motion, Tailwind CSS, interactive capability showcases, an animated working stack and a Gemini-powered portfolio assistant.

## Run the portfolio locally

```bash
npm install
npm run dev
```

The Vite app runs on `http://127.0.0.1:5173` or the URL printed in the terminal.

## Run the AI assistant backend locally

Copy `.env.example` to `.env`, add your own Gemini API key from Google AI Studio, then load the environment variables and run:

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
