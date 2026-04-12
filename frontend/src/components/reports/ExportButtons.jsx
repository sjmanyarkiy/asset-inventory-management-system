import React from 'react'
import { jsPDF } from 'jspdf'

function toCSV(rows) {
  if (!rows || !rows.length) return ''
  const headers = Object.keys(rows[0])
  const lines = [headers.join(',')]
  for (const r of rows) {
    lines.push(headers.map(h => `"${(r[h] ?? '').toString().replace(/"/g, '""')}"`).join(','))
  }
  return lines.join('\n')
}

export default function ExportButtons({ assets = [] }) {
  const exportCSV = () => {
    const rows = assets.map(a => ({ Asset: a.name, Department: a.department, AssignedTo: a.assignedTo || '', Status: a.status, Vendor: a.vendor || '', Category: a.category || '' }))
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'assets-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = () => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(14)
      doc.text('Assets Report', 10, 10)
      let y = 20
      assets.forEach(a => {
        doc.setFontSize(10)
        doc.text(`${a.name} — ${a.department} — ${a.assignedTo || '-'} — ${a.status}`, 10, y)
        y += 8
        if (y > 280) { doc.addPage(); y = 20 }
      })
      doc.save('assets-report.pdf')
      return
    } catch (err) {
      // fallback: open printable window
    }

    const win = window.open('', '_blank')
    const html = `
      <html>
        <head><title>Assets Report</title></head>
        <body>
          <h1>Assets Report</h1>
          <table border="1" cellpadding="6" cellspacing="0">
            <thead><tr><th>Asset</th><th>Department</th><th>Assigned To</th><th>Status</th></tr></thead>
            <tbody>
              ${assets.map(a => `<tr><td>${a.name}</td><td>${a.department || ''}</td><td>${a.assignedTo || ''}</td><td>${a.status || ''}</td></tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>`
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 300)
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={exportCSV}>Export CSV</button>
      <button onClick={exportPDF}>Export PDF</button>
    </div>
  )
}
