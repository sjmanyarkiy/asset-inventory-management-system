import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import './api/axiosConfig';

import RegisterPage from './pages/RegistrationPage';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* public route */}
          <Route path="registration" element={<RegistrationPage />}/>

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