/**
 * AI provider interface.
 *
 * Implementations should expose:
 *   async generateInsights(context, options?) => rawInsightObject | null
 *
 * rawInsightObject ideally includes:
 *   { forecast, groups, actions }
 *
 * Return null when the provider cannot produce a response (e.g. missing API key).
 */

export const AiProvider = {
  /** @param {object} _context @param {object} [_options] */
  async generateInsights(_context, _options = {}) {
    throw new Error('AiProvider.generateInsights must be implemented by a concrete provider.');
  },
};
