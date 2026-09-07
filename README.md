# Game Tracker



Building a platform where people can:
- Sign up and log in securely
- Search video games and add them to their personal library
- Track currently playing games and log play session hours
- Organize a watchlist and complete catalog library with filters
- View personal gaming stats, hours logged, and rating breakdown
- Rate games (1-10), write review notes, and export/import library backups

## Tech Stack
- Next.js (App Router) & React
- TypeScript
- Prisma ORM with PostgreSQL
- TailwindCSS

## Setting it up locally

1. Clone the repo:
```bash
git clone https://github.com/MidunP/Stash.git
cd Stash
```

2. Copy over .env.example to .env:
```bash
cp .env.example .env
```

3. Update .env:
- DATABASE_URL
- SESSION_SECRET
- RAWG_API_KEY

4. Install dependencies:
```bash
npm install
```

5. Push database schema & seed:
```bash
npx prisma db push
npm run seed
```

6. Start dev server:
```bash
npm run dev
```
