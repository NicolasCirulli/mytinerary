# Mytinerary — Travel Like a Local

Discover unique itineraries curated by the people who know their cities best. Find your perfect trip, designed by insiders who know and love their cities.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build | Vite 7 + SWC |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| Theme | CSS variables + dark mode (class strategy) |
| HTTP | Axios |
| SEO | react-helmet-async |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with HMR |
| `pnpm build` | Type-check + production build |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Run ESLint |

## Project Structure

```
src/
├── app/
│   └── routes/
│       └── Router.tsx          # Route definitions with lazy loading
├── assets/                     # Static assets
├── features/                   # Feature-based modules
│   ├── auth/                   # Authentication (login, hooks)
│   ├── cities/                 # Cities (components, hooks, services, types)
│   ├── intineraries/           # Itineraries (types, services, hooks)
├── pages/                      # Page components (one per route)
│   ├── home/
│   ├── cities/
│   ├── itineraries/            # Itinerary detail page + activities
│   └── login/
└── shared/                     # Shared code
    ├── api/                    # Axios client with auth interceptor
    ├── components/             # Layout, Header, Footer, PageLoader
    ├── context/                # ThemeContext (dark/light mode)
    ├── icons/                  # SVG icon components
    └── seo/                    # Helmet SEO + structured data
```

## Architecture

**Feature-based** — each domain (auth, cities, itineraries) is self-contained with its own components, hooks, services, and types. Shared code lives in `shared/`.

**Code splitting** — routes use `React.lazy()` for on-demand loading. The initial bundle includes only MainLayout and HomePage; Cities, City Details, and Login load on navigation.

**Theme** — dark/light mode via CSS custom properties (`--background`, `--foreground`, etc.) toggled by a `.dark` class on `<html>`. No `dark:` prefix needed.

## API

The app expects a backend at `http://localhost:8080/api` with the following endpoints:

- `GET /api/cities` — list all cities
- `GET /api/cities/:id` — get city by ID
- `GET /api/itineraries/city/:cityId` — list itineraries by city
- `GET /api/itineraries/:id/activities` — list activities for an itinerary
- `POST /api/itineraries/:id/activities` — create activity
- `PUT /api/itineraries/:id/activities/:activityId` — update activity
- `DELETE /api/itineraries/:id/activities/:activityId` — delete activity

Authentication tokens are stored in `localStorage` and sent via `Authorization: Bearer` header.

## Features

- [x] Home page with hero and featured destinations
- [x] Cities listing with search/filter
- [x] City detail page with itineraries
- [x] Login form with social login buttons
- [x] Dark/light theme toggle
- [x] Responsive design (mobile-first)
- [x] SEO meta tags (Open Graph, Twitter Cards)
- [x] Structured data (JSON-LD Organization)
- [x] Accessibility (WCAG 2.2: focus-visible, skip link, reduced motion, focus trap)
- [x] Itinerary detail views (`/itineraries/:id`) with activities grid
- [x] Activities management (CRUD) via admin panel
- [x] User registration
