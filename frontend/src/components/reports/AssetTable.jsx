import React from 'react'

export default function AssetTable({ assets = [] }) {
  return (
    <div className="overflow-auto mt-4">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="text-left">
            <th className="p-2 border">Asset</th>
            <th className="p-2 border">Department</th>
            <th className="p-2 border">Assigned To</th>
            <th className="p-2 border">Vendor</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => (
            <tr key={a.id}>
              <td className="p-2 border">
                {a.name}
                <div className="text-xs text-gray-500">{a.asset_code || a.barcode || ''}</div>
              </td>
              <td className="p-2 border">{a.department || 'Unassigned'}</td>
              <td className="p-2 border">{a.assignedTo || a.assigned_to || 'N/A'}</td>
              <td className="p-2 border">{a.vendor || 'Unassigned'}</td>
              <td className="p-2 border">{a.category || 'Unassigned'}</td>
              <td className="p-2 border">{a.status || ''}</td>
            </tr>
          ))}

          {assets.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-600">No assets match selected filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
