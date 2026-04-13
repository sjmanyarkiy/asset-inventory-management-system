import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AssetsPage from "./pages/AssetsPage";
import VendorsPage from "./pages/VendorsPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import CategoriesPage from "./pages/CategoriesPage";
import TypesPage from "./pages/TypesPage";
import ReportsDashboard from "./pages/ReportsDashboard";

function App() {
  return (
    <BrowserRouter>

      {/* ✅ GLOBAL TOAST SYSTEM (FIXED VERSION) */}
      <Toaster
        position="top-right"
        containerStyle={{
          top: 20,
          right: 20,
          zIndex: 999999, // 🔥 ensures it stays above everything
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
        <Route path="/" element={<h1>Asset Inventory System</h1>} />

        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/types" element={<TypesPage />} />
        <Route path="/reports" element={<ReportsDashboard />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;