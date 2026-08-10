import { ArrowUpDown } from 'lucide-react';
import { CATEGORIES } from '../../types';
import type { FilterState } from '../../types';

interface FilterPanelProps {
  filter: FilterState;
  setFilter: (partial: Partial<FilterState>) => void;
  totalShown: number;
  totalAll: number;
}

const SORT_OPTIONS: { value: FilterState['sortBy']; label: string }[] = [
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'name',       label: 'Name' },
  { value: 'quantity',   label: 'Quantity' },
  { value: 'category',   label: 'Category' },
];

export function FilterPanel({ filter, setFilter, totalShown, totalAll }: FilterPanelProps) {
  const toggleCategory = (cat: string) =>
    setFilter({ category: filter.category === cat ? '' : cat });

  const toggleSort = (by: FilterState['sortBy']) => {
    if (filter.sortBy === by) {
      setFilter({ sortDir: filter.sortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      setFilter({ sortBy: by, sortDir: 'asc' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
      {/* Category chips */}
      <div className="filter-bar">
        <button
          className={`filter-chip${!filter.category ? ' active' : ''}`}
          onClick={() => setFilter({ category: '' })}
          id="filter-all"
        >
          All ({totalAll})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-chip${filter.category === cat ? ' active' : ''}`}
            onClick={() => toggleCategory(cat)}
            id={`filter-cat-${cat}`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Sort row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--text-main)' }}>{totalShown}</strong> component{totalShown !== 1 ? 's' : ''}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowUpDown size={12} /> Sort by:
          </span>
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              className={`btn btn-sm${filter.sortBy === value ? ' btn-secondary' : ' btn-ghost'}`}
              onClick={() => toggleSort(value)}
              style={{ fontSize: '0.75rem', padding: '3px 8px' }}
              id={`sort-${value}`}
            >
              {label} {filter.sortBy === value ? (filter.sortDir === 'asc' ? '↑' : '↓') : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
