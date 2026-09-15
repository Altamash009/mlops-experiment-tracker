import { useEffect, useState } from 'react';
import { getProjects } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProjectSelector({ onCreateNew }) {
  const { selectedProjectId, setProject } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjects()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.projects || []);
        setProjects(list);
        if (!selectedProjectId && list.length > 0) {
          setProject(list[0].project_id, list[0].project_name);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedProjectId, setProject]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '__new__') { if (onCreateNew) onCreateNew(); return; }
    const proj = projects.find(p => p.project_id === parseInt(val, 10));
    if (proj) setProject(proj.project_id, proj.project_name);
  };

  return (
    <div className="project-selector">
      <div className="project-selector-label">Active Project</div>
      {loading ? (
        <div style={{ fontSize: 12, color: 'var(--cf-text-muted)', padding: '8px 0', fontFamily: 'JetBrains Mono, monospace' }}>
          Loading workspace…
        </div>
      ) : (
        <select value={selectedProjectId || ''} onChange={handleChange}>
          {projects.length === 0 && (
            <option value="" disabled>No projects yet</option>
          )}
          {projects.map(p => (
            <option key={p.project_id} value={p.project_id}>
              {p.project_name}
            </option>
          ))}
          <option value="__new__">+ New Project</option>
        </select>
      )}
    </div>
  );
}
