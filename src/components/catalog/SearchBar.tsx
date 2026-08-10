import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search components, tags…' }: SearchBarProps) {
  return (
    <div className="search-bar">
      <Search size={16} className="search-icon" />
      <input
        id="catalog-search"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: '2.4rem', paddingRight: value ? '2.4rem' : undefined }}
        autoComplete="off"
      />
      {value && (
        <button
          className="btn btn-icon btn-ghost"
          onClick={() => onChange('')}
          style={{ position: 'absolute', right: 'var(--sp-2)', top: '50%', transform: 'translateY(-50%)', padding: 4 }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
