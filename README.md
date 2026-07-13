# Neritix

Marketing / product website for **Neritix — Continental Shelf Intelligence Delivery**.

A single-page site built with **React 19 + Vite 7 + Tailwind CSS v4**. It's a static
site: `npm run build` produces plain HTML/CSS/JS that is served by our web host
(Neoserv). There is no backend.

## How changes go live

Every push to the **`main`** branch triggers GitHub Actions, which builds the site and
uploads it to Neoserv automatically. **You never zip or upload anything by hand** — just
push to `main` and the site updates in ~2 minutes.

Check a deploy's status under the repo's **Actions** tab (green ✓ = live).

> Designers: see **[DESIGNER_GUIDE.md](./DESIGNER_GUIDE.md)** for a plain-English
> walkthrough of editing text and design and pushing your changes.
>
> AI coding agents (Claude Code, etc.): read **[CLAUDE.md](./CLAUDE.md)** first — it maps
> where everything lives and the deploy rules.

## Run it locally

Requires [Node.js](https://nodejs.org) 20+.

```bash
npm install        # first time only
npm run dev        # start the dev server → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build locally
npm run lint       # check code style
```

## Where things live

| You want to change… | Edit… |
| --- | --- |
| Any on-page **text / copy** | the relevant file in `src/components/*.jsx` (see CLAUDE.md for the map) |
| **Colors and fonts** | the `@theme` block at the top of `src/index.css` |
| **Demo data** (charts, map, pricing) | `public/data/*.json` |

## Environment variables

Local dev reads `.env.local` (git-ignored — never commit it). In CI/production these are
provided as **GitHub Actions secrets**.

| Variable | Purpose | Notes |
| --- | --- | --- |
| `VITE_MAPBOX_TOKEN` | Mapbox map in the Data Portal | Public `pk.` token; required or the map is blank |
| `VITE_EMAILJS_SERVICE_ID` | Contact / pilot-access form | Optional — form runs in demo mode when unset |
| `VITE_EMAILJS_TEMPLATE_ID` | Contact / pilot-access form | Optional |
| `VITE_EMAILJS_PUBLIC_KEY` | Contact / pilot-access form | Optional |

## Tech stack

React 19, Vite 7, Tailwind CSS v4 (config lives in `src/index.css`, not a JS file),
Framer Motion (animations), Recharts (charts), Mapbox GL (map), EmailJS (contact form),
Vercel Analytics + Speed Insights. Hosting: Neoserv (Apache; SPA routing via
`public/.htaccess`).
