import React from 'react'

export default function Filters({ options = {}, filters, setFilters }) {
  const { depts = [], vendors = [], categories = [] } = options

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <label>
        Department
        <br />
        <select value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}>
          <option value="all">All</option>
          {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </label>

      <label>
        Vendor
        <br />
        <select value={filters.vendor} onChange={e => setFilters(f => ({ ...f, vendor: e.target.value }))}>
          <option value="all">All</option>
          {vendors.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </label>

      <label>
        Category
        <br />
        <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}>
          <option value="all">All</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>

      <label>
        Status
        <br />
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="all">All</option>
          <option value="assigned">Assigned</option>
          <option value="available">Available</option>
          <option value="under repair">Under Repair</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </label>

      <label style={{ marginLeft: 6 }}>
        Search
        <br />
        <input type="search" value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} placeholder="Search assets..." />
      </label>
    </div>
  )
}
