import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('mlops_token'));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mlops_user')); } catch { return null; }
  });
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    const v = localStorage.getItem('mlops_project_id');
    return v ? parseInt(v, 10) : null;
  });
  const [selectedProjectName, setSelectedProjectName] = useState(
    () => localStorage.getItem('mlops_project_name') || ''
  );

  const login = (tokenVal, userVal) => {
    setToken(tokenVal);
    setUser(userVal);
    localStorage.setItem('mlops_token', tokenVal);
    localStorage.setItem('mlops_user', JSON.stringify(userVal));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSelectedProjectId(null);
    setSelectedProjectName('');
    localStorage.removeItem('mlops_token');
    localStorage.removeItem('mlops_user');
    localStorage.removeItem('mlops_project_id');
    localStorage.removeItem('mlops_project_name');
  };

  const setProject = (id, name) => {
    setSelectedProjectId(id);
    setSelectedProjectName(name || '');
    if (id) {
      localStorage.setItem('mlops_project_id', id);
      localStorage.setItem('mlops_project_name', name || '');
    } else {
      localStorage.removeItem('mlops_project_id');
      localStorage.removeItem('mlops_project_name');
    }
  };

  return (
    <AuthContext.Provider value={{
      token, user, selectedProjectId, selectedProjectName,
      login, logout, setProject,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
