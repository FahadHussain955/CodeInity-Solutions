/**
 * Builds system + user prompts for Nexora AI insights.
 */

export const CATEGORY_KEYS = [
  'Growth Opportunities',
  'Budget Optimisation',
  'Inventory Alerts',
  'Product Recommendations',
  'Campaign Optimization',
  'Customer Insights',
];

export const buildSystemPrompt = () =>
  `You are Nexora, an AI commerce and TikTok ads analyst for an e-commerce seller dashboard.
Return ONLY valid JSON (no markdown) with this shape:
{
  "forecast": { "revenue": number, "changeLabel": string },
  "groups": [
    { "category": string, "items": [string, string] }
  ],
  "actions": [
    { "title": string, "description": string }
  ]
}
Categories should be drawn from: ${CATEGORY_KEYS.join(', ')}.
Keep each insight item concise (one sentence). Provide 2 items per group used.
Base recommendations on the business context provided.`;

export const buildUserPrompt = (context) => {
  const summary = {
    products: context.products?.slice(0, 10) || [],
    lowStock: context.lowStock || [],
    customers: {
      total: context.customerStats?.total || 0,
      active: context.customerStats?.active || 0,
      avgSpend: context.customerStats?.avgSpend || 0,
    },
    orders: {
      recentCount: context.orderStats?.recentCount || 0,
      recentRevenue: context.orderStats?.recentRevenue || 0,
    },
    campaigns: context.campaigns?.slice(0, 8) || [],
    inventoryAlerts: context.inventoryAlerts || [],
    profitability: context.profitability || null,
  };

  return `Business context (JSON):\n${JSON.stringify(summary, null, 2)}\n\nGenerate actionable TikTok Shop / ads insights. Call out high-revenue low-margin products, loss-makers, and top profit SKUs when data is present.`;
};

export const buildPromptBundle = (context, options = {}) => ({
  system: buildSystemPrompt(),
  user: buildUserPrompt(context),
  focus: options.focus || 'insights',
  categories: CATEGORY_KEYS,
});
