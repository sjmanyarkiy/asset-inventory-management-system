import React, { useEffect, useState, useMemo } from 'react'
import ReportCards from '../components/reports/ReportCards'
import AssetTable from '../components/reports/AssetTable'
import Filters from '../components/reports/Filters'
import ExportButtons from '../components/reports/ExportButtons'

export default function ReportsDashboard() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ department: 'all', vendor: 'all', category: 'all', status: 'all', search: '' })

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch('/api/assets')
      .then(res => res.json())
      .then(data => {
        if (!mounted) return
        setAssets(data || [])
      })
      .catch(() => {
        // fallback demo data if backend is not running
        if (!mounted) return
        setAssets([
          { id: 1, name: 'Laptop A', department: 'Engineering', assignedTo: 'Alice', status: 'assigned', vendor: 'Dell', category: 'Laptop' },
          { id: 2, name: 'Projector X', department: 'Marketing', assignedTo: null, status: 'available', vendor: 'Epson', category: 'AV' },
          { id: 3, name: 'Router R', department: 'IT', assignedTo: 'Bob', status: 'under repair', vendor: 'Cisco', category: 'Network' }
        ])
      })
      .finally(() => setLoading(false))

    return () => { mounted = false }
  }, [])

  const options = useMemo(() => {
    const depts = Array.from(new Set(assets.map(a => a.department).filter(Boolean)))
    const vendors = Array.from(new Set(assets.map(a => a.vendor).filter(Boolean)))
    const categories = Array.from(new Set(assets.map(a => a.category).filter(Boolean)))
    return { depts, vendors, categories }
  }, [assets])

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      if (filters.department !== 'all' && a.department !== filters.department) return false
      if (filters.vendor !== 'all' && a.vendor !== filters.vendor) return false
      if (filters.category !== 'all' && a.category !== filters.category) return false
      if (filters.status !== 'all' && a.status !== filters.status) return false
      if (filters.search && !`${a.name} ${a.assignedTo || ''} ${a.department}`.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })
  }, [assets, filters])

  return (
    <div style={{ padding: 20 }}>
      <h2>Reports Dashboard</h2>
      <ReportCards assets={assets} />

      <div style={{ marginTop: 20 }}>
        <Filters options={options} filters={filters} setFilters={setFilters} />
      </div>

      <div style={{ marginTop: 12 }}>
        <ExportButtons assets={filteredAssets} />
      </div>

      <div style={{ marginTop: 12 }}>
        {loading ? <div>Loading assets...</div> : <AssetTable assets={filteredAssets} />}
      </div>
    </div>
  )
}
