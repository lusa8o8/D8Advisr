# D8Advisr

AI-powered date and group experience planning app for Lusaka, Zambia.

- **Live**: https://d8advisr.trymyapp.uk
- **Stack**: Next.js 14 App Router · TypeScript · Tailwind CSS · Supabase · Anthropic Claude API
- **PWA**: Installable on mobile (manifest + service worker)

---

## Getting Started

```bash
npm install
npm run dev        # dev server at http://localhost:3000
npm run build      # production build — run before every commit
npm run lint       # ESLint
```

---

## Project Structure

```
src/
  app/
    (auth)/          # Unauthenticated routes: /, /signup, /login, /onboarding
    (main)/          # Protected routes: /home, /plans, /profile, /budget, /map, …
    (admin)/         # Admin only: /curator
    api/             # Server-side API routes
  components/
    screens/         # Screen##Name.tsx — "use client" UI components
    layout/          # BottomNav, TopBar
    ui/              # Small reusable pieces
  lib/
    constants/       # venue-categories.ts and other shared constants
    supabase/        # server, client, service Supabase clients
    services/        # normalization, AI plan generation
  types/             # TypeScript types (database.ts, etc.)
public/
  manifest.json      # PWA manifest
  sw.js              # Service worker (network-first)
  offline.html       # Offline fallback page
  icons/             # icon-192.png, icon-512.png (generated via scripts/generate-icons.js)
supabase/
  migrations/        # SQL migration files
scripts/
  generate-icons.js  # Generates PWA icons from public/icons/icon.svg using sharp
```

---

## PWA

D8Advisr is a fully installable PWA:

- **Manifest**: `public/manifest.json` — theme color `#FF5A5F`, standalone display, portrait orientation
- **Service worker**: `public/sw.js` — network-first strategy; falls back to `/offline.html` for navigation requests
- **Offline page**: `public/offline.html` — branded fallback with "Try Again" button
- **Install prompt**: `src/components/InstallPrompt.tsx` — bottom banner triggered by `beforeinstallprompt`; dismissed state persisted in `localStorage` under key `d8advisr-install-dismissed`
- **SW registration**: `src/components/ServiceWorkerRegistration.tsx` — registers `/sw.js` on `window.load`

To regenerate icons after changing `public/icons/icon.svg`:

```bash
node scripts/generate-icons.js
```

---

## Key API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/venues/search` | Venue search with filters |
| GET | `/api/venues/[id]` | Venue detail |
| POST | `/api/plans/generate` | Rule-based plan generation |
| POST | `/api/plans/generate-ai` | Claude AI plan generation |
| GET/POST | `/api/plans/[id]/items` | Plan stop management |
| POST | `/api/plans/[id]/feedback` | Submit post-date feedback |
| GET/POST/PATCH/DELETE | `/api/admin/venues` | Admin venue CRUD |
| GET/POST/PATCH/DELETE | `/api/admin/events` | Admin events CRUD |
| GET/POST | `/api/user/funds` | Sinking funds |
| GET/POST | `/api/user/budget` | Monthly budget goal |
| GET/POST | `/api/user/preferences` | User preferences |

---

## Supabase

- **Project URL**: https://gsidytvxyhdzrkoijuvs.supabase.co
- **Admin user**: lusamalungisha@gmail.com (`is_admin: true`)
- Run migrations in `supabase/migrations/` against the project before deploying new features that add tables.

---

## Design Tokens

| Token | Value |
|-------|-------|
| Primary | `#FF5A5F` |
| Success | `#00C851` |
| Warning | `#FF9500` |
| Background | `#F7F7F7` |
| Card | `#FFFFFF` |
| Text dark | `#222222` |
| Font | Poppins (via next/font/google) |
| Currency | ZMW — always displayed as `K{amount}` |

---

## Git Convention

```
feat:     new feature
fix:      bug fix
refactor: code restructure, no behaviour change
style:    visual/CSS only
docs:     documentation
```

Always run `npm run build` before committing. Always push after every change.
