import React from "react";

const ExportButtons = ({ assets = [] }) => {
  const exportCSV = () => {
    if (!assets || assets.length === 0) return;

    const headers = ["Asset", "Asset Code", "Department", "Vendor", "Category", "Status"];
    const rows = assets.map((a) => [
      a.name,
      a.asset_code || a.barcode || "",
      a.department || "",
      a.vendor || "",
      a.category || "",
      a.status,
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `assets-report-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    // Lightweight fallback: convert CSV to new window printable view
    const html = `
      <html>
        <head><title>Assets Report</title></head>
        <body>
          <h1>Assets Report</h1>
          <pre>${JSON.stringify(assets, null, 2)}</pre>
        </body>
      </html>
    `;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.print();
  };

  return (
    <div className="flex gap-2">
      <button onClick={exportCSV} className="px-3 py-2 rounded bg-blue-600 text-white">Export CSV</button>
      <button onClick={exportPDF} className="px-3 py-2 rounded bg-gray-700 text-white">Export PDF</button>
    </div>
  );
};

export default ExportButtons;
