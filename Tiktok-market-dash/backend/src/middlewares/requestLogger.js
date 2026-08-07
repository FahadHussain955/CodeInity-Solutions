import morgan from 'morgan';
import { env } from '../config/env.js';

export const requestLogger = env.isProd
  ? morgan('combined')
  : morgan('dev');
