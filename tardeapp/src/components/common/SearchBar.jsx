// =============================================================================
// SEARCH BAR — Global asset search input
// Debounces input before propagating to context.
// FUTURE: Add command palette (⌘K) trigger.
// =============================================================================

import { useEffect, useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import useMarket from '../../hooks/useMarket';

/**
 * SearchBar — wired to MarketContext.setSearchQuery with 300ms debounce.
 * @param {Object} props
 * @param {string} [props.placeholder='Search stocks, crypto...']
 * @param {number} [props.debounceMs=300]
 */
export default function SearchBar({
  placeholder = 'Search stocks, crypto...',
  debounceMs = 300,
}) {
  const { searchQuery, setSearchQuery } = useMarket();
  const [localValue, setLocalValue] = useState(searchQuery);
  const debounceRef = useRef(null);

  // Debounce: only update context after user stops typing
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(localValue);
    }, debounceMs);
    return () => clearTimeout(debounceRef.current);
  }, [localValue, debounceMs, setSearchQuery]);

  const handleClear = () => {
    setLocalValue('');
    setSearchQuery('');
  };

  return (
    <div className="search-bar" data-testid="search-bar">
      <Search size={18} className="search-bar-icon" aria-hidden="true" />

      <input
        type="search"
        className="search-bar-input"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search assets"
        data-testid="search-bar-input"
      />

      {localValue && (
        <button
          className="search-bar-clear-btn"
          onClick={handleClear}
          aria-label="Clear search"
          data-testid="search-bar-clear"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
