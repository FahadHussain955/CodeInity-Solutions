# Nexora

AI-powered Commerce Growth Platform for marketplace sellers.

**Full documentation (single source of truth):**  
**[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**

## Quick start

```bash
# Backend
cd backend
cp .env.example .env   # set DATABASE_URL, JWT secrets, CLIENT_URL, CORS_ORIGIN
npm install
npx prisma migrate deploy && npx prisma generate
npm run seed && npm run dev

# Frontend (new terminal, repo root)
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api/v1
npm install && npm run dev
```

Open `http://localhost:5173`  
After seed: demo `demo@nexora.com` / `Demo1234!` · admin `admin@nexora.com` / `Admin1234!`

## Stack

React 19 · Vite · Redux Toolkit · Tailwind · Express · Prisma · PostgreSQL · JWT · Google OAuth · Gemini (optional)

## License

UNLICENSED — academic / portfolio project.
