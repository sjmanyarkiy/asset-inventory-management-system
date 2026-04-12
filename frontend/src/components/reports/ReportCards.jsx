import React from 'react'

export default function ReportCards({ assets = [] }) {
  const total = assets.length
  const assigned = assets.filter(a => a.status === 'assigned').length
  const available = assets.filter(a => a.status === 'available').length
  const underRepair = assets.filter(a => a.status === 'under repair' || a.status === 'maintenance').length

  const cardStyle = { display: 'inline-block', padding: 12, marginRight: 12, border: '1px solid #ddd', borderRadius: 6, minWidth: 140 }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={cardStyle}>
          <div>Total Assets</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{total}</div>
        </div>
        <div style={cardStyle}>
          <div>Assigned</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{assigned}</div>
        </div>
        <div style={cardStyle}>
          <div>Available</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{available}</div>
        </div>
        <div style={cardStyle}>
          <div>Under Repair</div>
          <div style={{ fontSize: 24, fontWeight: 600 }}>{underRepair}</div>
        </div>
      </div>
    </div>
  )
}
