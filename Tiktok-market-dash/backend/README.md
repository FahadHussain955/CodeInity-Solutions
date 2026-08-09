# Nexora Backend

Express + Prisma API for Nexora.

**Project documentation:** see root [PROJECT_DOCUMENTATION.md](../PROJECT_DOCUMENTATION.md).

```bash
npm install
cp .env.example .env
npx prisma migrate deploy && npx prisma generate
npm run seed
npm run dev
```

Health: `GET http://localhost:5000/api/v1/health`
