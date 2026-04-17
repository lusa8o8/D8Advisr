# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
D8Advisr is an AI-powered date and group experience
planning app for Lusaka, Zambia.
- Live URL: https://d8advisr.trymyapp.uk
- Repo: https://github.com/lusa8o8/D8Advisr.git
- Stack: Next.js 14 App Router + TypeScript +
  Tailwind CSS + Supabase + Anthropic Claude API

## Commands
```bash
npm run dev       # Start development server (port 3000)
npm run build     # Production build — ALWAYS run before commit
npm run lint      # ESLint check
npm run seed:venues  # Seed Lusaka venues (tsx script)
```

## Critical Rules — NEVER VIOLATE
- NEVER modify .env.local
- NEVER modify src/lib/supabase/server.ts
- NEVER modify src/lib/supabase/client.ts
- ALWAYS read a file before editing it
- ALWAYS run npm run build before committing
- NEVER invent column names — check schema first
- NEVER use getSession() — always use getUser()

## Architecture

### Route Groups
- src/app/(auth)/ — unauthenticated routes: /, /signup, /login, /onboarding
- src/app/(main)/ — protected routes: /home, /plans, /profile, /budget, /map, /notifications, /badges
- src/app/(admin)/ — admin only: /curator
- src/app/api/ — API routes (server-side only)

### Middleware (`src/middleware.ts`)
`protectedPrefixes` array controls which routes require auth.
Add new protected routes to this array when creating new pages.
Unauthenticated → redirects to /
Authenticated on / → redirects to /home

### Component Pattern
Every screen follows:
```
src/app/(main)/[route]/page.tsx     → server component, fetches Supabase data, passes as props
src/components/screens/Screen##Name.tsx → "use client", handles all UI and interactions
```
Small reusable UI pieces live in `src/components/ui/`.
Client-only state that needs localStorage belongs in a dedicated `src/components/ui/` component, not inside a server page.

### Supabase Clients
- `src/lib/supabase/server.ts` → server components + API route handlers
- `src/lib/supabase/client.ts` → `supabaseBrowserClient` singleton for client components
- `src/lib/supabase/service.ts` → service role, admin operations only

### New DB Tables Not in Generated Types
Use `(supabase as any).from("table_name")` to avoid TypeScript errors when working with tables added after the last type generation (e.g. `sinking_funds`, `fund_transactions`).

## Database Schema

### Key Tables
```
plans:                id, user_id, title, city, estimated_cost, currency,
                      duration_minutes, occasion, vibe, participant_count,
                      source, status, created_at, updated_at
                      status: 'draft'|'saved'|'active'|'completed'|'rejected'
                      source: 'agent'|'curated'|'user'

plan_items:           id, plan_id, venue_id, order_index, activity_type,
                      estimated_time_minutes, estimated_cost, time_slot, notes

venues:               id, name, category, activity_type, address, city,
                      price_level, confidence_score, is_active, lat, lng
                      city: always 'Lusaka' for MVP

users:                id, email, name, city, currency, created_at, is_admin

user_preferences:     id, user_id, budget_preference, activity_preferences,
                      default_vibe, group_size_preference, last_updated

experience_logs:      id, user_id, plan_id, actual_cost, currency,
                      overall_rating, notes, highlights, created_at

experience_venue_feedback: id, experience_id, venue_id, actual_price,
                           venue_quality_rating, value_rating, vibe_rating,
                           issue_flag, highlights

sinking_funds:        id, user_id, name, emoji, goal_amount, current_amount,
                      currency, auto_save_amount, auto_save_frequency,
                      status ('active'|'completed'|'archived'), is_locked,
                      created_at

fund_transactions:    id, fund_id, user_id, amount, type ('deposit'|'withdrawal'),
                      source ('manual'|'auto'), notes, created_at

events:               id, venue_id (FK→venues), title, description,
                      vibe_tags TEXT[], price NUMERIC(10,2), currency ('ZMW'),
                      starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
                      source ('manual'), is_active, created_at, updated_at
                      Migration: supabase/migrations/20260417000000_create_events_table.sql
```

### Supabase Project
URL: https://gsidytvxyhdzrkoijuvs.supabase.co
Admin user: lusamalungisha@gmail.com (is_admin: true)

## Design System

### Colors (EXACT — no substitutions)
```
Primary:    #FF5A5F (red)
Success:    #00C851 (green)
Warning:    #FF9500 (orange)
Background: #F7F7F7
Card:       #FFFFFF
Text dark:  #222222
Text mid:   #555555
Text light: #999999
Border:     #EBEBEB
```

### Typography
Font: Poppins (loaded via next/font/google)
Sizes: 10px, 11px, 12px, 14px, 15px, 16px, 17px, 22px, 24px, 26px, 28px, 32px

### Shadows (EXACT values)
```
Card:    shadow-[0_2px_10px_rgba(0,0,0,0.03)]
Large:   shadow-[0_8px_30px_rgba(0,0,0,0.08)]
Button:  shadow-[0_8px_20px_-6px_rgba(255,90,95,0.5)]
Green:   shadow-[0_8px_20px_-6px_rgba(0,200,81,0.5)]
Nav:     shadow-[0_-10px_40px_rgba(0,0,0,0.03)]
FAB:     shadow-[0_8px_25px_-6px_rgba(255,90,95,0.6)]
```

### Border Radius
```
Buttons:  rounded-xl (12px)
Cards:    rounded-3xl (24px)
Pills:    rounded-full
Inputs:   rounded-xl
Small:    rounded-2xl (16px)
```

### Button Patterns
```
Primary:   bg-[#FF5A5F] text-white py-[18px] rounded-xl
           font-bold text-[17px] active:scale-[0.98]
           shadow-[0_8px_20px_-6px_rgba(255,90,95,0.5)]
Secondary: bg-white border-2 border-[#EBEBEB] py-[18px]
           rounded-xl font-semibold text-[16px]
Icon btn:  w-10 h-10 bg-[#F7F7F7] rounded-full
```

### Bottom Action Bar Pattern
```
fixed bottom-0 left-0 right-0 bg-white
border-t border-[#EBEBEB] p-6 flex gap-4 z-20
shadow-[0_-10px_20px_rgba(0,0,0,0.03)]
```

### Bottom Nav Pattern
```
fixed bottom-0 left-0 right-0 bg-white
border-t border-[#EBEBEB] pb-8 pt-4 px-8
flex justify-between items-center z-20
rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.03)]
3 tabs: Home (/home) | Plans (/plans) | Profile (/profile)
Active: text-[#FF5A5F] strokeWidth=2.5 font-bold
Inactive: text-[#999999] strokeWidth=2 font-medium
```

## Currency
Always display as K{amount} — e.g. K450, K200
Never use $ or USD. Currency is ZMW (Zambian Kwacha).

## AI Plan Generation
Endpoint: POST /api/plans/generate-ai
Model: claude-sonnet-4-20250514
Venues pre-filtered by: city='Lusaka', is_active=true
Budget maps to price_level:
  < K200   → price_level 1-2
  K200-400 → price_level 2-3
  > K400   → all levels
Returns: { plan_id, plan, planner_note }

## API Routes
```
GET/POST /api/user/funds              — sinking funds CRUD (create/deposit/withdraw)
GET/POST /api/user/budget             — monthly budget goal get/set
GET/POST /api/user/preferences        — user preference read/write
GET      /api/user/stats              — user stats (plan count, spend)
POST     /api/plans/generate          — rule-based plan generation
POST     /api/plans/generate-ai       — Claude AI plan generation
GET/POST /api/plans/[id]/items        — plan stop management
POST     /api/plans/[id]/feedback     — submit feedback + update experience_logs
GET/POST /api/venues/[id]             — venue detail fetch
GET      /api/venues/search           — venue search with filters
GET/POST/PATCH/DELETE /api/admin/venues — admin venue CRUD
                                         GET ?mode=approved → approved venues list
                                         GET (default) → raw_venues queue
                                         POST action=approve → promote raw_venue
                                         POST action=manual → direct curator add
                                         PATCH field+venue_id → field update / image ops
                                         DELETE ?id= → reject raw_venue
                                         DELETE body{venue_id} → soft-delete venue
GET/POST/PATCH/DELETE /api/admin/events — admin events CRUD
                                         GET ?venue_id= → events for one venue
                                         POST → create event (manual)
                                         PATCH {event_id, ...fields} → update event
                                         DELETE {event_id} → hard delete event
```

## localStorage Keys
```
d8_avatar_emoji             — selected emoji avatar (ProfileAvatar component)
d8_notify_venue_${venue.id} — notify toggle per venue (Screen07VenueDetail)
d8advisr-install-dismissed  — PWA install banner dismissed flag (InstallPrompt component)
```

## Screen Inventory
```
01 Welcome           /
02 Auth              /signup, /login
03 Preferences       /onboarding/preferences  (4-step onboarding flow)
04 Home              /home
05 Map               /map
06 Filter Modal      (component on /home)
07 Venue Detail      /venues/[id]             (4 tabs: Overview/Events/Reviews/Location)
08 Plan Generator    /plans/generate          (D8 animated loading overlay)
09 Plan Overview     /plans/[id]/overview
10 Plan Detail       /plans/[id]
11 Plan Edit         /plans/[id]/edit
12 Execution Tracker /plans/[id]/execute
13 Feedback          /plans/[id]/feedback
14 Profile           /profile
15 Preferences Edit  /profile/preferences
16 Budget            /budget                  (monthly budget + sinking funds "Stash")
17 Group Plan        /plans/generate?mode=group
18 Notifications     /notifications
19 Review Complete   /plans/[id]/review-complete
20 Badges            /badges
    Admin/Curator    /curator
```

## PWA
```
public/manifest.json                     — web app manifest (theme #FF5A5F, standalone, portrait)
public/sw.js                             — service worker, network-first, /offline.html fallback
public/offline.html                      — branded offline page
public/icons/icon-192.png               — generated from icon.svg via scripts/generate-icons.js
public/icons/icon-512.png               — generated from icon.svg via scripts/generate-icons.js
src/components/ServiceWorkerRegistration.tsx — registers /sw.js on window load (use client)
src/components/InstallPrompt.tsx         — beforeinstallprompt banner, localStorage dismissed flag
```
To regenerate icons: `node scripts/generate-icons.js` (requires sharp devDep)

## Known Deferred Items
- Map venue pins use hardcoded positions (no real lat/lng in DB yet)
- Latitude 15° venue not appearing in home feed (confidence_score filter)
- Share to Feed button (post-MVP)
- WhatsApp retention channel (post-MVP)
- Partner portal (post-MVP)
- Admin portal replacing /curator (post-MVP)

## Git Convention
Commit format: `type: short description`
Types: feat, fix, refactor, style, docs
Always push after every change.
