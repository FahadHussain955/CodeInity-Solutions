import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { corsOptions } from './config/cors.js';
import { env } from './config/env.js';
import { configurePassport, passport } from './config/passport.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { stripXssDeep } from './utils/sanitize.js';
import apiRoutes from './routes/index.js';

configurePassport();

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Sanitize request payloads (mongo operators + lightweight XSS strip)
app.use((req, _res, next) => {
  if (req.body) req.body = stripXssDeep(mongoSanitize.sanitize(req.body));
  if (req.query) {
    try {
      req.query = stripXssDeep(mongoSanitize.sanitize({ ...req.query }));
    } catch {
      // Express 5 query may be read-only — ignore
    }
  }
  next();
});

const rateLimitBody = (message) => ({
  success: false,
  statusCode: 429,
  code: 'RATE_LIMITED',
  message,
  errors: [],
});

const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitBody('Too many requests, please try again later.'),
});

const authLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitBody('Too many auth attempts, please try again later.'),
});

app.use(env.apiPrefix, apiLimiter);
app.use(`${env.apiPrefix}/auth`, authLimiter);

const uploadRoot = path.resolve(process.cwd(), env.upload.dir);
app.use('/uploads', express.static(uploadRoot));

app.use(requestLogger);
app.use(passport.initialize());

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Nexora API',
    data: {
      docs: env.apiPrefix,
      health: `${env.apiPrefix}/health`,
      auth: `${env.apiPrefix}/auth`,
    },
  });
});

app.use(apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
