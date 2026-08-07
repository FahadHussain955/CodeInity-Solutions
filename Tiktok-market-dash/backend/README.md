# Nexora Backend

Production-ready Express + Prisma + PostgreSQL foundation for the Nexora API.

## Stack

- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT / bcrypt (wired for Phase 3 auth)
- express-validator, Helmet, CORS, Morgan, Multer, dotenv

## Quick start

1. Copy environment file:

```bash
cp .env.example .env
```

2. Update `DATABASE_URL` in `.env` to your PostgreSQL instance.

   Or start a local Postgres with Docker:

```bash
docker compose up -d
```

3. Install & generate Prisma client:

```bash
npm install
npm run prisma:generate
```

4. Run development server:

```bash
npm run dev
```

5. Health check:

```
GET http://localhost:5000/api/v1/health
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start with nodemon |
| `npm start` | Production start |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create / apply migrations (dev) |
| `npm run prisma:migrate:deploy` | Apply migrations (prod) |
| `npm run prisma:studio` | Open Prisma Studio |

## Project structure

```
backend/
├── prisma/
│   └── schema.prisma          # No business models yet
├── prisma.config.js           # Prisma 7 datasource config
├── src/
│   ├── app.js                 # Express app + middleware
│   ├── server.js              # Bootstrap + DB connect
│   ├── config/                # env, cors, multer
│   ├── lib/                   # Prisma client
│   ├── middlewares/           # auth scaffold, errors, validation
│   ├── modules/
│   │   └── health/            # Feature module example
│   ├── routes/v1/             # API versioning
│   └── utils/                 # ApiError, ApiResponse, asyncHandler
├── .env.example
└── package.json
```

## Auth (Phase 3)

See [docs/AUTH.md](./docs/AUTH.md) for JWT + Google OAuth setup, endpoints, and env vars.

```bash
npx prisma migrate deploy   # apply User model
npm run dev
```

Google Sign-In requires `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env`.
