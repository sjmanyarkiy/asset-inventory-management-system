import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import AssetsPage from './pages/AssetsPage'
import VendorsPage from './pages/VendorsPage'
import DepartmentsPage from './pages/DepartmentsPage'
import CategoriesPage from './pages/CategoriesPage'
import TypesPage from './pages/TypesPage'
import ReportsDashboard from './pages/ReportsDashboard'
import Login from './components/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        containerStyle={{ top: 20, right: 20, zIndex: 999999 }}
        toastOptions={{ duration: 3000 }}
      />

      <div style={{ padding: 20 }}>
        <header>
          <h1>Asset Inventory System</h1>
          <nav>
            <Link to="/">Home</Link> | <Link to="/login">Login</Link> | <Link to="/reports">Reports</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<div>Welcome to the Asset Inventory frontend (dev)</div>} />
          <Route path="/login" element={<Login />} />

          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/vendors" element={<VendorsPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/types" element={<TypesPage />} />
          <Route path="/reports" element={<ReportsDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
