const LEVELS = { info: 'INFO', warn: 'WARN', error: 'ERROR' };

const stamp = () => new Date().toISOString();

const write = (level, args) => {
  const prefix = `[${stamp()}] [${LEVELS[level] || level.toUpperCase()}]`;
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  fn(prefix, ...args);
};

export const logger = {
  info: (...args) => write('info', args),
  warn: (...args) => write('warn', args),
  error: (...args) => write('error', args),
};

export default logger;
