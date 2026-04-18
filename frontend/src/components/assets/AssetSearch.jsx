import { useEffect, useState } from "react";
import api from "../../services/api";

const AssetSearch = ({ search, setSearch, filters, setFilters }) => {
  const [dropdowns, setDropdowns] = useState({
    categories: [],
    types: [],
    vendors: [],
    departments: [],
  });

  const [localSearch, setLocalSearch] = useState(search || "");

  useEffect(() => {
    setLocalSearch(search || "");
  }, [search]);

  // =========================
  // LOAD DROPDOWNS (SHARED SOURCE OF TRUTH)
  // =========================
  const loadDropdowns = async () => {
    try {
      const [c, t, v, d] = await Promise.all([
        api.get("/categories"),
        api.get("/types"),
        api.get("/vendors"),
        api.get("/departments"),
      ]);

      setDropdowns({
        categories: c.data.data || [],
        types: t.data.data || [],
        vendors: v.data.data || [],
        departments: d.data.data || [],
      });
    } catch (err) {
      console.error("Dropdown load error:", err);
    }
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  // =========================
  // DEBOUNCED SEARCH → backend field: q
  // =========================
  useEffect(() => {
    const delay = setTimeout(() => {
      setSearch(localSearch);
    }, 400);

    return () => clearTimeout(delay);
  }, [localSearch, setSearch]);

  // =========================
  // FILTER UPDATE
  // =========================
  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // RESET FILTERS
  // =========================
  const resetFilters = () => {
    setLocalSearch("");
    setSearch("");

    setFilters({
      category_id: "",
      asset_type_id: "",
      vendor_id: "",
      department_id: "",
      status: "",
    });
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">

        {/* SEARCH (backend: q) */}
        <input
          type="text"
          placeholder="Search assets..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="border p-2 rounded col-span-2"
        />

        {/* CATEGORY */}
        <select
          name="category_id"
          value={filters.category_id}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          {dropdowns.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* TYPE */}
        <select
          name="asset_type_id"
          value={filters.asset_type_id}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">All Types</option>
          {dropdowns.types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        {/* VENDOR */}
        <select
          name="vendor_id"
          value={filters.vendor_id}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">All Vendors</option>
          {dropdowns.vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        {/* DEPARTMENT */}
        <select
          name="department_id"
          value={filters.department_id}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">All Departments</option>
          {dropdowns.departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        {/* ✅ STATUS FILTER (ADDED ONLY CHANGE) */}
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="under_repair">Under Repair</option>
          <option value="retired">Retired</option>
        </select>

      </div>

      {/* RESET */}
      <div className="mt-3">
        <button
          onClick={resetFilters}
          className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default AssetSearch;