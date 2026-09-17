import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import IntroAnimation from './components/IntroAnimation';

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
  // Show intro once per session (clears on tab close)
  const [showIntro, setShowIntro] = useState(
    () => !sessionStorage.getItem('mlops_intro_seen')
  );

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem('mlops_intro_seen', '1');
    setShowIntro(false);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        {/* Full-screen 3-D Blender intro */}
        {showIntro && (
          <IntroAnimation onComplete={handleIntroComplete} />
        )}
        {/* Main app renders beneath; hidden until intro completes */}
        <div style={{ visibility: showIntro ? 'hidden' : 'visible' }}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;