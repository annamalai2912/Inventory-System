import { Package, PlusCircle, FileDown, LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComponents } from '../hooks/useComponents';
import { useComponentsStore } from '../store/components.store';
import { useExport } from '../hooks/useExport';
import { ComponentCard } from '../components/catalog/ComponentCard';
import { SearchBar } from '../components/catalog/SearchBar';
import { FilterPanel } from '../components/catalog/FilterPanel';

export function CatalogPage() {
  useComponents();
  const { components, filter, setFilter, getFiltered } = useComponentsStore();
  const { exportCSV } = useExport();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = getFiltered();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Component Catalog</h1>
          <p className="page-subtitle">{components.length} part types · {components.reduce((s, c) => s + c.quantity, 0).toLocaleString()} total units</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => exportCSV(filtered)} id="catalog-export-btn">
            <FileDown size={15} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/add')} id="catalog-add-btn">
            <PlusCircle size={15} /> Add
          </button>
        </div>
      </div>

      {/* Search + view toggle */}
      <div className="flex items-center gap-3 mb-4">
        <SearchBar value={filter.search} onChange={(v) => setFilter({ search: v })} />
        <div className="flex" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 3, gap: 2 }}>
          <button
            className={`btn btn-icon btn-sm${viewMode === 'grid' ? ' btn-primary' : ' btn-ghost'}`}
            onClick={() => setViewMode('grid')}
            id="view-grid"
            title="Grid view"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            className={`btn btn-icon btn-sm${viewMode === 'list' ? ' btn-primary' : ' btn-ghost'}`}
            onClick={() => setViewMode('list')}
            id="view-list"
            title="List view"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <FilterPanel
        filter={filter}
        setFilter={setFilter}
        totalShown={filtered.length}
        totalAll={components.length}
      />

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Package size={28} /></div>
          <div className="empty-state-title">
            {components.length === 0 ? 'No components yet' : 'No results found'}
          </div>
          <p className="empty-state-desc">
            {components.length === 0
              ? 'Your catalog is empty. Add the first component to get started.'
              : 'Try adjusting your search or filters.'}
          </p>
          {components.length === 0 && (
            <button className="btn btn-primary" onClick={() => navigate('/add')} id="catalog-empty-add">
              <PlusCircle size={15} /> Add Component
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="component-grid">
          {filtered.map((c) => <ComponentCard key={c.id} component={c} />)}
        </div>
      ) : (
        /* List view — compact rows */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {filtered.map((c) => {
            return (
              <div
                key={c.id}
                className="card"
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', cursor: 'pointer', padding: 'var(--sp-3) var(--sp-4)' }}
                onClick={() => navigate(`/component/${c.id}`)}
                id={`list-item-${c.id}`}
              >
                {/* Thumb */}
                <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--bg-base)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                  {c.image_urls?.[0]
                    ? <img src={c.image_urls[0]} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Package size={18} style={{ color: 'var(--text-subtle)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="truncate" style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.category}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="text-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald-700)' }}>
                    {c.quantity}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.unit}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
