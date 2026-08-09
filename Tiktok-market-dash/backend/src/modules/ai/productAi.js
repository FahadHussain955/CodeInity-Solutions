/**
 * Normalize + validate structured product AI payloads from Gemini.
 * Returns a safe object for the Add Product form — never throws on soft fields.
 */

const asString = (v, max = 2000) => {
  if (v == null) return '';
  const s = String(v).trim();
  return s.length > max ? s.slice(0, max) : s;
};

const asStringArray = (v, maxItems = 12, maxLen = 120) => {
  if (!Array.isArray(v)) {
    if (typeof v === 'string' && v.trim()) {
      return v
        .split(/[,;\n]/)
        .map((x) => asString(x, maxLen))
        .filter(Boolean)
        .slice(0, maxItems);
    }
    return [];
  }
  return v
    .map((x) => asString(x, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
};

const asAttributes = (v) => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
  const out = {};
  for (const [k, val] of Object.entries(v).slice(0, 20)) {
    const key = asString(k, 60);
    if (!key) continue;
    out[key] = asString(val, 200);
  }
  return out;
};

export const normalizeProductAiPayload = (raw = {}) => {
  const title = asString(raw.title || raw.name, 200);
  const description = asString(raw.description, 5000);
  const category = asString(raw.category, 120);
  const productType = asString(raw.productType || raw.product_type, 120);
  const highlights = asStringArray(raw.highlights || raw.features, 12, 160);
  const keywords = asStringArray(raw.keywords || raw.tags, 16, 60);
  const attributes = asAttributes(raw.attributes);

  if (!title && !description) {
    const err = new Error('AI response missing title and description.');
    err.code = 'INVALID_AI_RESPONSE';
    throw err;
  }

  return {
    title: title || 'Untitled product',
    description,
    highlights,
    keywords,
    category,
    productType,
    attributes,
  };
};

export const buildDescriptionWithExtras = ({ description, highlights, keywords, attributes }) => {
  const parts = [];
  if (description) parts.push(description);

  if (highlights?.length) {
    parts.push(['Highlights:', ...highlights.map((h) => `• ${h}`)].join('\n'));
  }

  if (keywords?.length) {
    parts.push(`Keywords: ${keywords.join(', ')}`);
  }

  const attrs = attributes && Object.keys(attributes).length ? attributes : null;
  if (attrs) {
    parts.push(
      ['Attributes:', ...Object.entries(attrs).map(([k, v]) => `• ${k}: ${v}`)].join('\n')
    );
  }

  return parts.filter(Boolean).join('\n\n').slice(0, 5000);
};

export const suggestSkuFromTitle = (title) => {
  const base = String(title || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
  if (!base) return `SKU-${Date.now().toString(36).toUpperCase()}`;
  return `${base}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
};
