# D8Advisr UI Update Plan
**Source of truth — lock before any code writes.**
Generated: 2026-04-09

---

## Overview
Full UI refresh across all 22 screens, mapping every reference page in
`tmp_replit_pages/` to the corresponding live component. Logic untouched.
Strictly visual.

---

## Adaptation Rules (locked — apply to every screen)

| Rule | Description |
|------|-------------|
| Routing | `setLocation(path)` → `router.push(path)` (Next.js, already used everywhere) |
| `cn` import | From `@/lib/utils` — NOT from `@/components/SharedUI` (that file doesn't exist) |
| TopBar | `import TopBar from "@/components/layout/TopBar"` |
| BottomNav | `import BottomNav from "@/components/layout/BottomNav"` |
| Currency | Replace all static `$` and `₦` display text with `K`. Dynamic values from DB already use `K` via existing logic — do not touch. |
| Images | Reference uses Unsplash `<img>` tags. Our DB has no `image_url`. Keep existing gradient placeholders. Do NOT add external image URLs. |
| `bg-primary/8` | Not valid Tailwind — use `bg-primary/10` instead |
| CSS variables | `bg-primary`, `text-foreground`, `bg-card`, `bg-background`, `text-muted-foreground`, `border-border` all map correctly via `globals.css` — safe to use |
| Auth screens | Preserve all existing form logic (zodResolver, react-hook-form, supabase calls). Update visual markup only. |
| Logic boundary | No changes to: API calls, data-fetch props, state initialization values, Supabase calls, routing guards, localStorage keys |

---

## Screen-by-Screen Comparison & Update Scope

### 01 — Welcome
- **File**: `src/components/screens/Screen01Welcome.tsx`
- **Reference**: `Welcome.tsx`
- **Diff**: Nearly identical. Minor token cleanup — use CSS variable classes (`text-primary`, `border-border`) instead of hardcoded hex where ref uses them. Shadow on logo box. `flex-1` layout wrapper.
- **Scope**: Small

---

### 02 — Auth (Signup / Login)
- **File**: `src/components/screens/Screen02Auth.tsx`
- **Reference**: `SignUp.tsx`
- **Diff**: Outer wrapper changes from centered flex → card-based layout. Card gets `bg-card rounded-3xl p-8 shadow-sm border border-border`. Password eye icon switches from text "Show/Hide" → `Eye`/`EyeOff` lucide icons. Input focus ring uses `focus:border-primary focus:ring-1 focus:ring-primary`. Bottom "sign in / sign up" link style tweaks.
- **Keep intact**: All form logic, zodResolver, supabase auth, Google OAuth handler, error display, loading states.
- **Scope**: Moderate

---

### 03 — Onboarding Preferences
- **File**: `src/components/screens/Screen03Preferences.tsx`
- **Reference**: `InitialPreferences.tsx`
- **Diff**: Significant visual overhaul. New step 1 = plan type selector (cards with check circles). Step 2 = vibes + budget (existing, but vibe chips add emoji). Step 3 = city selector (Lusaka live, 2 Coming Soon cities). Step 4 = promise/celebration screen (new). Progress bar segments replace number indicator. Bottom fixed CTA button pattern.
- **City adaptation**: Lusaka (🇿🇲, Available now), Nairobi (🇰🇪, Coming Soon), Johannesburg (🇿🇦, Coming Soon).
- **Keep intact**: All `useState`, step transitions, API call on final submit, router.push to `/home`.
- **Scope**: Large

---

### 04 — Home Discovery
- **File**: `src/components/screens/Screen04Home.tsx`
- **Reference**: `HomeDiscovery.tsx`
- **Diff (carbon-copy pass 2026-04-15)**:
  1. Experience cards: gradient bg + `bg-gradient-to-t from-black/50 via-black/20 to-transparent` overlay, emoji absolutely centered, urgency badge top-right (`bg-white/90 text-[#FF9500]`), vibe pills bottom-left (VIBE_COLORS map), price bottom-right — `mb-2.5` on date line.
  2. Venue cards: add `bg-gradient-to-t from-black/40 via-transparent to-black/10` dark overlay on hero, event badge bottom-right (`bg-black/55`, heuristic for bar/activity), description line using `activity_type` (`text-[14px] leading-relaxed line-clamp-2`).
  3. Tabs: align to ref `['All', 'Date Night', 'Adventure', 'Foodie', 'Group']` — update `matchesCategoryFilter` for "Foodie" (same as Food) and "Group" (show all).
- **Post-inspection fix (2026-04-15)**: Venue category row was showing `activity_type` twice (`venue.category · venue.activity_type` + description paragraph). Fixed by removing `activity_type` from the category row — only `venue.category` shown there. Description paragraph keeps `activity_type`.
- **Keep intact**: All filter state, search logic, distance calc, fetch-on-filter, FAB, router.push calls.
- **Scope**: Large
- **Verified**: ✅ User confirmed clean on phone

---

### 05 — Map
- **File**: `src/components/screens/Screen05Map.tsx`
- **Reference**: `MapView.tsx`
- **Diff**: Overlay top bar switches to logo + Feed/Map pill toggle floating over map. Search bar repositioned as overlay. Selected venue bottom sheet (peek card) redesigned — image area (gradient), rating, price badge.
- **Keep intact**: All existing map logic, venue pins, `router.push` calls.
- **Scope**: Moderate

---

### 06 — Filter Modal
- **File**: `src/components/screens/Screen06FilterModal.tsx`
- **Reference**: Filter section embedded in `HomeDiscovery.tsx`
- **Diff**: Category chips get `bg-primary` active state (not just border change). Price range gets visual two-handle representation. New Date row (4-column date grid — Today/Tomorrow/Sat/Sun). Reset + Apply button row at bottom.
- **Keep intact**: All existing FilterState props, `onApply`, `onReset` callbacks, slider logic.
- **Scope**: Moderate

---

### 07 — Venue Detail
- **File**: `src/components/screens/Screen07VenueDetail.tsx`
- **Reference**: `VenueDetails.tsx`
- **Diff**:
  - Hero image area: `h-72 rounded-b-[40px]` gradient (no real image). Back + Share buttons as glassmorphism overlays.
  - Main info card: overlapping with `-mt-8 z-10`, category pill + cost badge.
  - Tab underline indicator (absolute positioned `h-1 bg-primary rounded-t-full`).
  - Events tab: notify toggle with real toggle UI, event cards with image strip.
  - Reviews tab: aggregate score card with rating breakdown bars, vibe tags, individual review cards, "helpful" count.
  - Location tab: map placeholder image, address card + copy button, Getting There section (Walking + Yango + Parking), "Make a Night of It" (nearby venues), Neighbourhood context dark card.
  - Bottom action bar: Heart icon button + "Add to Plan" button.
- **Keep intact**: All existing tab state, `router.push`, notify localStorage logic, venue data props.
- **Scope**: Very Large

---

### 08 — Plan Generator
- **File**: `src/components/screens/Screen08PlanGenerator.tsx`
- **Reference**: `PlanGenerator.tsx`
- **Diff**:
  - Loading animation: already matches reference (D8 comet animation) — no change needed.
  - Full form mode: Solo/Group toggle, Occasion chips, Vibe/Mood chips, When text input, Budget input with `K` prefix. Generate button at bottom.
  - Build-around mode: locked venue card with "Anchored stop" pill. When/Who/Budget steps. Fixed CTA.
- **Post-inspection fix (2026-04-15)**: Build-around mode was not implemented — showed full form even when `venue_id` in URL. Fixed by adding `BuildAroundMode` sub-component:
  - Activates when both `venue_id` AND `venue_name` search params are present
  - Locked venue card: emoji (from `CATEGORY_EMOJIS[venueCategory]`), name, category, "Anchored stop" pill, lock icon
  - When? pills: Tonight / Tomorrow / This Weekend (`bg-foreground text-card` active)
  - Who's joining? 2×2 grid with emoji + label (`bg-primary` active); maps to group_size: couple→2, solo→1, small→3, large→6
  - Budget slider: `BUDGET_STEPS = [250, 500, 750, 1000, 1500, 2000, 3000]` (K ZMW)
  - Fixed CTA: "Build My Evening ✨" + "{venueName} will be your confirmed stop"
  - All wired to existing `/api/plans/generate-ai` endpoint via `handleGenerate` overrides — no backend changes
  - Screen07 updated to pass `venue_category` in URL alongside `venue_id` + `venue_name`
- **Keep intact**: All existing `useSearchParams` reading, `/api/plans/generate-ai` API call, router.push after generation, loading state, D8LoadingOverlay.
- **Scope**: Large
- **Verified**: ✅ User confirmed clean on phone

---

### 09 — Plan Overview
- **File**: `src/components/screens/Screen09PlanOverview.tsx`
- **Reference**: `PlanOverview.tsx`
- **Diff**:
  - Dark hero section (`bg-[#141414]`) with ambient glows, Sparkles icon, plan title, time/location/stops meta.
  - Stop cards: image strip (gradient), stop number circle, time badge, tier badge (Verified/D8 Approved/Hidden Gem), emoji, cost per person.
  - Transport connectors between stops: walk/ride icon in circle, detail line.
  - Cost breakdown card with per-stop rows + transport row + grand total.
  - Stash CTA card (amber gradient, fund progress bar, amount info).
  - Share nudge button.
  - Action bar: Regenerate icon button + Save Plan button (turns green on save).
- **Keep intact**: All existing plan data props, `router.push` calls, save API call, plan items mapping.
- **Scope**: Very Large

---

### 10 — Plan Detail
- **File**: `src/components/screens/Screen10PlanDetail.tsx`
- **Reference**: `PlanDetail.tsx`
- **Diff**: Sticky header with status pill (Upcoming/Completed badge), Share button. Timeline uses vertical line connector `before:` pseudo-element. Steps show cost next to venue name. Cost Review card with budget bar.
- **Keep intact**: All existing plan props, item mapping, router.push.
- **Scope**: Moderate

---

### 11 — Plan Edit
- **File**: `src/components/screens/Screen11PlanEdit.tsx`
- **Reference**: `PlanEdit.tsx`
- **Diff**: Section headers use `text-sm uppercase tracking-wider text-muted-foreground`. Item cards get `GripVertical` drag handle (visual only, no drag logic). Budget slider card. Notes textarea. Cancel + Save Changes in fixed bottom bar.
- **Keep intact**: All existing save logic, item state, API calls.
- **Scope**: Small-Moderate

---

### 12 — Execution Tracker
- **File**: `src/components/screens/Screen12ExecutionTracker.tsx`
- **Reference**: `ExecutionTracker.tsx`
- **Diff**: Step progress bar redesigned (circle nodes + line connector, active step has glow ring). Current step card has "IN PROGRESS" animated pill. Navigation active card. Mark Complete → green button. Next step preview card (dashed border). Footer quick actions: Call Venue / Share Live / Get Help (circular buttons).
- **Post-inspection fix (2026-04-15)**:
  - IN PROGRESS pill: `bg-primary/5` → `bg-[#FFF0F1]` (exact reference token)
  - Mark Complete: removed Directions button alongside it; now single `w-full` button matching reference exactly (`py-4` height)
  - Up Next arrow: `→` text → `📍` emoji circle (reference uses venue-specific emoji; 📍 used as dynamic fallback)
  - Footer: `left-0 right-0` → `w-full max-w-[430px]` matching reference
- **Keep intact**: All existing step state, completion router.push, modal flow, completion check logic.
- **Scope**: Moderate
- **Verified**: ✅ User confirmed "you're on your date screen is clean"

---

### 13 — Feedback (Post-Date Review)
- **File**: `src/components/screens/Screen13Feedback.tsx`
- **Reference**: `PostDateReview.tsx`
- **Diff**: 3-step flow (Mood → Rate Stops → Notes/Tags). Step 1: emoji mood picker list with border selection. Step 2: stop-by-stop dot ratings (Vibe + Value). Step 3: textarea + vibe tag chips (max 3). Progress bar segments at top. Back nav between steps. Skip button on steps 2 and 3.
- **Keep intact**: All existing submit API call (triggered on final step submit), router.push after submit, plan data props for stop names.
- **Scope**: Large

---

### 14 — Profile
- **File**: `src/app/(main)/profile/page.tsx` (server component — unique case)
- **Reference**: `ProfileOverview.tsx`
- **Architecture note**: Profile is currently built inline in `page.tsx` (not using `Screen14.tsx`). `ProfileAvatar` component handles avatar picker separately. The reference embeds the avatar picker in the profile component. Since `ProfileAvatar` already handles this as a separate client component, we keep that separation.
- **Diff**:
  - Header: Full-bleed `bg-primary` banner with `rounded-b-[40px]`, Settings gear button top-right (links to `/profile/preferences`), taller `pb-20` to allow card overlap.
  - Profile card: overlapping `-mt-16 z-10`, avatar at top (handled by `ProfileAvatar`), name + member since + email, stats grid.
  - Stats grid: font sizes upgrade — `text-2xl font-black`. Labels use `uppercase tracking-wider`.
  - Badges section: horizontal scroll row with `min-w-[85px] h-[85px]` cards, plus one locked slot.
  - Menu: `bg-card rounded-3xl p-2`, icon buttons use `w-10 h-10 rounded-full bg-background border border-border`.
  - Recent Plans: emoji icon in colored bg box (`w-14 h-14 rounded-2xl`), star rating display.
  - Sign out: `w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl border border-border`.
  - Version tag: `D8Advisr · v1.0` at bottom.
- **Keep intact**: All server-side data fetching, Supabase queries, `SignOutButton` component usage, `ProfileAvatar` component usage, all Link hrefs.
- **Scope**: Moderate-Large (inline server component, careful surgical edits)

---

### 15 — Preferences Edit
- **File**: `src/components/screens/Screen15Preferences.tsx`
- **Reference**: `PreferenceEdit.tsx`
- **Diff**: Section headers `font-bold text-foreground text-[16px]`. Chips: primary active state (`bg-primary text-primary-foreground shadow-md`). Budget slider in card (`bg-card rounded-3xl p-6 border border-border shadow-sm`). Veg/Vegan toggle card. Fixed bottom bar with Save button.
- **Keep intact**: All existing preference state, API save call, router.push.
- **Scope**: Moderate

---

### 16 — Budget / Stash
- **File**: `src/components/screens/Screen16Budget.tsx`
- **Reference**: `BudgetDashboard.tsx`
- **Diff**:
  - Header: centered with subtitle "Saving for the good stuff".
  - New: **Total hero strip** — dark card showing total across all funds, unlocked count, goal.
  - Fund cards: add `WarmthDots` (4 weekly dots with orange glow), **milestone bars** (25/50/75% tick marks), type badge pill (Experience/Group/Anniversary/Milestone).
  - Expanded fund: "Stash" button (Add) + "Edit fund" button.
  - New: **Recent Activity** section at bottom — transaction rows with icon, label, sub, amount.
  - Create Fund sheet: type selector grid first, then name/goal/auto-save form.
- **Post-cleanup (2026-04-15)**: Monthly budget section removed entirely (month nav, budget card, this-month's-plans list, goal setter). `Screen16BudgetProps` simplified to `{ initialFunds: SinkingFund[] }` only. `budget/page.tsx` drops `getBudgetSummary` call + preferences fetch — now just fetches sinking funds. Recent Activity stays static until a real fintech partner API is available.
- **Keep intact**: All existing sinking fund state, deposit/withdraw handlers, create fund API call.
- **Scope**: Large

---

### 17 — Group Plan
- **File**: `src/components/screens/Screen17GroupPlan.tsx`
- **Reference**: `CreateGroupPlan.tsx`
- **Diff**: Center hero with Users icon in blue circle. Group name input styling. Members section as card with overlapping avatar circles + plus button. Occasion chips (pill style). Date + budget inputs in row. Generate button.
- **Keep intact**: All existing form state and router.push.
- **Scope**: Small

---

### 18 — Notifications
- **File**: `src/components/screens/Screen18Notifications.tsx`
- **Reference**: `NotificationsCenter.tsx`
- **Diff**: Notification rows get left-border accent (`border-l-4`) with color per type (primary = date reminder, amber = vibe match, sky = event, green = confirmed, orange = budget). Vibe-matched notifications get action buttons (View Event / Not for me). "Mark all read" button top-right. Section divider "Earlier this week".
- **Keep intact**: All existing notification data props, router.push calls, dismiss logic.
- **Scope**: Moderate

---

### 19 — Review Complete
- **File**: `src/components/screens/Screen19ReviewComplete.tsx`
- **Reference**: `ReviewComplete.tsx`
- **Diff**: Full dark background (`bg-[#141414]`). Ambient glow blobs. Sparkles icon in gradient badge with green star badge overlay. "Thanks for keeping it real" heading. Feedback copy. Badge unlock card (white/10 glass). Plan credit line. Two action buttons (Plan another evening + Back to Home).
- **Keep intact**: All existing router.push targets.
- **Scope**: Moderate

---

### 20 — Badges
- **File**: `src/components/screens/Screen20Badges.tsx`
- **Reference**: `BadgesPage.tsx`
- **Diff**: Stats strip (Earned / In Progress / Locked counts in 3-col divider card). Earned section: 2-col grid with colored border cards (emoji, name, desc, rarity, earned date). In Progress: list with progress bars and current/total. Locked: 2-col grid, grayscale emoji, dashed border, lock icon overlay.
- **Keep intact**: All existing badge data props, router.push.
- **Scope**: Moderate

---

### Plans List (Saved Plans)
- **File**: `src/components/screens/PlansClient.tsx`
- **Reference**: `SavedPlans.tsx`
- **Diff**:
  - Header: sticky, `bg-white border-b border-gray-100 shadow-sm`, plan count sub-line.
  - Plan cards: full-width button, **gradient color header band** (`h-2 bg-gradient-to-r` per plan type), emoji in `w-12 h-12 rounded-2xl bg-gray-50` box, type icon row, status pill, meta row (Calendar + Clock + MapPin + stops count), location tag chips, cost row with rating stars or action pill.
  - "Plan a new evening" dashed button at bottom.
  - Filter button icon top-right.
- **Keep intact**: All existing filter state, plan data props, Link hrefs, status mapping.
- **Scope**: Large

---

### Admin / Curator
- **File**: `src/components/admin/QuickAddForm.tsx`
- **Reference**: `AdminPanel.tsx`
- **⚠️ FLAG — See ambiguities section below.**

---

## Missing Pages

| Item | Status |
|------|--------|
| `not-found.tsx` | Reference has a 404 page. App uses Next.js default. **See flag below.** |
| Login page | `SignUp.tsx` ref covers both modes via `Screen02Auth.tsx`. No separate login ref needed. ✅ |

---

## BottomNav & TopBar
- **BottomNav**: Already matches reference pattern. Minor: ensure active state uses `bg-foreground text-card` on the active pill if the reference uses it. Currently uses `text-[#FF5A5F]`. Keeping existing behaviour — no change needed.
- **BottomNav z-index fix (2026-04-15)**: BottomNav was `z-20` and rendered after `{children}` in layout, so it painted over screen-level fixed action bars (Screen07, 09, 10, 11, 12, 13). Fixed: BottomNav → `z-10`, all screen action bars kept at `z-20`. Universal unblock confirmed.
- **TopBar**: Check if reference `TopBar` from SharedUI has visual differences. Minor styling pass if needed.

---

## ✅ LOCKED DECISIONS (2026-04-09)

| Q | Decision |
|---|----------|
| Q1 Admin panel | **Skip** — leave QuickAddForm as-is |
| Q2 not-found page | **Skip** |
| Q3 Venue images | **A — Keep gradient placeholders** |
| Q4 City list | **B — Lusaka-only + "more cities coming" info card** |
| Q5 Budget warmth/type | **A — Visual-only heuristic decorations** |

**Status: ✅ COMPLETE — All 22 screens done + post-inspection fixes applied (2026-04-15)**

---

## Disciplined Flow (non-negotiable)

1. **Plan before code** — ambiguities resolved, plan locked, Q1–Q5 answered before any file write.
2. **Read before edit** — every file read in full before any edit. No blind writes.
3. **Visual only** — zero changes to API calls, Supabase queries, state init, routing guards, localStorage keys.
4. **Screen-by-screen** — one screen at a time, build verified after each batch.
5. **No scope creep** — if something looks broken in an untouched file, flag it; don't fix it.
6. **Docs updated when blocked** — if a rate limit or session break occurs, update progress tracker here before resuming.

---

## Progress Tracker

| # | Screen | File | Status | Session |
|---|--------|------|--------|---------|
| # | Screen | File | Status | Notes |
|---|--------|------|--------|-------|
| ✅ | BottomNav | layout/BottomNav.tsx | Done + fixed | z-20→z-10 unblocked all action bars |
| ✅ | 01 Welcome | Screen01Welcome.tsx | Done | Apr 9 |
| ✅ | 02 Auth | Screen02Auth.tsx | Done | Apr 9 |
| ✅ | 03 Preferences | Screen03Preferences.tsx | Done | Apr 9 |
| ✅ | 04 Home | Screen04Home.tsx | Done + verified | Post-fix: activity_type duplicate removed |
| ✅ | 05 Map | Screen05Map.tsx | Done | Apr 15 |
| ✅ | 06 Filter Modal | Screen06FilterModal.tsx | Done | Apr 9 |
| ✅ | 07 Venue Detail | Screen07VenueDetail.tsx | Done + fixed | categoryGradient added; passes venue_category to generator |
| ✅ | 08 Plan Generator | Screen08PlanGenerator.tsx | Done + verified | BuildAroundMode fully implemented |
| ✅ | 09 Plan Overview | Screen09PlanOverview.tsx | Done | Apr 9 |
| ✅ | 10 Plan Detail | Screen10PlanDetail.tsx | Done | Apr 9 |
| ✅ | 11 Plan Edit | Screen11PlanEdit.tsx | Done | Apr 9 |
| ✅ | 12 Execution Tracker | Screen12ExecutionTracker.tsx | Done + verified | Post-fix: pill color, single CTA, footer max-w |
| ✅ | 13 Feedback | Screen13Feedback.tsx | Done + verified | User confirmed feedback flow clean |
| ✅ | 14 Profile | profile/page.tsx | Done | Apr 15 |
| ✅ | 15 Preferences Edit | Screen15Preferences.tsx | Done | Apr 15 |
| ✅ | 16 Budget | Screen16Budget.tsx | Done | Apr 15 |
| ✅ | 17 Group Plan | Screen17GroupPlan.tsx | Done | Apr 15 |
| ✅ | 18 Notifications | Screen18Notifications.tsx | Done | Apr 15 |
| ✅ | 19 Review Complete | Screen19ReviewComplete.tsx | Done | Apr 9/15 |
| ✅ | 20 Badges | Screen20Badges.tsx | Done | Apr 9 |
| ✅ | Plans List | PlansClient.tsx | Done | Apr 15 |
| ⏭ | Admin/Curator | QuickAddForm.tsx | Skipped (Q1) | — |
| ⏭ | not-found | — | Skipped (Q2) | — |

---

## 🚩 ORIGINAL Ambiguities (resolved)

The following 5 items are ambiguous. I will NOT write any code until you resolve them.

---

**Q1 — Admin Panel**
`QuickAddForm.tsx` is a simple venue add form (~50 lines).
`AdminPanel.tsx` (reference) is a full curator system: venue health scores, tier badges, inspection dates, change log, field-level confidence indicators.
**Options:**
- **A**: Skip admin panel for this UI update pass (leave `QuickAddForm.tsx` as-is)
- **B**: Fully replace `/curator` UI to match `AdminPanel.tsx` reference

**→ Your choice:**

---

**Q2 — not-found page**
The reference includes a `not-found.tsx` page (404 screen with D8 branding + "Back to Home" button).
**Options:**
- **A**: Add `src/app/not-found.tsx` matching the reference
- **B**: Skip, keep Next.js default 404

**→ Your choice:**

---

**Q3 — Venue card images**
The reference uses `<img src="unsplash_url">` for venue card hero areas.
Our DB has no `image_url` column — venues only have `category` and `activity_type`.
**Options:**
- **A**: Keep existing gradient placeholders (emoji centered in gradient bg) — cleanest, no external deps
- **B**: Add hardcoded per-category Unsplash photo URLs as static fallbacks (e.g. all restaurants get the same photo) — feels richer but uses external URLs and looks repetitive

**→ Your choice:**

---

**Q4 — InitialPreferences city step**
Reference shows Lagos (live), London, Dubai (coming soon).
App is Lusaka-only.
**Options:**
- **A**: Lusaka 🇿🇲 (Available now), Nairobi 🇰🇪 (Coming Soon), Johannesburg 🇿🇦 (Coming Soon)
- **B**: Just show Lusaka (Available now) with a single "More cities coming" info card — no fake entries

**→ Your choice:**

---

**Q5 — BudgetDashboard "warmth dots" & type categories**
The reference `BudgetDashboard` has fund type categories (Experience / Group / Anniversary / Milestone) stored per fund.
Our `sinking_funds` table has no `type` column — only `name`, `emoji`, `goal_amount`, `current_amount`, etc.
The warmth dots (weekly streak tracking) also require data our DB doesn't store.
**Options:**
- **A**: Add warmth dots and type badges as **purely visual / static decorations** derived from heuristics (e.g., detect type from emoji or name substring). No DB changes.
- **B**: Skip warmth dots and type categories — only bring in the visual card style (milestone bar, dark card themes) without the data-dependent features.

**→ Your choice:**

---

## Execution Order (once plan is locked)

Screens will be updated in this order to catch shared component issues first:

1. `BottomNav.tsx` + `TopBar.tsx` (shared layout)
2. Screen01 Welcome
3. Screen02 Auth
4. Screen03 Preferences
5. Screen04 Home
6. Screen06 Filter Modal
7. Screen07 Venue Detail
8. Screen08 Plan Generator
9. Screen09 Plan Overview
10. Screen10 Plan Detail
11. Screen11 Plan Edit
12. Screen12 Execution Tracker
13. Screen13 Feedback
14. Profile `page.tsx`
15. Screen15 Preferences Edit
16. Screen16 Budget
17. Screen17 Group Plan
18. Screen18 Notifications
19. Screen19 Review Complete
20. Screen20 Badges
21. PlansClient (Plans list)
22. Screen05 Map
23. Admin (pending Q1)
24. not-found (pending Q2)

---

## Sign-off

**Status: AWAITING USER APPROVAL**
Lock this plan by answering Q1–Q5 above. Once locked, no code writes until approval received.
