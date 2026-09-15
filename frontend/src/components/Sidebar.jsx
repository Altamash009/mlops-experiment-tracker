import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaRocket, FaTachometerAlt, FaFolderOpen, FaDatabase,
  FaExchangeAlt, FaBoxOpen, FaCube, FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ProjectSelector from './ProjectSelector';

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: <FaTachometerAlt />, path: '/' },
  { label: 'Projects',    icon: <FaFolderOpen />,   path: '/projects' },
  { label: 'Runs',        icon: <FaDatabase />,      path: '/runs' },
  { label: 'Compare',     icon: <FaExchangeAlt />,   path: '/compare' },
  { label: 'Registry',    icon: <FaBoxOpen />,       path: '/registry' },
  { label: 'Artifacts',   icon: <FaCube />,          path: '/artifacts' },
];

export default function Sidebar({ onNewProject }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'ML';

  return (
    <aside className="app-sidebar animate-slideLeft">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon float-slow">
          <FaRocket />
        </div>
        <div className="sidebar-logo-text">
          <h2>MLOps Tracker</h2>
          <span>Telemetry v2.0</span>
        </div>
      </div>

      {/* Project Selector */}
      <ProjectSelector onCreateNew={onNewProject} />

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Telemetry Engine</div>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="link-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer: user + status */}
      <div className="sidebar-footer">
        {/* Backend status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', marginBottom: 12 }}>
          <span className="status-dot" />
          <span style={{ fontSize: 11, color: 'var(--cf-text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
            LIVE TELEMETRY
          </span>
        </div>

        {/* User card */}
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'Engineer'}</div>
            <div className="user-email">{user?.email || 'user@mlops.io'}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Sign out">
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </aside>
  );
}
