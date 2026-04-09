import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ReportsDashboard from './pages/ReportsDashboardClean';
import Login from './components/Login';
import { AuthProvider, useAuth } from './AuthContext';

function PrivateRoute({ children }) {
  const auth = useAuth();
  if (!auth || !auth.user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <ReportsDashboard />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/reports" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
