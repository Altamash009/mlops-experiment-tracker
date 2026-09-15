import { useState } from 'react';
import Sidebar from './Sidebar';
import Modal from './Modal';
import BackgroundAnimation from './UI/BackgroundAnimation';
import CursorAnimation from './UI/CursorAnimation';
import { createProject } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function Layout({ children, title, subtitle, actions }) {
  const [showNewProject, setShowNewProject] = useState(false);
  const [form, setForm] = useState({ project_name: '', description: '', framework: '', task_type: '' });
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState('');
  const { setProject } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.project_name.trim()) { setErr('Project name is required.'); return; }
    setCreating(true); setErr('');
    try {
      const data = await createProject(form);
      if (data.error) { setErr(data.error); return; }
      setProject(data.project_id, data.project_name);
      setShowNewProject(false);
      setForm({ project_name: '', description: '', framework: '', task_type: '' });
      window.location.reload(); // reload to refresh project selector
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to create project.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="app-shell">
      {/* Interactive Cursor and Ambient Background Animation */}
      <BackgroundAnimation />
      <CursorAnimation />

      <Sidebar onNewProject={() => setShowNewProject(true)} />

      <div className="app-main">
        {/* Top header */}
        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {title && (
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--cf-text-primary)', letterSpacing: '-0.01em' }}>
                {title}
              </span>
            )}
            {subtitle && (
              <span style={{ fontSize: 12, color: 'var(--cf-text-muted)', fontFamily: 'JetBrains Mono, monospace', background: 'var(--cf-surface)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--cf-border)' }}>
                {subtitle}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {actions}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {isDark ? <FaSun style={{ color: '#ffc285' }} /> : <FaMoon style={{ color: '#2563eb' }} />}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="app-content">
          {children}
        </main>
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <Modal title="Create New Project" onClose={() => setShowNewProject(false)}>
          {err && <div className="alert alert-error">{err}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input className="form-input" placeholder="e.g. LLM-FineTuning-Pipeline" value={form.project_name}
                onChange={e => setForm({...form, project_name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Experiment objective & baseline details..." value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="grid-2" style={{ gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Framework</label>
                <select className="form-select" value={form.framework} onChange={e => setForm({...form, framework: e.target.value})}>
                  <option value="">— Select —</option>
                  <option>PyTorch</option><option>TensorFlow</option><option>Scikit-learn</option>
                  <option>XGBoost</option><option>Keras</option><option>JAX</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Task Type</label>
                <select className="form-select" value={form.task_type} onChange={e => setForm({...form, task_type: e.target.value})}>
                  <option value="">— Select —</option>
                  <option>Classification</option><option>Regression</option><option>NLP</option>
                  <option>Computer Vision</option><option>Clustering</option><option>Other</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowNewProject(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Creating…' : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
