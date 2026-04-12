import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF']

export default function ReportsCharts({ assets = [] }) {
  const byStatus = assets.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc }, {})
  const pieData = Object.keys(byStatus).map((k) => ({ name: k, value: byStatus[k] }))

  const byDept = assets.reduce((acc, a) => { acc[a.department] = (acc[a.department] || 0) + 1; return acc }, {})
  const barData = Object.keys(byDept).map(k => ({ department: k, count: byDept[k] }))

  return (
    <div style={{ display: 'flex', gap: 20, marginTop: 18 }}>
      <div style={{ width: 300, height: 220 }}>
        <h4>Status Breakdown</h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>{pieData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}</Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ flex: 1, height: 220 }}>
        <h4>Assets by Department</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis dataKey="department" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
