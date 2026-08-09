/**
 * Lightweight XSS strip for string values (fallback when mongo-sanitize is unused).
 */
export const stripXss = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

export const stripXssDeep = (input) => {
  if (input == null) return input;
  if (typeof input === 'string') return stripXss(input);
  if (Array.isArray(input)) return input.map(stripXssDeep);
  if (typeof input === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(input)) {
      if (key.startsWith('$')) continue;
      out[key] = stripXssDeep(val);
    }
    return out;
  }
  return input;
};
