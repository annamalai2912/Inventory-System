import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';

export function AuthPage() {
  const { signIn, signUp, loading } = useAuthStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (tab === 'login') {
      const { error: err } = await signIn(email, password);
      if (err) {
        if (err.toLowerCase().includes('rate limit')) {
          setError('Supabase email rate limit reached. Turn off "Confirm Email" in your Supabase Auth settings to bypass.');
        } else {
          setError(err);
        }
      } else {
        navigate('/');
      }
    } else {
      if (!name.trim()) { setError('Name is required'); return; }
      const { error: err } = await signUp(email, password, name);
      if (err) {
        if (err.toLowerCase().includes('rate limit')) {
          setError('Email rate limit reached on Supabase. Go to Supabase Dashboard -> Authentication -> Providers -> Email and disable "Confirm Email".');
        } else {
          setError(err);
        }
      } else {
        setSuccess('Account created successfully! You can now log in.');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-slide-up">
        {/* Logo */}
        <div className="auth-logo">
          <BrandLogo size={46} />
        </div>

        <h1 className="auth-title">{tab === 'login' ? 'Welcome back' : 'Create account'}</h1>
        <p className="auth-subtitle">
          {tab === 'login'
            ? 'Sign in to manage your component inventory.'
            : "Join your team's inventory workspace."}
        </p>

        {/* Tabs */}
        <div className="auth-tab-group">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError(''); }} id="tab-login">Sign In</button>
          <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => { setTab('signup'); setError(''); }} id="tab-signup">Sign Up</button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={submit}>
          {tab === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Full Name <span>*</span></label>
              <input
                id="auth-name"
                className="form-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun Kumar"
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email <span>*</span></label>
            <input
              id="auth-email"
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@techknots.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password <span>*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                id="auth-password"
                className="form-input"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                required
                minLength={6}
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                className="btn btn-icon btn-ghost"
                onClick={() => setShowPass((s) => !s)}
                style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', padding: 4, color: 'var(--text-muted)' }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.25)', borderRadius: 'var(--r-md)', padding: 'var(--sp-3)', color: 'var(--rose)', fontSize: '0.8rem' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 'var(--r-md)', padding: 'var(--sp-3)', color: 'var(--emerald-800)', fontSize: '0.8rem' }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            id="btn-auth-submit"
            style={{ marginTop: 'var(--sp-2)' }}
          >
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : null}
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: 'var(--sp-6)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            className="btn btn-ghost"
            style={{ padding: 0, color: 'var(--emerald-700)', fontSize: '0.75rem', fontWeight: 700 }}
            onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setError(''); }}
          >
            {tab === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
