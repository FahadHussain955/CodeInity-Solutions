import { env } from './env.js';

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (Postman, server-to-server) with no Origin
    if (!origin) return callback(null, true);

    const allowed = env.corsOrigin.split(',').map((value) => value.trim());
    if (allowed.includes('*') || allowed.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
