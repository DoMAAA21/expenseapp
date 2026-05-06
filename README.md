# Budgetly

Budgetly is a full-stack personal finance app.

- `front`: React + Vite + TypeScript client (`5173`)
- `api`: Express + TypeScript API (`4000`)
- `db`: MySQL 8 (`3308` on host)
- `phpmyadmin`: DB UI (`8080`)

---

## Tech Stack

- **Frontend**: React 19, React Router, React Query, React Hook Form, Recharts, shadcn UI
- **Backend**: Express 5, Zod validation, JWT auth via httpOnly cookies
- **Database**: MySQL 8 + Prisma ORM
- **Dev infra**: Docker Compose

---

## Project Structure

```text
.
├── api/                  # Backend service (Express + Prisma)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── middlewares/
│   └── prisma/
├── front/                # Frontend app (React + Vite)
│   └── src/
│       ├── domains/      # Feature domains (auth, dashboard, transactions, ...)
│       ├── components/   # Shared UI/components
│       ├── hooks/        # Shared query hooks
│       └── lib/          # HTTP client, utils, config
└── docker-compose.yml
```

---

## Environment Variables

This repo uses three env scopes:

1. **Root `.env`** (used by Docker Compose interpolation)
2. **`api/.env`** (backend runtime config)
3. **`front/.env`** (frontend runtime config)

### 1) Root `.env`

`/.env.example` currently defines:

```env
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
```

Recommended local values:

```env
DB_DATABASE=financeapp
DB_USERNAME=financeapp
DB_PASSWORD=password
```

### 2) API `.env`

`/api/.env.example` currently defines:

```env
PORT=
DATABASE_URL=
CORS_ALLOWED_ORIGINS=
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d
```

Recommended local values (non-Docker):

```env
PORT=4000
DATABASE_URL=mysql://financeapp:password@127.0.0.1:3308/financeapp
CORS_ALLOWED_ORIGINS=http://localhost:5173
JWT_ACCESS_SECRET=supersecretaccesskey
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=supersecretrefreshkey
JWT_REFRESH_EXPIRES_IN=7d
```

> Note: when running with `docker compose`, `DATABASE_URL` is overridden inside the API container to use host `db:3306`.

### 3) Front `.env`

`/front/.env.example` currently defines:

```env
VITE_API_BASE_URL=
```

Recommended local value:

```env
VITE_API_BASE_URL=http://localhost:4000
```

If empty, frontend falls back to `http://localhost:4000` in `front/src/lib/http.ts`.

---

## Setup

## Option A: Docker Compose (recommended)

### Prerequisites

- Docker + Docker Compose plugin

### Steps

1. Create env files:
   - `cp .env.example .env`
   - `cp api/.env.example api/.env`
   - `cp front/.env.example front/.env`
2. Fill env values using the examples above.
3. Start services:

```bash
docker compose up -d --build
```

4. Run Prisma setup once (inside API container or locally in `api/`):

```bash
cd api
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

### URLs

- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:4000](http://localhost:4000)
- API health: [http://localhost:4000/health](http://localhost:4000/health)
- phpMyAdmin: [http://localhost:8080](http://localhost:8080)

---

## Option B: Run locally (without Docker for app services)

### Prerequisites

- Node.js 20+
- npm
- MySQL (or use only Docker DB container)

### Steps

1. Install dependencies:

```bash
cd api && npm install
cd ../front && npm install
```

2. Configure env files (`api/.env`, `front/.env`) with local values.
3. Run Prisma migrations/seed:

```bash
cd api
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

4. Start API and frontend in separate terminals:

```bash
cd api && npm run dev
cd front && npm run dev
```

---

## Workflows and Modules

### 1) Authentication module

- **Backend routes**: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`
- **Session model**: JWT access + refresh tokens in httpOnly cookies
- **Frontend flow**:
  - Login page
  - Register page
  - Protected routes via auth context + route guard

### 2) Transactions module

- **CRUD operations**: list, get-by-id, create, update, delete
- **List features**:
  - Pagination
  - Monthly summary card (income/expenses/net)
  - Add/Edit modal flow
  - Delete confirmation popup
- **Quick Add**: floating action button to open income/expense create flow

### 3) Dashboard module

- **Monthly Cash Flow** chart (current month income vs expenses)
- **Income vs Expense Trend** chart (rolling 6-month line chart)
- **Net Balance by Month** chart (rolling 6-month positive/negative bars)
- All dashboard/summary charts are backed by transaction summary API data.

---

## Technical Requirements Status

This section maps implementation status against `TECHNICAL_REQUIREMENTS.md`.

### Core requirements

- **Login page**: ✅ Implemented at `/login`
- **At least 2 workflows (excluding login)**: ✅ Implemented
  - Workflow A: **Transactions management**
    - Create transaction
    - Edit transaction
    - Delete transaction (with confirmation)
    - Paginated listing
  - Workflow B: **Dashboard analytics**
    - Monthly cash flow chart
    - 6-month trend chart
    - Net balance per month chart
- **Runs out of the box**: ✅ Documented for Docker and local setup in this README

### Must-haves

- **Use Git**: ✅ Repository is version-controlled with Git
- **README with run instructions**: ✅ This README
- **API integration**: ✅ Frontend integrates with self-built backend API (`/api/auth`, `/api/transactions`)
- **Proper routing**: ✅ Public auth routes and protected app routes
- **Proper code structure**: ✅ Domain-driven frontend + layered backend (routes/controllers/services)
- **Unit tests**: ✅ Implemented in both `front` and `api`
  - `front/src/_test/http-error.test.ts`
  - `front/src/_test/use-recent-monthly-summaries.test.ts`
  - `api/src/_test/app-error.test.ts`
  - `api/src/_test/async-wrapper.test.ts`
  - `api/src/_test/request-user.test.ts`

### Nice-to-haves

- **Dockerized app**: ✅ Implemented with `docker-compose.yml`

---

## Useful Commands

### Root

```bash
docker compose up -d --build
docker compose down
docker compose logs -f api
docker compose logs -f front
```

### API

```bash
cd api
npm run dev
npm run build
npm run typecheck
npm run test
npm run test:run
npx prisma generate
npx prisma migrate dev
npx prisma migrate deploy
npx prisma db seed
```

### Frontend

```bash
cd front
npm run dev
npm run build
npm run lint
npm run test
npm run test:run
```
