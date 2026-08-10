import { useState, useMemo } from 'react';
import {
  ShieldCheck, Activity, Users, Search, RefreshCw, Clock, ArrowDownRight, ArrowUpRight, Filter
} from 'lucide-react';
import { useRealtimeAudit } from '../hooks/useRealtimeAudit';
import { CategoryBadge } from '../components/ui/Badge';
import type { ChangeType } from '../types';

const CHANGE_TYPE_CONFIG: Record<ChangeType, { label: string; badge: string; icon: any }> = {
  add:     { label: 'Added Component', badge: 'badge-emerald', icon: ArrowUpRight },
  restock: { label: 'Restocked',       badge: 'badge-emerald', icon: ArrowUpRight },
  use:     { label: 'Used in Project', badge: 'badge-amber',   icon: ArrowDownRight },
  remove:  { label: 'Removed / Lost',  badge: 'badge-rose',    icon: ArrowDownRight },
  adjust:  { label: 'Quantity Adjust', badge: 'badge-sky',     icon: Activity },
};

export function AdminPage() {
  const { logs, loading, isLive, refetch } = useRealtimeAudit();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Stats calculation from real database logs
  const memberStats = useMemo(() => {
    const stats: Record<string, { count: number; name: string }> = {};
    for (const log of logs) {
      const uName = log.user_name || 'Team Member';
      if (!stats[uName]) stats[uName] = { count: 0, name: uName };
      stats[uName].count += 1;
    }
    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [logs]);

  // Filtered log list
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedUser && log.user_name !== selectedUser) return false;
      if (selectedType && log.change_type !== selectedType) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchName = log.user_name.toLowerCase().includes(q);
        const matchComp = log.component_name?.toLowerCase().includes(q);
        const matchProj = log.project_tag?.toLowerCase().includes(q);
        if (!matchName && !matchComp && !matchProj) return false;
      }
      return true;
    });
  }, [logs, selectedUser, selectedType, search]);

  const getRelativeTime = (ts: string) => {
    const diffMs = Date.now() - new Date(ts).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', marginBottom: 'var(--sp-1)' }}>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
              <ShieldCheck size={28} style={{ color: 'var(--emerald-600)' }} />
              Admin Realtime Activity Log
            </h1>
            {isLive && (
              <span className="badge badge-emerald" style={{ padding: '4px 12px', fontSize: '0.75rem', gap: 6 }}>
                <span className="low-stock-dot" style={{ background: 'var(--emerald-600)', boxShadow: '0 0 8px var(--emerald-500)' }} />
                REALTIME STREAM ACTIVE
              </span>
            )}
          </div>
          <p className="page-subtitle">
            Live audit trail showing every stock edit, component upload, and inventory action across your 5 team members in real time.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={refetch} id="btn-admin-refresh">
            <RefreshCw size={15} className={loading ? 'spinner' : ''} /> Refresh Stream
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-6)' }}>
        <div className="stat-card" style={{ background: 'var(--emerald-50)', borderColor: 'var(--emerald-200)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label" style={{ color: 'var(--emerald-800)' }}>Total Audit Logs</span>
            <div className="stat-icon emerald"><Activity size={18} /></div>
          </div>
          <div className="stat-value" style={{ color: 'var(--emerald-900)' }}>{logs.length}</div>
          <div className="stat-sub" style={{ color: 'var(--emerald-700)' }}>recorded actions</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Active Team Members</span>
            <div className="stat-icon sky"><Users size={18} /></div>
          </div>
          <div className="stat-value">{memberStats.length}</div>
          <div className="stat-sub">updating stock simultaneously</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="stat-label">Most Active Contributor</span>
            <div className="stat-icon emerald"><ShieldCheck size={18} /></div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.25rem', paddingTop: '4px' }}>
            {memberStats[0]?.name || 'None'}
          </div>
          <div className="stat-sub">{memberStats[0]?.count || 0} stock edits</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card mb-6" style={{ padding: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          {/* Search */}
          <div className="search-bar" style={{ minWidth: 260 }}>
            <Search size={16} className="search-icon" />
            <input
              className="form-input"
              placeholder="Search by member, component, or project tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="admin-search-input"
            />
          </div>

          {/* Member Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Filter size={13} /> Member:
            </span>
            <button
              className={`filter-chip${!selectedUser ? ' active' : ''}`}
              onClick={() => setSelectedUser('')}
              id="filter-user-all"
            >
              All Members
            </button>
            {memberStats.map((m) => (
              <button
                key={m.name}
                className={`filter-chip${selectedUser === m.name ? ' active' : ''}`}
                onClick={() => setSelectedUser(selectedUser === m.name ? '' : m.name)}
                id={`filter-user-${m.name.replace(/\s+/g, '-')}`}
              >
                {m.name} ({m.count})
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginLeft: 'auto' }}>
            <select
              className="form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{ padding: 'var(--sp-2) var(--sp-3)', fontSize: '0.8rem', width: 'auto' }}
              id="admin-type-select"
            >
              <option value="">All Action Types</option>
              <option value="add">Additions</option>
              <option value="restock">Restocks</option>
              <option value="use">Usage Logs</option>
              <option value="remove">Removals</option>
              <option value="adjust">Adjustments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Stream Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--sp-4) var(--sp-6)', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="section-label" style={{ margin: 0 }}>Live Activity Feed</div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Showing <strong>{filteredLogs.length}</strong> of {logs.length} events
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="empty-state" style={{ border: 'none', borderRadius: 0 }}>
            <div className="empty-state-icon"><Activity size={28} /></div>
            <div className="empty-state-title">
              {logs.length === 0 ? 'No activity logged yet' : 'No matching activity logs'}
            </div>
            <p className="empty-state-desc">
              {logs.length === 0
                ? 'When team members add, edit, or log stock usage, actions will stream live here in real time.'
                : 'Try clearing your search or member filters.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredLogs.map((log) => {
              const cfg = CHANGE_TYPE_CONFIG[log.change_type] || CHANGE_TYPE_CONFIG.adjust;
              const IconComp = cfg.icon;
              const isPos = log.quantity_delta > 0;

              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--sp-4)',
                    padding: 'var(--sp-4) var(--sp-6)',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background var(--t-fast)',
                  }}
                  className="animate-slide-up"
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-base)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                  id={`audit-row-${log.id}`}
                >
                  {/* User Avatar */}
                  <div className="avatar" style={{ width: 40, height: 40, fontSize: '0.85rem' }}>
                    {log.user_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>

                  {/* Member & Action Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {log.user_name}
                      </span>
                      <span className={`badge ${cfg.badge}`}>
                        <IconComp size={12} /> {cfg.label}
                      </span>
                      {log.category && <CategoryBadge category={log.category} />}
                    </div>

                    <div style={{ marginTop: 2, fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      {log.component_name || 'Hardware Component'}
                    </div>
                  </div>

                  {/* Project Tag */}
                  {log.project_tag ? (
                    <div className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      📁 {log.project_tag}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-subtle)', fontSize: '0.75rem' }}>—</span>
                  )}

                  {/* Quantity Delta */}
                  <div style={{ textAlign: 'right', minWidth: 70 }}>
                    <div
                      className={isPos ? 'audit-delta-pos' : 'audit-delta-neg'}
                      style={{ fontSize: '1.25rem' }}
                    >
                      {isPos ? `+${log.quantity_delta}` : log.quantity_delta}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div style={{ textAlign: 'right', minWidth: 100, fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={11} /> {getRelativeTime(log.timestamp)}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
