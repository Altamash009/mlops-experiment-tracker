import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import { loginUser, registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BackgroundAnimation from '../components/UI/BackgroundAnimation';
import CursorAnimation from '../components/UI/CursorAnimation';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      if (tab === 'login') {
        const data = await loginUser({ email: form.email, password: form.password });
        if (data.error) { setError(data.error); return; }
        login(data.token, data.user);
        navigate('/');
      } else {
        if (!form.name.trim()) { setError('Name is required.'); return; }
        const data = await registerUser({ name: form.name, email: form.email, password: form.password });
        if (data.error) { setError(data.error); return; }
        setSuccess('Account created! You can now log in.');
        setTab('login');
        setForm({ ...form, name: '' });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <BackgroundAnimation />
      <CursorAnimation />

      {/* Background orbs */}
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ background: 'linear-gradient(135deg, #ffffff, #eae3d9)', border: '1px solid var(--cf-border)', color: 'var(--cf-orange)' }}><FaRocket /></div>
          <h1>MLOps Tracker</h1>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>
            Sign In
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); setSuccess(''); }}>
            Create Account
          </button>
        </div>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={submit}>
          {tab === 'register' && (
            <div className="form-group animate-fadeIn">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <FaUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--cf-text-muted)', fontSize: 13 }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={handle}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--cf-text-muted)', fontSize: 13 }} />
              <input
                className="form-input"
                style={{ paddingLeft: 38 }}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handle}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--cf-text-muted)', fontSize: 13 }} />
              <input
                className="form-input"
                style={{ paddingLeft: 38, paddingRight: 42 }}
                type={showPw ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handle}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--cf-text-muted)', cursor: 'pointer', fontSize: 14 }}
              >
                {showPw ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</>
            ) : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--cf-text-muted)' }}>
          MLOps Tracker — Experiment tracking for ML teams
        </p>
      </div>
    </div>
  );
}
