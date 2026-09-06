# 🚀 Game Tracker — Production Launch & Deployment Checklist

Use this checklist to guide your production launch to GitHub and Vercel.

---

## 🎨 1. Frontend Checklist

- [x] **Design System & Typography**: Anti-AI slop dark aesthetic (`#141413`), uppercase headings (Barlow Condensed), mono numeric stats (IBM Plex Mono).
- [x] **Currently Playing Page (`/playing`)**: In-progress games list, play session modal logging trigger, empty state CTA.
- [x] **Watchlist Page (`/watchlist`)**: Cover-forward grid, sorting controls (*Date Added, Release Year, Platform, Title*).
- [x] **Library Page (`/library`)**: Complete catalog, multi-facet filters (*Status, Platform, Release Year*), dynamic sorting.
- [x] **Gaming Stats Page (`/stats`)**: Calculated metrics for *Total Played, Completed, Completion Rate %, Hours Logged This Year, Lifetime Hours, Average Rating, and Status Breakdown*.
- [x] **Database Search Page (`/search`)**: Real-time RAWG API game search + fallback, search input, add game modal.
- [x] **Game Detail Page (`/game/[id]`)**: Hero metadata, status switcher, 1–10 numeric rating & review notes form, status history audit timeline, remove game action.
- [x] **Account & Settings Page (`/profile`)**: User details overview, password update form, JSON library backup export & import restoration.
- [x] **Toast Notifications (`components/ui/Toast.tsx`)**: Visual feedback toasts on all user interactions (adds, edits, session logs, notes, backups).
- [x] **Navbar Component (`components/layout/Navbar.tsx`)**: Sticky header, active tab highlights, user profile shortcut, search trigger, mobile drawer menu.
- [x] **SEO Best Practices**: Page title tags (`generateMetadata`), Semantic HTML5 structure, unique key attributes.

---

## ⚡ 2. Backend Checklist

- [x] **Authentication & Session Security**:
  - `bcryptjs` password hashing (10 salt rounds).
  - `jose` JWT session token encryption.
  - Secure HTTP-only cookies (`gt_session`) with `SameSite=lax` & 7-day expiration.
  - Route protection & auth guards (`app/(app)/layout.tsx`).
- [x] **Server Actions (`app/actions/`)**:
  - `loginAction`, `signupAction`, `logoutAction`, `changePasswordAction` in `auth.ts`.
  - `addGameToLibraryAction`, `updateGameStatusAction`, `logPlaySessionAction`, `updateGameNotesAndRatingAction`, `removeUserGameAction`, `exportUserLibraryAction`, `importUserLibraryAction` in `games.ts`.
- [x] **External Provider & Fallback System (`lib/games/`)**:
  - RAWG API integration (`fetchRawgGames`, `fetchRawgGameById`) with revalidation caching (`revalidate: 3600`).
  - Fallback curated database of 15 top games for offline/no API key usage.
- [x] **Revalidation & Transaction Management**:
  - Next.js path revalidations (`revalidatePath`) on all mutation actions.
  - Prisma transactions (`$transaction`) for status history logs and play session aggregations.

---

## 🗄️ 3. Database Checklist

- [x] **Relational Schema (`prisma/schema.prisma`)**:
  - `User` table (email, passwordHash).
  - `Game` table (externalId, title, slug, coverUrl, releaseYear, description).
  - `Platform` & `GamePlatform` tables (platform normalization).
  - `UserGame` table (status, hoursLogged, rating, notes).
  - `StatusHistory` table (audit log of status changes).
  - `PlaySession` table (individual session date and hour logs).
- [x] **Prisma Client Singleton (`lib/db/prisma.ts`)**: Global instance preventing connection exhaustion in dev.
- [x] **Local Development DB**: SQLite (`prisma/dev.db`) initialized, migrated, and seeded.
- [ ] **Production Cloud DB Setup** *(Action Required Tomorrow)*:
  1. Sign up at [Neon.tech](https://neon.tech) (free PostgreSQL) or use Vercel Postgres.
  2. Create a project named `game-tracker` and copy the connection string (`DATABASE_URL`).
  3. When deploying, update `prisma/schema.prisma` provider to `postgresql` if needed:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
  4. Run `npx prisma db push` to push tables to your cloud PostgreSQL database.

---

## 🌐 4. GitHub & Vercel Deployment Steps

- [x] **Git Repository State**: Clean commit history on `main` branch.
- [x] **Post-Install Script**: Added `"postinstall": "prisma generate"` to `package.json`.
- [x] **Production Build Validation**: `npm run build` executed with **Exit code: 0**.

### Steps to Launch Tomorrow:

1. **Push Code to GitHub**:
   ```bash
   git push origin main
   ```

2. **Deploy on Vercel**:
   * Open [vercel.com/new](https://vercel.com/new).
   * Connect your GitHub repo (`MidunP/Stash`).
   * Add Environment Variables:
     * `DATABASE_URL`: Your Neon / Vercel Postgres connection string
     * `SESSION_SECRET`: Random 32+ character string (e.g. `gt_super_secret_jwt_key_2026_x92`)
     * `RAWG_API_KEY`: *(Optional)* API key from [rawg.io/apidocs](https://rawg.io/apidocs)
   * Click **Deploy**.
