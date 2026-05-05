# Budgetly

Budgetly is a full-stack project with:
- `front`: React + Vite frontend (port `5173`)
- `api`: Express + TypeScript backend (port `4000`)
- `db`: MySQL 8 database (host port `3308`)
- `phpmyadmin`: database UI (port `8080`)

## Overview

This repository is containerized with Docker Compose for local development.

- Frontend runs with hot reload using Vite.
- API runs with Express and uses Prisma ORM for database access.
- Prisma schema and migrations are in `api/prisma`.
- Initial database model includes a `users` table with seed dummy users.

## Tech Stack

- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express, TypeScript
- Database: MySQL 8
- ORM: Prisma
- Dev Infra: Docker Compose, phpMyAdmin

## Setup

### 1) Prerequisites

- Docker + Docker Compose
- Node.js 20+ (if running services outside containers)

### 2) Environment Variables

Create/update root `.env`:

```env
DB_DATABASE=financeapp
DB_USERNAME=financeapp
DB_PASSWORD=password
```

Create/update `api/.env`:

```env
PORT=4000
DATABASE_URL=mysql://financeapp:password@127.0.0.1:3308/financeapp
```

### 3) Start Services

```bash
docker compose up -d --build
```

Available services:
- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:4000](http://localhost:4000)
- API health: [http://localhost:4000/health](http://localhost:4000/health)
- phpMyAdmin: [http://localhost:8080](http://localhost:8080)

### 4) Prisma Migration and Seed

Run from `api` directory:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```


## Useful Commands

From project root:

```bash
docker compose up -d --build
docker compose down
docker compose logs -f api
```

From `api`:

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```
