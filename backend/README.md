# FinanceFlow — Production-Ready REST API Backend

Production-ready REST API Backend for **FinanceFlow**, a modern Personal Finance Management & Expense Tracker application built with **Node.js, Express.js, PostgreSQL, Prisma ORM, JWT, bcrypt, Zod, Helmet, CORS, and Rate Limiting**.

---

## 🏗 Architecture & Technologies

- **Core**: Node.js & Express.js (ES Modules)
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) & `bcrypt` password hashing
- **Validation**: Zod schema validation
- **Security**: Helmet headers, CORS policy, `express-rate-limit`
- **Data Isolation**: Strict `userId` ownership checks on all private resources

---

## 📁 Directory Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema (PostgreSQL)
│   └── seed.js             # Seeding script for default categories & demo user
├── src/
│   ├── config/
│   │   └── database.js     # Prisma client instance
│   ├── controllers/        # Request handlers
│   ├── services/           # Database business logic
│   ├── routes/             # Express API routes
│   ├── middleware/         # Auth, Zod Validation, Error & Rate Limiter
│   ├── validators/         # Zod schemas
│   ├── utils/              # JWT, Password & Response helpers
│   └── server.js           # Server entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠 Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL running locally or remotely (e.g. Supabase, Render, Railway, ElephantSQL)

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/financeflow?schema=public"
JWT_SECRET="your_production_super_secret_jwt_key_here"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Migrations
Generate the Prisma Client and run database migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Seed Default Data (Optional)
Seed default categories and demo user (`alex@financeflow.com` / `password123`):

```bash
npm run prisma:seed
```

### 6. Run the Server
- **Development Mode**:
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

---

## 🔑 REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user account | No |
| POST | `/api/auth/login` | Authenticate user & get JWT token | No |
| GET | `/api/auth/me` | Fetch authenticated user details | Yes |

### Expenses (`/api/expenses`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/expenses` | Get user expenses (filter by date, merchant) | Yes |
| POST | `/api/expenses` | Create new expense transaction | Yes |
| GET | `/api/expenses/:id` | Get single expense details | Yes |
| PUT | `/api/expenses/:id` | Update expense record | Yes |
| DELETE | `/api/expenses/:id` | Delete expense record | Yes |

### Income (`/api/income`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/income` | Get user income records | Yes |
| POST | `/api/income` | Create new income entry | Yes |
| PUT | `/api/income/:id` | Update income entry | Yes |
| DELETE | `/api/income/:id` | Delete income entry | Yes |

### Budget Planner (`/api/budgets`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/budgets/categories` | Get category spending vs limits | Yes |
| POST | `/api/budgets/categories` | Create budget category | Yes |
| GET | `/api/budgets/adjustments` | Get budget adjustment history | Yes |

### Savings Goals (`/api/goals`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/goals` | Get user savings goals | Yes |
| POST | `/api/goals` | Create savings goal | Yes |
| PUT | `/api/goals/:id` | Update savings goal progress | Yes |
| DELETE | `/api/goals/:id` | Delete savings goal | Yes |

### Dashboard & Summary (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Get computed stats, trends & category donut totals | Yes |

---

## 🧪 Postman Testing Guide

1. **Register**: Send `POST /api/auth/register` with `firstName`, `lastName`, `email`, `password`.
2. **Login**: Send `POST /api/auth/login` with `email` and `password`. Copy the `token` from the response JSON.
3. **Protected Requests**: In Postman, add header `Authorization: Bearer <your_token>` for any request to `/api/expenses`, `/api/budgets`, `/api/goals`, or `/api/dashboard/summary`.

---

## 🚀 Deployment Instructions

### Render / Railway / Heroku
1. Push your repository to GitHub.
2. Link the repository to your host (Render/Railway).
3. Set Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `PORT=5000`.
4. Set Build Command: `npm install && npx prisma generate`
5. Set Start Command: `npm start`
