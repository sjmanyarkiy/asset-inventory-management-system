import React from 'react'

export default function Filters({ departments = [], vendors = [], categories = [], options = {}, filters = {}, setFilters }) {
  // support both shapes: options={depts,vendors,categories} or direct arrays
  const { depts = [], vendors: optVendors = [], categories: optCategories = [] } = options
  const deptList = departments.length ? departments : depts
  const vendorList = vendors.length ? vendors : optVendors
  const categoryList = categories.length ? categories : optCategories

  const update = (key, value) => setFilters(f => ({ ...f, [key]: value }))

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <label>
        Department
        <br />
        <select value={filters.department ?? 'all'} onChange={e => update('department', e.target.value)}>
          <option value="all">All</option>
          {deptList.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </label>

      <label>
        Vendor
        <br />
        <select value={filters.vendor ?? 'all'} onChange={e => update('vendor', e.target.value)}>
          <option value="all">All</option>
          {vendorList.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>

      <label>
        Category
        <br />
        <select value={filters.category ?? 'all'} onChange={e => update('category', e.target.value)}>
          <option value="all">All</option>
          {categoryList.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      <label>
        Status
        <br />
        <select value={filters.status ?? 'all'} onChange={e => update('status', e.target.value)}>
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="under repair">Under Repair</option>
          <option value="maintenance">Maintenance</option>
          <option value="retired">Retired</option>
        </select>
      </label>

      <label style={{ marginLeft: 6 }}>
        Search
        <br />
        <input type="search" value={filters.search ?? filters.q ?? ''} onChange={e => update('search', e.target.value)} placeholder="Search assets..." />
      </label>
    </div>
  )
}
