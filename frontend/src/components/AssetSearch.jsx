import { useEffect, useState } from "react";
import axios from "../../src/api/axios";

const AssetSearch = ({ search, setSearch, filters, setFilters }) => {
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [localSearch, setLocalSearch] = useState(search);

  const extractData = (res) => res?.data?.data || res?.data || [];

  const fetchDropdownData = async () => {
    try {
      const [catRes, typeRes, vendorRes, deptRes] = await Promise.all([
        axios.get("/categories"),
        axios.get("/api/types"),
        axios.get("/api/vendors"),
        axios.get("/api/departments")
      ]);

      setCategories(extractData(catRes));
      setTypes(extractData(typeRes));
      setVendors(extractData(vendorRes));
      setDepartments(extractData(deptRes));
    } catch (err) {
      console.error("Dropdown load error:", err);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearch(localSearch.trim());
    }, 400);

    return () => clearTimeout(delay);
  }, [localSearch]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value ? Number(e.target.value) : ""
    });
  };

  const resetFilters = () => {
    setLocalSearch("");
    setSearch("");

    setFilters({
      category_id: "",
      asset_type_id: "",
      vendor_id: "",
      department_id: "",
      status: ""
    });
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-4">

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">

        <input
          type="text"
          placeholder="Search assets..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="border p-2 rounded col-span-2"
        />

        <select name="category_id" value={filters.category_id} onChange={handleChange} className="border p-2 rounded">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select name="asset_type_id" value={filters.asset_type_id} onChange={handleChange} className="border p-2 rounded">
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <select name="vendor_id" value={filters.vendor_id} onChange={handleChange} className="border p-2 rounded">
          <option value="">All Vendors</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>

        <select name="department_id" value={filters.department_id} onChange={handleChange} className="border p-2 rounded">
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

      </div>

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