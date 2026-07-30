// =============================================================================
// FILTER COMPONENT — Asset type + sort controls
// Wired to MarketContext filter/sort state.
// =============================================================================

import useMarket from '../../hooks/useMarket';
import { ASSET_TYPES, SORT_OPTIONS } from '../../constants/appConstants';

const TYPE_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Stocks', value: ASSET_TYPES.STOCK },
  { label: 'Crypto', value: ASSET_TYPES.CRYPTO },
];

const SORT_SELECT_OPTIONS = [
  { label: 'Market Cap ↓', value: SORT_OPTIONS.MARKET_CAP_DESC },
  { label: 'Price ↑', value: SORT_OPTIONS.PRICE_ASC },
  { label: 'Price ↓', value: SORT_OPTIONS.PRICE_DESC },
  { label: 'Change ↑', value: SORT_OPTIONS.CHANGE_ASC },
  { label: 'Change ↓', value: SORT_OPTIONS.CHANGE_DESC },
  { label: 'Name A→Z', value: SORT_OPTIONS.NAME_ASC },
  { label: 'Name Z→A', value: SORT_OPTIONS.NAME_DESC },
];

/**
 * FilterComponent — type tab selector + sort dropdown.
 * Reads and writes to MarketContext.
 */
export default function FilterComponent() {
  const { selectedType, setSelectedType, sortKey, setSortKey } = useMarket();

  return (
    <div className="filter-component" data-testid="filter-component">
      {/* ── Asset type tabs ── */}
      <div className="filter-type-tabs" role="tablist" aria-label="Filter by asset type">
        {TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            role="tab"
            aria-selected={selectedType === option.value}
            className={`filter-tab${selectedType === option.value ? ' filter-tab--active' : ''}`}
            onClick={() => setSelectedType(option.value)}
            data-testid={`filter-tab-${option.value}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* ── Sort dropdown ── */}
      <div className="filter-sort">
        <label htmlFor="sort-select" className="filter-sort-label">
          Sort by
        </label>
        <select
          id="sort-select"
          className="filter-sort-select"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          data-testid="filter-sort-select"
        >
          {SORT_SELECT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
