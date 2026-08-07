/**
 * Reusable filter tab strip used across list pages.
 * tabs: string[] | { key: string, label: string, count?: number }[]
 */
const FilterTabs = ({ tabs = [], value, onChange, className = '' }) => (
  <div className={`filter-tabs ${className}`.trim()}>
    {tabs.map((tab) => {
      const key = typeof tab === 'string' ? tab : tab.key;
      const label = typeof tab === 'string' ? tab : tab.label;
      const count = typeof tab === 'object' && tab != null ? tab.count : undefined;
      const active = value === key;

      return (
        <button
          key={key}
          type="button"
          onClick={() => onChange?.(key)}
          className={`filter-tab ${active ? 'filter-tab-active' : ''}`}
        >
          {count !== undefined ? `${label} (${count})` : label}
        </button>
      );
    })}
  </div>
);

export default FilterTabs;
