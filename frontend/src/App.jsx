import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './components/Login'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 20 }}>
        <h1>Asset Inventory (Dev)</h1>
        <nav>
          <Link to="/">Home</Link> | <Link to="/login">Login</Link>
        </nav>

        <Routes>
          <Route path="/" element={<div>Welcome to the Asset Inventory frontend (dev)</div>} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
