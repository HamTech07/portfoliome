# Muhammad Hamdan Amir — Portfolio (React + Framer Motion)

A React (Vite) rebuild of the portfolio with physics-based motion using
**Framer Motion** (spring animations, scroll-reveal, magnetic tilt cards).

## Tech Stack
- React 19 + Vite
- Tailwind CSS v4
- Framer Motion (spring physics animations)
- Font Awesome icons

## Project Structure
```
hamdan-portfolio/
├── public/
│   └── images/
│       └── Profile1.jpeg      <- profile photo lives here
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── Skills.jsx
│   │   ├── TiltCard.jsx       <- reusable physics tilt-card wrapper
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   └── Footer.jsx
│   ├── data/
│   │   └── content.js         <- edit skills, tech stack, socials here
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

## Run locally
```bash
npm install
npm run dev
```
Open the printed local URL (usually http://localhost:5173).

## Build for production
```bash
npm run build
```
This creates a `dist/` folder — deploy that to Netlify, Vercel, or GitHub Pages.

## Deploying to Netlify
- Drag-and-drop the `dist` folder onto Netlify, OR
- Connect the GitHub repo and set:
  - Build command: `npm run build`
  - Publish directory: `dist`

## Editing content
Almost everything (skills, tech logos, email/GitHub links) lives in
`src/data/content.js` — no need to touch the components to update text.
