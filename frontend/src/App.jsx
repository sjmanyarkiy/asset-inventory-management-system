import { BrowserRouter, Routes, Route } from "react-router-dom";

import AssetsPage from "./pages/AssetsPage";
import VendorsPage from "./pages/VendorsPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import CategoriesPage from "./pages/CategoriesPage";
import TypesPage from "./pages/TypesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Asset Inventory System</h1>} />

        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/types" element={<TypesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
