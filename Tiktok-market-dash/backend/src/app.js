import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from './config/cors.js';
import { env } from './config/env.js';
import { configurePassport, passport } from './config/passport.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import apiRoutes from './routes/index.js';

configurePassport();

const app = express();

app.disable('x-powered-by');
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
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
