import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import './App.css'

const AssetsPage = lazy(() => import('./pages/AssetsPage'))
const VendorsPage = lazy(() => import('./pages/VendorsPage'))
const DepartmentsPage = lazy(() => import('./pages/DepartmentsPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const TypesPage = lazy(() => import('./pages/TypesPage'))
const ReportsDashboard = lazy(() => import('./pages/ReportsDashboard'))
const Login = lazy(() => import('./components/Login'))
const PremiumLandingPage = lazy(() => import('./components/landing/PremiumLandingPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        containerStyle={{ top: 20, right: 20, zIndex: 999999 }}
        toastOptions={{ duration: 3000 }}
      />

      <div className="app-shell">
        <header className="app-header">
          <h1>Asset Inventory System</h1>
          <nav className="top-nav" aria-label="Main navigation">
            <Link to="/">Home</Link>
            <Link to="/assets">Assets</Link>
            <Link to="/reports">Reports</Link>
            <Link to="/login">Login</Link>
          </nav>
        </header>

        <Suspense fallback={<div className="route-loading">Loading page…</div>}>
          <Routes>
            <Route path="/" element={<PremiumLandingPage />} />
            <Route path="/login" element={<Login />} />

            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/types" element={<TypesPage />} />
            <Route path="/reports" element={<ReportsDashboard />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  )
}
