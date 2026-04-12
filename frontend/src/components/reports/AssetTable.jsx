import React from 'react'

export default function AssetTable({ assets = [] }) {
  return (
    <div style={{ marginTop: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Asset</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Department</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Assigned To</th>
            <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {assets.map(a => (
            <tr key={a.id}>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{a.name}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{a.department}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{a.assignedTo || '-'}</td>
              <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{a.status}</td>
            </tr>
          ))}
          {assets.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: 12, textAlign: 'center', color: '#666' }}>No assets match selected filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
