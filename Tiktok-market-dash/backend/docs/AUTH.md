# Nexora Backend — Auth (Phase 3)

## Auth endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | No | Email/password register |
| POST | `/api/v1/auth/login` | No | Email/password login |
| GET | `/api/v1/auth/me` | Bearer JWT | Current user |
| POST | `/api/v1/auth/logout` | Bearer JWT | Logout (client clears token) |
| GET | `/api/v1/auth/google` | No | Start Google OAuth |
| GET | `/api/v1/auth/google/callback` | No | Google OAuth callback → JWT redirect |

## Environment variables

| Variable | Used for |
|----------|----------|
| `DATABASE_URL` | Prisma → PostgreSQL |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Sign/verify Nexora access JWTs |
| `CLIENT_URL` | Frontend origin for OAuth redirect |
| `CORS_ORIGIN` | Allowed browser origins |
| `GOOGLE_CLIENT_ID` | Google OAuth client |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `GOOGLE_CALLBACK_URL` | Must match Google Console redirect URI |

If Google vars are empty, `/auth/google` returns a clear configuration error. Local email/password auth still works.

## Google Console setup

1. Create OAuth 2.0 Client (Web) in Google Cloud Console.
2. Authorized JavaScript origins: `http://localhost:5173`
3. Authorized redirect URIs: `http://localhost:5000/api/v1/auth/google/callback`
4. Copy Client ID / Secret into `backend/.env`.

## Apply database migration

```bash
cd backend
docker compose up -d
npx prisma migrate deploy
# or: npm run prisma:migrate
npm run dev
```

## Frontend flow

- Login/Register forms POST to `/auth/login` and `/auth/register`.
- JWT stored in `localStorage` key `nexora_auth`.
- Google button redirects to backend `/auth/google`.
- Callback lands on `/auth/callback?token=...`, then `/auth/me`, then `/dashboard`.
