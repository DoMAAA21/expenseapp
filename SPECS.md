# BudgetWise — Cursor Project Specification

> **Purpose:** This document is the single source of truth for building BudgetWise.
> Cursor should follow this spec file-by-file, screen-by-screen.
> Do not deviate from the folder structure, naming conventions, or technology choices below.

---

## 1. Project Overview

**BudgetWise** is a personal finance tracker web app.
Users can log transactions, set monthly budget goals per category, and visualize their spending through a dashboard.

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Zustand, Axios, Recharts, TailwindCSS |
| Backend | Node.js, Express, Prisma ORM |
| Database | PostgreSQL |
| Auth | JWT (access token) stored in `localStorage` |
| Testing (FE) | Jest + React Testing Library |
| Testing (BE) | Jest + Supertest |
| DevOps | Docker + Docker Compose |

---

## 2. Monorepo Folder Structure

```
budgetwise/
├── client/                        # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                   # Axios instance + API call functions
│   │   │   ├── axiosInstance.js
│   │   │   ├── authApi.js
│   │   │   ├── transactionsApi.js
│   │   │   ├── budgetsApi.js
│   │   │   └── exchangeApi.js     # Public exchange rate API
│   │   ├── components/            # Reusable UI components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── TopBar.jsx
│   │   │   │   └── ProtectedLayout.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   └── Spinner.jsx
│   │   │   ├── transactions/
│   │   │   │   ├── TransactionItem.jsx
│   │   │   │   ├── TransactionList.jsx
│   │   │   │   └── TransactionForm.jsx
│   │   │   ├── budgets/
│   │   │   │   ├── BudgetCard.jsx
│   │   │   │   └── BudgetForm.jsx
│   │   │   └── charts/
│   │   │       ├── SpendingPieChart.jsx
│   │   │       └── MonthlyBarChart.jsx
│   │   ├── pages/                 # Route-level page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── TransactionsPage.jsx
│   │   │   └── BudgetsPage.jsx
│   │   ├── store/                 # Zustand stores
│   │   │   ├── useAuthStore.js
│   │   │   ├── useTransactionStore.js
│   │   │   └── useBudgetStore.js
│   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── useTransactions.js
│   │   │   └── useBudgets.js
│   │   ├── utils/
│   │   │   ├── formatCurrency.js
│   │   │   ├── formatDate.js
│   │   │   └── categoryColors.js
│   │   ├── constants/
│   │   │   └── categories.js      # Shared category list
│   │   ├── __tests__/
│   │   │   ├── components/
│   │   │   │   ├── Button.test.jsx
│   │   │   │   ├── TransactionItem.test.jsx
│   │   │   │   └── BudgetCard.test.jsx
│   │   │   └── pages/
│   │   │       ├── LoginPage.test.jsx
│   │   │       └── DashboardPage.test.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                        # Express backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── transactionController.js
│   │   │   └── budgetController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── transactionRoutes.js
│   │   │   └── budgetRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # JWT verify
│   │   │   └── errorHandler.js
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── __tests__/
│   │   │   ├── auth.test.js
│   │   │   ├── transactions.test.js
│   │   │   └── budgets.test.js
│   │   └── app.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 3. Database Schema (Prisma)

File: `server/src/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  password     String        // bcrypt hashed
  name         String
  createdAt    DateTime      @default(now())
  transactions Transaction[]
  budgets      Budget[]
}

model Transaction {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // "income" | "expense"
  amount      Float
  category    String
  description String?
  date        DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Budget {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  category   String
  limit      Float
  month      Int      // 1–12
  year       Int
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([userId, category, month, year])
}
```

---

## 4. Backend API Endpoints

Base URL: `http://localhost:4000/api`

All routes except `/auth/*` require the header:
```
Authorization: Bearer <jwt_token>
```

### Auth

| Method | Route | Body | Description |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | Register new user, return JWT |
| POST | `/auth/login` | `{ email, password }` | Login, return JWT |
| GET | `/auth/me` | — | Return current user from token |

### Transactions

| Method | Route | Body / Query | Description |
|---|---|---|---|
| GET | `/transactions` | `?type&category&startDate&endDate` | List user's transactions with optional filters |
| POST | `/transactions` | `{ type, amount, category, description, date }` | Create transaction |
| PUT | `/transactions/:id` | `{ type, amount, category, description, date }` | Update transaction |
| DELETE | `/transactions/:id` | — | Delete transaction |
| GET | `/transactions/summary` | `?month&year` | Return totals: income, expenses, balance by category |

### Budgets

| Method | Route | Body | Description |
|---|---|---|---|
| GET | `/budgets` | `?month&year` | List budgets for a given month/year |
| POST | `/budgets` | `{ category, limit, month, year }` | Create or update a budget goal |
| DELETE | `/budgets/:id` | — | Delete a budget goal |

---

## 5. Frontend Routes

File: `client/src/App.jsx`

```
/                  → redirect to /dashboard if logged in, else /login
/login             → LoginPage
/register          → RegisterPage
/dashboard         → DashboardPage        (protected)
/transactions      → TransactionsPage     (protected)
/budgets           → BudgetsPage          (protected)
```

All protected routes should be wrapped in `<ProtectedLayout />` which:
- Checks `useAuthStore` for a valid token
- Redirects to `/login` if unauthenticated
- Renders `<Sidebar />` and `<TopBar />` around `<Outlet />`

---

## 6. Page Specifications

### 6.1 LoginPage (`/login`)
- Email + Password fields
- "Sign In" button → calls `POST /auth/login` → saves token to Zustand + localStorage → redirect to `/dashboard`
- Link to `/register`
- Show inline error on failed login

### 6.2 RegisterPage (`/register`)
- Name + Email + Password + Confirm Password fields
- Calls `POST /auth/register` → auto-login → redirect to `/dashboard`
- Link back to `/login`

### 6.3 DashboardPage (`/dashboard`)
- **Summary Cards Row:** Total Income, Total Expenses, Net Balance for current month
- **SpendingPieChart:** Expenses broken down by category (Recharts `PieChart`)
- **MonthlyBarChart:** Income vs Expenses for the last 6 months (Recharts `BarChart`)
- **Recent Transactions:** Last 5 transactions using `<TransactionItem />`
- **Currency Widget:** Fetch PHP/USD rate from `https://api.exchangerate.host/latest?base=USD&symbols=PHP` and display it as a small info card

### 6.4 TransactionsPage (`/transactions`)
- Filter bar: Type (All / Income / Expense), Category dropdown, Date range pickers
- Scrollable list of `<TransactionItem />` components
- Floating "+" button → opens `<Modal>` with `<TransactionForm />`
- Each `<TransactionItem />` has Edit (pencil icon) and Delete (trash icon) actions
- Optimistic UI updates via Zustand store

### 6.5 BudgetsPage (`/budgets`)
- Month/Year selector at top (default: current month)
- Grid of `<BudgetCard />` components — one per category
- Each card shows: category name, limit amount, amount spent (from transactions), progress bar (green → yellow → red based on % used)
- "Add / Edit Budget" button → opens `<Modal>` with `<BudgetForm />`
- If no budget set for a category but spending exists, show a warning badge

---

## 7. Reusable Component Contracts

### `<Button variant="primary|secondary|danger" size="sm|md|lg" onClick isLoading>`
### `<Card title? className?> children </Card>`
### `<Badge color="green|yellow|red|blue"> label </Badge>`
### `<Modal isOpen onClose title> children </Modal>`
### `<Input label name value onChange error placeholder type />`
### `<Select label name value onChange options=[{value, label}] error />`
### `<Spinner size="sm|md|lg" />`
### `<TransactionItem transaction onEdit onDelete />`
### `<BudgetCard budget spentAmount onEdit onDelete />`
### `<SpendingPieChart data=[{name, value, color}] />`
### `<MonthlyBarChart data=[{month, income, expenses}] />`

---

## 8. Zustand Store Shapes

### `useAuthStore`
```js
{
  user: null | { id, name, email },
  token: null | string,
  login: (token, user) => void,   // also persists to localStorage
  logout: () => void,
}
```

### `useTransactionStore`
```js
{
  transactions: [],
  isLoading: false,
  fetchTransactions: (filters) => Promise,
  addTransaction: (data) => Promise,
  updateTransaction: (id, data) => Promise,
  deleteTransaction: (id) => Promise,
  summary: { income: 0, expenses: 0, balance: 0, byCategory: {} },
  fetchSummary: (month, year) => Promise,
}
```

### `useBudgetStore`
```js
{
  budgets: [],
  isLoading: false,
  fetchBudgets: (month, year) => Promise,
  saveBudget: (data) => Promise,     // create or update
  deleteBudget: (id) => Promise,
}
```

---

## 9. Categories Constant

File: `client/src/constants/categories.js`

```js
export const CATEGORIES = [
  { value: "food",          label: "Food & Dining",     color: "#f97316" },
  { value: "transport",     label: "Transport",          color: "#3b82f6" },
  { value: "housing",       label: "Housing & Rent",     color: "#8b5cf6" },
  { value: "utilities",     label: "Utilities",          color: "#06b6d4" },
  { value: "health",        label: "Health",             color: "#ef4444" },
  { value: "entertainment", label: "Entertainment",      color: "#ec4899" },
  { value: "shopping",      label: "Shopping",           color: "#f59e0b" },
  { value: "savings",       label: "Savings",            color: "#10b981" },
  { value: "salary",        label: "Salary / Income",   color: "#22c55e" },
  { value: "other",         label: "Other",              color: "#6b7280" },
];
```

---

## 10. Environment Variables

### `client/.env.example`
```
VITE_API_BASE_URL=http://localhost:4000/api
VITE_EXCHANGE_API_URL=https://api.exchangerate.host
```

### `server/.env.example`
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/budgetwise
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
PORT=4000
NODE_ENV=development
```

---

## 11. Docker Compose

File: `docker-compose.yml`

```yaml
version: "3.9"
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: budgetwise
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  server:
    build: ./server
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/budgetwise
      JWT_SECRET: supersecretkey
      JWT_EXPIRES_IN: 7d
      PORT: 4000
    depends_on:
      - db

  client:
    build: ./client
    ports:
      - "3000:3000"
    environment:
      VITE_API_BASE_URL: http://localhost:4000/api
    depends_on:
      - server

volumes:
  pgdata:
```

---

## 12. Unit Tests Checklist

### Frontend (`client/src/__tests__/`)
- [ ] `Button.test.jsx` — renders correctly, fires onClick, shows spinner when isLoading
- [ ] `TransactionItem.test.jsx` — renders transaction data, calls onEdit/onDelete
- [ ] `BudgetCard.test.jsx` — renders progress bar correctly, shows overspend badge when > 100%
- [ ] `LoginPage.test.jsx` — shows validation errors, calls login API on submit
- [ ] `DashboardPage.test.jsx` — renders summary cards with mocked store data

### Backend (`server/src/__tests__/`)
- [ ] `auth.test.js` — register, login, duplicate email error, invalid credentials
- [ ] `transactions.test.js` — CRUD operations, filter query params, auth guard
- [ ] `budgets.test.js` — create/update budget, delete, unauthenticated access blocked

---

## 13. Code Standards

- Use **named exports** for all components
- Use **async/await** (no raw `.then()` chains)
- All API calls live in `client/src/api/` — **never** call axios directly from components or stores
- Component files: **PascalCase** (`TransactionItem.jsx`)
- Utility/hook files: **camelCase** (`formatCurrency.js`, `useTransactions.js`)
- Store files: **camelCase** prefixed with `use` (`useAuthStore.js`)
- No inline styles — use **Tailwind classes only**
- Every reusable component must accept and spread a `className` prop
- All form inputs must have a `label` and display an `error` string if validation fails
- Backend controllers must use `try/catch` and pass errors to `next(err)`
- HTTP status codes must be semantically correct (200, 201, 400, 401, 403, 404, 500)

---

## 14. Git Conventions

```
feat: add transaction filter by category
fix: correct budget progress bar overflow
chore: add docker compose setup
test: add unit tests for BudgetCard
refactor: extract formatCurrency utility
```

Branch strategy:
- `main` — stable, deployable
- `dev` — integration branch
- `feat/<name>` — feature branches

---

## 15. Build Order (Recommended)

Follow this order to avoid blockers:

1. `server` — DB schema + Prisma migrate + auth routes + JWT middleware
2. `server` — transaction routes + budget routes + tests
3. `client` — Zustand stores + Axios instance + API modules
4. `client` — Reusable UI components (Button, Card, Modal, Input, Select)
5. `client` — LoginPage + RegisterPage + routing
6. `client` — DashboardPage (charts + summary cards)
7. `client` — TransactionsPage (list + form + filters)
8. `client` — BudgetsPage (budget cards + progress bars)
9. Both — Unit tests
10. Both — Docker setup + README