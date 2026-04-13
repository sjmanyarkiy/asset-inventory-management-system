import React from "react";

const Filters = ({
  departments = [],
  vendors = [],
  categories = [],
  filters,
  setFilters,
}) => {
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div className="flex gap-3 flex-wrap items-end">
      <div>
        <label className="block text-sm text-gray-600">Department</label>
        <select
          value={filters.department || ""}
          onChange={(e) => update("department", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600">Vendor</label>
        <select
          value={filters.vendor || ""}
          onChange={(e) => update("vendor", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          {vendors.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600">Category</label>
        <select
          value={filters.category || ""}
          onChange={(e) => update("category", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600">Status</label>
        <select
          value={filters.status || ""}
          onChange={(e) => update("status", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="under_repair">Under Repair</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-600">Search</label>
        <input
          value={filters.q || ""}
          onChange={(e) => update("q", e.target.value)}
          placeholder="Search asset name or code"
          className="border p-2 rounded"
        />
      </div>
    </div>
  );
};

export default Filters;
