import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../redux/store';
import './api/axios';

// Pages
import LoginPage from '../pages/LoginPage';
import RegistrationPage from '../pages/RegistrationPage';
import MainDashboard from "./pages/Main-Dashboard";
import UserManagementPage from '../pages/UserManagementPage';
import ReportsDashboard from "./pages/ReportsDashboard";

// Components
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute.jsx';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />}/>
          <Route path="/register" element={<RegistrationPage />}/>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          }/>
          <Route path="/reports" element={
            <ProtectedRoute>
              <ReportsDashboard />
            </ProtectedRoute>
          }/>
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <AdminRoute>
                <UserManagementPage />
              </AdminRoute>
            </ProtectedRoute>
          }/>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
