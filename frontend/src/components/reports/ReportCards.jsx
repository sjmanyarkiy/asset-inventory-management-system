import React from 'react'

export default function ReportCards({ assets = [] }) {
  const total = assets.length
  const assigned = assets.filter(a => a.status === 'assigned').length
  const available = assets.filter(a => a.status === 'available').length
  const underRepair = assets.filter(a => ['under_repair', 'under repair', 'maintenance'].includes(a.status)).length

  const card = (title, value) => (
    <div className="p-4 rounded shadow bg-white" style={{ minWidth: 160 }}>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  )

  return (
    <div className="flex gap-4 flex-wrap">
      {card('Total Assets', total)}
      {card('Assigned', assigned)}
      {card('Available', available)}
      {card('Under Repair', underRepair)}
    </div>
  )
}
