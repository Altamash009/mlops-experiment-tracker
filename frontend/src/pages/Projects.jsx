import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import { getProjects, createProject, updateProject, deleteProject } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaFolderOpen, FaCode, FaBrain } from 'react-icons/fa';

const BLANK = { project_name: '', description: '', framework: '', task_type: '' };

const STAGE_COLORS = {
  Active:   { bg: 'var(--cf-green-dim)',  color: 'var(--cf-green)'  },
  Archived: { bg: 'var(--cf-surface)',    color: 'var(--cf-text-muted)' },
};

export default function Projects() {
  const { setProject } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(Array.isArray(data) ? data : (data.projects || []));
    } catch {
      setError('Failed to load projects.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(BLANK); setShowCreate(true); setError(''); };
  const openEdit   = (p) => { setEditTarget(p); setForm({ project_name: p.project_name, description: p.description || '', framework: p.framework || '', task_type: p.task_type || '' }); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.project_name.trim()) { setError('Project name is required.'); return; }
    setSaving(true); setError('');
    try {
      if (editTarget) {
        await updateProject(editTarget.project_id, form);
        setEditTarget(null);
      } else {
        const data = await createProject(form);
        if (data.project_id) setProject(data.project_id, data.project_name);
        setShowCreate(false);
      }
      await load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save project.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteProject(deleteTarget.project_id);
      setDeleteTarget(null);
      await load();
    } catch { setError('Failed to delete project.'); }
    finally { setSaving(false); }
  };

  const FormModal = ({ title, onClose }) => (
    <Modal title={title} onClose={onClose}>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSave}>
        <div className="form-group">
          <label className="form-label">Project Name *</label>
          <input className="form-input" placeholder="My ML Project" value={form.project_name}
            onChange={e => setForm({...form, project_name: e.target.value})} required />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" placeholder="What are you building?" value={form.description}
            onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <div className="grid-2" style={{ gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Framework</label>
            <select className="form-select" value={form.framework} onChange={e => setForm({...form, framework: e.target.value})}>
              <option value="">— Select —</option>
              {['PyTorch','TensorFlow','Scikit-learn','XGBoost','Keras','JAX','Other'].map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Task Type</label>
            <select className="form-select" value={form.task_type} onChange={e => setForm({...form, task_type: e.target.value})}>
              <option value="">— Select —</option>
              {['Classification','Regression','NLP','Computer Vision','Clustering','Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Project'}</button>
        </div>
      </form>
    </Modal>
  );

  return (
    <Layout
      title="Projects"
      subtitle="Manage your ML experiment projects"
      actions={
        <button className="btn btn-primary btn-sm" onClick={openCreate} id="new-project-btn">
          <FaPlus /> New Project
        </button>
      }
    >
      {error && !showCreate && !editTarget && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /><span>Loading projects…</span></div>
      ) : projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><FaFolderOpen /></div>
            <div className="empty-title">No Projects Yet</div>
            <div className="empty-subtitle">Create your first project to start tracking experiments.</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openCreate}><FaPlus /> Create Project</button>
          </div>
        </div>
      ) : (
        <div className="grid-3 stagger">
          {projects.map((p, i) => {
            const sc = STAGE_COLORS[p.status] || STAGE_COLORS.Active;
            return (
              <div key={p.project_id} className="card animate-fadeIn" style={{ animationDelay: `${i * 60}ms`, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--cf-orange-dim)', color: 'var(--cf-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    <FaBrain />
                  </div>
                  <span style={{ ...sc, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
                    {p.status || 'Active'}
                  </span>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--cf-text-primary)', marginBottom: 6 }}>{p.project_name}</h3>
                <p style={{ fontSize: 13, color: 'var(--cf-text-muted)', marginBottom: 14, minHeight: 36 }}>{p.description || 'No description provided.'}</p>

                <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                  {p.framework  && <span className="tag"><FaCode style={{ marginRight: 4, fontSize: 10 }} />{p.framework}</span>}
                  {p.task_type  && <span className="tag">{p.task_type}</span>}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setProject(p.project_id, p.project_name)}>
                    Select
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)} title="Edit"><FaEdit /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(p)} title="Delete"><FaTrash /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <FormModal title="Create New Project" onClose={() => setShowCreate(false)} />}
      {editTarget  && <FormModal title="Edit Project"       onClose={() => setEditTarget(null)} />}

      {deleteTarget && (
        <Modal title="Delete Project" onClose={() => setDeleteTarget(null)}>
          <p style={{ color: 'var(--cf-text-secondary)', marginBottom: 20 }}>
            Are you sure you want to delete <strong style={{ color: 'var(--cf-text-primary)' }}>{deleteTarget.project_name}</strong>?
            This will permanently delete all runs, metrics, and artifacts.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>{saving ? 'Deleting…' : 'Delete Project'}</button>
          </div>
        </Modal>
      )}
    </Layout>
  );
}
