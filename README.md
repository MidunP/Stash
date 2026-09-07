# 🎮 Game Tracker (Stash)

> A personal video game tracking and cataloging web application inspired by Letterboxd. Designed with an anti-AI slop dark aesthetic (`#141413`), Barlow Condensed headings, and IBM Plex Mono stats.

🌐 **Live Demo**: [https://stash-ten-psi.vercel.app](https://stash-ten-psi.vercel.app)

---

## 🌟 Features

Building a platform where video game enthusiasts can:

- **Authentication & Security**: Sign up and log in securely with `bcryptjs` password hashing and `jose` JWT HTTP-only cookies (`gt_session`).
- **Currently Playing (`/playing`)**: Track active games, log play sessions with date and hours, and trigger quick session modals.
- **Watchlist (`/watchlist`)**: Cover-forward grid view of upcoming games with sorting by Date Added, Release Year, Platform, and Title.
- **Catalog Library (`/library`)**: Comprehensive library view with multi-facet filters (*Status, Platform, Release Year*) and dynamic sorting.
- **Gaming Analytics & Stats (`/stats`)**: Calculated metrics for *Total Played, Completed, Completion Rate %, Hours Logged This Year, Lifetime Hours, Average Rating, and Status Breakdown*.
- **Game Search (`/search`)**: Real-time game search powered by the RAWG API with automatic offline curated fallback.
- **Game Detail Pages (`/game/[id]`)**: Detailed game page with hero metadata, status switcher, 1–10 numeric ratings, review notes, and audit timeline history.
- **Account & Settings (`/profile`)**: Manage user credentials, update passwords, and perform complete JSON library backup exports & imports.
- **Interactive UI Feedback**: Global toast notification system for instant feedback on user actions.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Vanilla CSS + Tailwind v4, Lucide Icons
- **Backend**: Next.js Server Actions, Node.js, `jose` JWT Auth
- **Database & ORM**: PostgreSQL (Neon Cloud DB in Production / SQLite in Development), Prisma ORM (`@prisma/client`)
- **External API**: RAWG Video Games Database API

---

## ⚙️ Setting It Up Locally

### 1. Clone the Repository
```bash
git clone https://github.com/MidunP/Stash.git
cd Stash
```

### 2. Configure Environment Variables
Copy `.env.example` over to `.env`:
```bash
cp .env.example .env
```

Update your `.env` file with appropriate credentials:
```env
# Database Connection String (PostgreSQL for Neon / Vercel Postgres, or file:./dev.db for local SQLite)
DATABASE_URL="postgresql://user:password@neon-host/neondb?sslmode=require"

# JWT Auth Secret (32+ character random string)
SESSION_SECRET="gt_super_secret_jwt_key_2026_x92"

# RAWG Video Games API Key (Optional - Fallback curated database used if omitted)
RAWG_API_KEY="your-rawg-api-key"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup & Migrate Database
Push the Prisma schema to your database and seed initial demo data:
```bash
# Push tables to database
npx prisma db push

# Seed initial games and demo user
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Building & Deploying to Production

To test the production build locally:
```bash
npm run build
npm run start
```

### Deploying to Vercel
1. Import repository `MidunP/Stash` on Vercel.
2. Add environment variables: `DATABASE_URL`, `SESSION_SECRET`, and `RAWG_API_KEY`.
3. Deploy! Vercel automatically runs `prisma generate` via the `postinstall` script.
