import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import './api/axiosConfig';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* public route */}
          <Route path="/registration" element={<RegistrationPage />}/>
          <Route path="/registration" element={<LoginPage />}/>

          {/* protected route */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage/>
            </ProtectedRoute>
          }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </Provider>
  )
}

export default App