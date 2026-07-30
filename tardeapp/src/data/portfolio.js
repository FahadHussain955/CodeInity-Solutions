// =============================================================================
// MOCK PORTFOLIO DATA
// Represents a user's holdings.
// Shape: { id, assetId, quantity, averageCost, purchaseDate }
//
// FUTURE: Replace with portfolioService.getPortfolio() → Supabase DB query
// =============================================================================

/** @type {Holding[]} */
export const mockPortfolio = [
  {
    id: 'holding-1',
    assetId: 'aapl',
    quantity: 15,
    averageCost: 178.42,
    purchaseDate: '2024-03-15',
  },
  {
    id: 'holding-2',
    assetId: 'nvda',
    quantity: 25,
    averageCost: 87.60,
    purchaseDate: '2024-01-08',
  },
  {
    id: 'holding-3',
    assetId: 'btc',
    quantity: 0.42,
    averageCost: 61200.00,
    purchaseDate: '2024-05-20',
  },
  {
    id: 'holding-4',
    assetId: 'eth',
    quantity: 3.8,
    averageCost: 2840.00,
    purchaseDate: '2024-04-11',
  },
  {
    id: 'holding-5',
    assetId: 'msft',
    quantity: 10,
    averageCost: 398.75,
    purchaseDate: '2024-02-28',
  },
  {
    id: 'holding-6',
    assetId: 'sol',
    quantity: 42,
    averageCost: 125.30,
    purchaseDate: '2024-06-01',
  },
  {
    id: 'holding-7',
    assetId: 'meta',
    quantity: 8,
    averageCost: 481.20,
    purchaseDate: '2024-01-22',
  },
];

export default mockPortfolio;
