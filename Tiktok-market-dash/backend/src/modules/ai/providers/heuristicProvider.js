import { formatMoney, toNumber } from '../../../utils/queryHelpers.js';

/**
 * Offline / fallback insights from DB aggregates — no external API.
 */
export const heuristicProvider = {
  name: 'heuristic',

  async generateInsights(context) {
    const campaigns = context.campaigns || [];
    const lowStock = context.lowStock || [];
    const products = context.products || [];
    const customerStats = context.customerStats || {};
    const orderStats = context.orderStats || {};

    const active = campaigns.filter((c) => c.status === 'ACTIVE' || c.statusRaw === 'ACTIVE');
    const best = [...campaigns].sort((a, b) => toNumber(b.roas) - toNumber(a.roas))[0];
    const weak = [...campaigns]
      .filter((c) => toNumber(c.spent || c.totalSpend) > 0)
      .sort((a, b) => toNumber(a.roas) - toNumber(b.roas))[0];

    const recentRevenue = toNumber(orderStats.recentRevenue);
    const forecastRevenue = Math.round(recentRevenue * 1.12);
    const changePct = recentRevenue > 0 ? 12 : 0;

    const groups = [];

    if (best) {
      groups.push({
        category: 'Growth Opportunities',
        items: [
          `Scale "${best.name}" campaign: ROAS is ${toNumber(best.roas).toFixed(1)}x.`,
          active.length
            ? `You have ${active.length} active campaign(s) — consider lookalike audiences for top performers.`
            : 'Activate a high-intent conversions campaign to capture demand.',
        ],
      });
    } else {
      groups.push({
        category: 'Growth Opportunities',
        items: [
          'Launch a conversions campaign for your best-selling SKU.',
          'Test interest audiences around your top product categories.',
        ],
      });
    }

    if (weak) {
      groups.push({
        category: 'Budget Optimisation',
        items: [
          `Review "${weak.name}" — ROAS is only ${toNumber(weak.roas).toFixed(1)}x.`,
          'Reallocate budget from low-ROAS groups to catalog / shopping ads.',
        ],
      });
    } else {
      groups.push({
        category: 'Budget Optimisation',
        items: [
          'Set daily caps on awareness campaigns until conversion data is strong.',
          'Shift spend toward creatives with CTR above 1.5%.',
        ],
      });
    }

    if (lowStock.length) {
      groups.push({
        category: 'Inventory Alerts',
        items: lowStock.slice(0, 2).map(
          (p) =>
            `${p.sku || p.name} is low (${p.currentStock ?? p.inStock ?? 0} in stock) — reorder soon.`
        ),
      });
    } else {
      groups.push({
        category: 'Inventory Alerts',
        items: [
          'No critical stockouts detected in the current snapshot.',
          'Monitor reorder levels weekly ahead of campaign spikes.',
        ],
      });
    }

    const profitability = context.profitability || {};
    const topProfit = profitability.topProfit?.[0];
    const weakMargin = profitability.highRevenueLowMargin?.[0] || profitability.lowMargin?.[0];
    const loser = profitability.losingMoney?.[0];

    const topProduct = products[0];
    groups.push({
      category: 'Product Recommendations',
      items: [
        weakMargin
          ? `"${weakMargin.name}" generated ${formatMoney(weakMargin.revenue)} with a ${weakMargin.margin}% margin${
              profitability.storeAvgMargin != null
                ? ` (store avg ${profitability.storeAvgMargin}%)`
                : ''
            } — review cost or pricing.`
          : topProfit
            ? `"${topProfit.name}" is your top profit SKU (${formatMoney(topProfit.profit)} profit). Feature it in ads.`
            : topProduct
              ? `Feature "${topProduct.name}" in TikTok Shop ads — strong catalog candidate.`
              : 'Add product catalog depth before scaling TikTok Shop ads.',
        loser
          ? `"${loser.name}" is currently unprofitable (${formatMoney(loser.profit)}). Pause ads until costs improve.`
          : 'Bundle accessories with bestsellers to lift average order value.',
      ],
    });

    groups.push({
      category: 'Campaign Optimization',
      items: [
        best
          ? `Duplicate winning creatives from "${best.name}" into a new ad group.`
          : 'Create at least one active conversions campaign with 2–3 creatives.',
        'Pause underperforming ads after 3 days with CTR below 0.8%.',
      ],
    });

    groups.push({
      category: 'Customer Insights',
      items: [
        `You have ${customerStats.total || 0} customers (${customerStats.active || 0} active).`,
        customerStats.avgSpend
          ? `Average lifetime spend is ${formatMoney(customerStats.avgSpend)} — retarget high-value buyers.`
          : 'Upload a customer list to build a lookalike audience.',
      ],
    });

    return {
      provider: 'heuristic',
      forecast: {
        revenue: forecastRevenue,
        changeLabel: `+${changePct}% vs last week`,
      },
      groups,
      actions: [
        {
          title: 'Auto-optimize Campaigns',
          description: 'Apply suggested budget changes to low-ROAS groups',
        },
        {
          title: 'Restock Priority SKUs',
          description: lowStock.length
            ? `Review ${lowStock.length} low-stock item(s) before scaling ads`
            : 'Confirm reorder levels before next campaign push',
        },
      ],
    };
  },
};
