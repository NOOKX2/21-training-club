# FitPro — Full-stack Next.js

Fitness coaching app migrated to **Next.js 16**, **Tailwind CSS**, and **Bun** as a single full-stack project (no separate Python backend or CRA frontend).

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind CSS 4
- MongoDB
- Bun

## Setup

1. Install [Bun](https://bun.sh) and [MongoDB](https://www.mongodb.com/try/download/community) (or use Atlas).

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Install dependencies (if needed):

```bash
bun install
```

4. Run the dev server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## First run

- If the database has **no users**, open `/register` to create the first admin account.
- After that, registration is disabled; admins create clients from `/admin`.

Default credentials (if you seed the DB manually):

- Admin: `admin@fitnesspro.com` / `admin123`

## API

All former FastAPI routes live under `/api/*` (e.g. `/api/auth/login`, `/api/workouts/week/1`).

## Scripts

| Command       | Description        |
|---------------|--------------------|
| `bun dev`     | Development server |
| `bun build`   | Production build   |
| `bun start`   | Production server  |
| `bun lint`    | ESLint             |
