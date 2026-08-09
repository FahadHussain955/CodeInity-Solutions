import { formatMoney, toNumber } from '../../utils/queryHelpers.js';

export const CATEGORY_STYLE = {
  'Growth Opportunities': {
    icon: 'trending_up',
    color: 'text-success',
    bg: 'bg-success-bg',
  },
  'Budget Optimisation': {
    icon: 'payments',
    color: 'text-warning',
    bg: 'bg-warning-bg',
  },
  'Inventory Alerts': {
    icon: 'warehouse',
    color: 'text-error',
    bg: 'bg-error-container',
  },
  'Product Recommendations': {
    icon: 'inventory_2',
    color: 'text-primary',
    bg: 'bg-primary-container',
  },
  'Campaign Optimization': {
    icon: 'campaign',
    color: 'text-info',
    bg: 'bg-info-bg',
  },
  'Customer Insights': {
    icon: 'group',
    color: 'text-primary',
    bg: 'bg-primary-container',
  },
};

const normalizeItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object' && item.text) return String(item.text).trim();
      return String(item || '').trim();
    })
    .filter(Boolean);
};

const normalizeGroups = (groups) => {
  if (!Array.isArray(groups)) return [];
  return groups
    .map((g) => {
      const category = String(g.category || g.title || 'Growth Opportunities').trim();
      const style = CATEGORY_STYLE[category] || CATEGORY_STYLE['Growth Opportunities'];
      return {
        category,
        icon: g.icon || style.icon,
        color: g.color || style.color,
        bg: g.bg || style.bg,
        items: normalizeItems(g.items || g.insights || []),
      };
    })
    .filter((g) => g.items.length > 0);
};

const normalizeActions = (actions) => {
  if (!Array.isArray(actions)) return [];
  return actions
    .map((a) => {
      if (typeof a === 'string') {
        return { title: a, description: '' };
      }
      return {
        title: String(a.title || a.name || 'Action').trim(),
        description: String(a.description || a.detail || '').trim(),
      };
    })
    .filter((a) => a.title);
};

/**
 * Ensures AI response shape:
 * { forecast, groups, actions, provider, cached, generatedAt }
 */
export const formatAiInsights = (raw = {}, meta = {}) => {
  const revenue = toNumber(raw.forecast?.revenue ?? raw.forecastRevenue ?? 0);
  const changeLabel =
    raw.forecast?.changeLabel ||
    raw.forecast?.change ||
    raw.changeLabel ||
    '+0% vs last week';

  return {
    forecast: {
      revenue,
      revenueFormatted: formatMoney(revenue).replace(/\.00$/, ''),
      changeLabel,
    },
    groups: normalizeGroups(raw.groups || raw.insights || []),
    actions: normalizeActions(raw.actions || raw.actionItems || []),
    provider: meta.provider || raw.provider || 'heuristic',
    cached: Boolean(meta.cached),
    generatedAt: meta.generatedAt || new Date().toISOString(),
  };
};
