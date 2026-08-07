import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from './config/cors.js';
import { env } from './config/env.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import apiRoutes from './routes/index.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Nexora API',
    data: {
      docs: env.apiPrefix,
      health: `${env.apiPrefix}/health`,
    },
  });
});

app.use(apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
