import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";

import store from "../redux/store";
import "../api/axiosConfig";

// Pages
import LoginPage from "../pages/LoginPage";
import RegistrationPage from "../pages/RegistrationPage";
import MainDashboard from "../pages/Main-Dashboard.jsx";
import UserManagementPage from "../pages/UserManagementPage";
import ReportsDashboard from "../pages/ReportsDashboard.jsx";
import LandingPage from "../pages/LandingPage";
import AssetRequestPage from "../pages/AssetRequestPage.jsx";
import RequestApprovalPage from "../pages/RequestApprovalPage.jsx";
import UserProfilePage from "../pages/UserProfilePage.jsx";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import RepairRequestsPage from "../pages/RepairRequestPage.jsx";


import AssetsPage from "../pages/AssetsPage.jsx";
import VendorsPage from "../pages/VendorsPage.jsx";
import DepartmentsPage from "../pages/DepartmentsPage.jsx";
import CategoriesPage from "../pages/CategoriesPage.jsx";
import TypesPage from "../pages/TypesPage.jsx";

// Components
import ProtectedRoute from "../components/ProtectedRoute";
import AdminRoute from "../components/AdminRoute.jsx";
import AppLayout from "../components/AppLayout.jsx";

const App = () => {
  return (
    <Provider store={store}>
      <Router>

        {/* Global toast system (from colleague branch) */}
        <Toaster
          position="top-right"
          containerStyle={{
            top: 20,
            right: 20,
            zIndex: 999999,
          }}
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1f2937",
              color: "#fff",
              fontSize: "14px",
              borderRadius: "6px",
              zIndex: 999999,
            },
          }}
        />

        <Routes>

          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected core dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <MainDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ReportsDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin users */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AppLayout>
                    <UserManagementPage />
                  </AppLayout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          {/* New asset management pages (integrated properly) */}
          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AssetsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/vendors"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <VendorsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DepartmentsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CategoriesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/types"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <TypesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AssetRequestPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/repair-requests" element={
            <ProtectedRoute>
                <AppLayout>
                  <RepairRequestsPage />
                </AppLayout>
            </ProtectedRoute>
            } 
          />

          <Route
            path="/approvals"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RequestApprovalPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* User profile route */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <AppLayout>
                <UserProfilePage />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* <Route path="/admin/assets/create" element={
            <AdminRoute>
              <AppLayout>
                <CreateAssetPage />
              </AppLayout>
            </AdminRoute>
          } /> */}

          {/* <Route path="/admin/assets" element={
            <AdminRoute>
              <AppLayout>
                <ViewAssetsPage />
              </AppLayout>
            </AdminRoute>
          } /> */}

          {/* // View Routes (Protected) */}
          {/* <Route path="/assets" element={
            <ProtectedRoute>
              <AppLayout>
                <ViewAssetsPage />
              </AppLayout>
            </ProtectedRoute>
          } /> */}

          {/* Root redirect */}
          {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}

          {/* fallback */}
          {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
          <Route path="*" element={<div>404 Not Found</div>} />

        </Routes>
      </Router>
    </Provider>
  );
};

export default App;