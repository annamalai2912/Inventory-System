import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderOpen, LogOut, PlusCircle, FileDown, ShieldCheck, Download,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useComponentsStore } from '../../store/components.store';
import { useExport } from '../../hooks/useExport';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { BrandLogo } from '../ui/BrandLogo';

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/catalog',   icon: Package,          label: 'Catalog'      },
  { to: '/projects',  icon: FolderOpen,       label: 'Projects'     },
  { to: '/admin',     icon: ShieldCheck,      label: 'Admin Stream' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuthStore();
  const { components } = useComponentsStore();
  const { exportCSV } = useExport();
  const { isInstallable, installApp } = usePWAInstall();
  const navigate = useNavigate();

  const initials = profile?.name
    ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="app-shell">
      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <BrandLogo size={40} />
        </div>

        <span className="nav-section-label">Navigation</span>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            id={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        <span className="nav-section-label" style={{ marginTop: 'var(--sp-4)' }}>Quick Actions</span>
        <button
          className="nav-item"
          onClick={() => navigate('/add')}
          id="nav-add-component"
        >
          <PlusCircle size={17} />
          Add Component
        </button>
        <button
          className="nav-item"
          onClick={() => exportCSV(components)}
          id="nav-export-csv"
        >
          <FileDown size={17} />
          Export CSV
        </button>

        {isInstallable && (
          <button
            className="nav-item"
            onClick={installApp}
            style={{ color: 'var(--emerald-700)', fontWeight: 700 }}
            id="nav-install-pwa"
          >
            <Download size={17} />
            Install Mobile App
          </button>
        )}

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div className="user-name truncate">{profile?.name ?? 'Team Member'}</div>
              <button
                className="auth-tab"
                onClick={signOut}
                style={{ background: 'none', color: 'var(--text-muted)', padding: 0, fontSize: '0.65rem', fontWeight: 500, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                id="btn-sign-out"
              >
                <LogOut size={11} /> Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile Top Header ── */}
      <header className="mobile-header">
        <BrandLogo size={32} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
          <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>{initials}</div>
          <button
            onClick={signOut}
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
            id="mobile-btn-signout"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="main-content">
        {children}
      </main>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mobile-nav">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}
            id={`mobile-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <Icon size={20} />
            <span style={{ fontSize: '0.68rem', marginTop: 2 }}>{label === 'Admin Stream' ? 'Admin' : label}</span>
          </NavLink>
        ))}
        <button
          className="mobile-nav-item"
          onClick={() => navigate('/add')}
          id="mobile-nav-add"
        >
          <PlusCircle size={20} />
          <span style={{ fontSize: '0.68rem', marginTop: 2 }}>Add</span>
        </button>
      </nav>
    </div>
  );
}
