import type { ReactNode } from 'react';
import './SearchFilterBar.css';

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  activeFilterCount: number;
  onFilterClick: () => void;
  children?: ReactNode;
  hideFilterButton?: boolean;
}

function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Ara...',
  activeFilterCount,
  onFilterClick,
  children,
  hideFilterButton = false,
}: SearchFilterBarProps) {
  return (
    <div className="search-filter-bar">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {!hideFilterButton && (
        <button type="button" className="filter-icon-btn" onClick={onFilterClick}>
          <span className="filter-icon">▤</span>
          Filtrele
          {activeFilterCount > 0 && <span className="filter-count-badge">{activeFilterCount}</span>}
        </button>
      )}

      {children}
    </div>
  );
}

export default SearchFilterBar;
