import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects  from './pages/Projects';
import Runs      from './pages/Runs';
import Compare   from './pages/Compare';
import Registry  from './pages/Registry';
import Artifacts from './pages/Artifacts';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Projects  /></ProtectedRoute>} />
      <Route path="/runs"     element={<ProtectedRoute><Runs      /></ProtectedRoute>} />
      <Route path="/compare"  element={<ProtectedRoute><Compare   /></ProtectedRoute>} />
      <Route path="/registry" element={<ProtectedRoute><Registry  /></ProtectedRoute>} />
      <Route path="/artifacts"element={<ProtectedRoute><Artifacts /></ProtectedRoute>} />
      <Route path="*"         element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;