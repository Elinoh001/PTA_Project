import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import Services from './pages/Services';
import Settings from './pages/Settings';
import CadreLogique from './pages/CadreLogique';
import Pcop from './pages/Pcop';
import SuiviActivitie from './pages/SuiviActivitie';
import Users from './pages/Users';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Composant pour appliquer la classe dark sur le <html>
const ThemeWrapper = ({ children }) => {
  const { darkMode } = useTheme();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemeWrapper>
          <Router>
            <div className="App bg-white dark:bg-gray-900 transition-colors min-h-screen">
              <Routes>
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/activities" 
                  element={
                    <ProtectedRoute>
                      <Activities />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/services" 
                  element={
                    <ProtectedRoute>
                      <Services />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/cadre-logique" 
                  element={
                    <ProtectedRoute>
                      <CadreLogique />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/pcop" 
                  element={
                    <ProtectedRoute>
                      <Pcop />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/users" 
                  element={
                    <ProtectedRoute>
                      <Users />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/suivi" 
                  element={
                    <ProtectedRoute>
                      <SuiviActivitie />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
        </ThemeWrapper>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
