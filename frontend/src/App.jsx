import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../redux/store';
import '../api/axiosConfig';

// Pages
import LoginPage from '../pages/LoginPage';
import RegistrationPage from '../pages/RegistrationPage';
import MainDashboard from '../src/pages/Main-Dashboard';
import UserManagementPage from '../pages/UserManagementPage';
import ReportsDashboard from '../src/pages/ReportsDashboard';

// Components
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute.jsx';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />}/>
          <Route path="/register" element={<RegistrationPage />}/>

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          }
          />
          {/* <Route path="/dashboard" element={<MainDashboard />} /> */}

          {/* Reports route */}
          <Route path="/reports" element={
            <ProtectedRoute>
              <ReportsDashboard />
            </ProtectedRoute>
          }
          />

          {/* Admin routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <UserManagementPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - Not found */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;