import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Layers, Archive, PlusCircle } from 'lucide-react';
import { useComponentsStore } from '../store/components.store';
import { StatCard } from '../components/dashboard/StatCard';
import { CategoryChart, CategoryPieChart } from '../components/dashboard/CategoryChart';
import { useComponents } from '../hooks/useComponents';
import { useAuthStore } from '../store/auth.store';

export function DashboardPage() {
  useComponents(); // subscribe to realtime
  const { components } = useComponentsStore();
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalPartTypes = components.length;
    const totalUnits = components.reduce((sum, c) => sum + c.quantity, 0);
    return { totalPartTypes, totalUnits };
  }, [components]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {firstName} 👋</h1>
          <p className="page-subtitle">Here's a snapshot of your hardware inventory on hand.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => navigate('/add')} id="dashboard-add-btn">
            <PlusCircle size={16} /> Add Component
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <StatCard
          label="Total Component Types"
          value={stats.totalPartTypes}
          sub="distinct component models"
          icon={Layers}
          color="emerald"
        />
        <StatCard
          label="Total Units On Hand"
          value={stats.totalUnits.toLocaleString()}
          sub="total components in inventory"
          icon={Archive}
          color="sky"
        />
      </div>

      {/* Charts & Recently updated */}
      {components.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 'var(--sp-8)' }}>
          <div className="empty-state-icon"><Package size={28} /></div>
          <div className="empty-state-title">Inventory is empty</div>
          <p className="empty-state-desc">Your team hasn't added any components yet. Start by adding your first component!</p>
          <button className="btn btn-primary" onClick={() => navigate('/add')} id="empty-add-btn">
            <PlusCircle size={16} /> Add First Component
          </button>
        </div>
      ) : (
        <div className="dashboard-grid">
          <CategoryChart components={components} />
          <CategoryPieChart components={components} />

          {/* Most recently updated */}
          <div className="chart-card" style={{ gridColumn: 'span 2' }}>
            <div className="chart-title">Recently Updated Components</div>
            <div className="flex flex-col" style={{ gap: 'var(--sp-2)' }}>
              {[...components]
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 5)
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3"
                    style={{ cursor: 'pointer', padding: 'var(--sp-3)', borderRadius: 'var(--r-md)', transition: 'background var(--t-fast)', border: '1px solid var(--border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--emerald-50)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => navigate(`/component/${c.id}`)}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 'var(--r-md)', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      {c.image_urls?.[0]
                        ? <img src={c.image_urls[0]} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <Package size={18} style={{ color: 'var(--text-subtle)' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="truncate" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.category} · Updated {new Date(c.updated_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="text-mono" style={{ color: 'var(--emerald-700)', fontWeight: 800, fontSize: '1.2rem' }}>{c.quantity}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>{c.unit}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
