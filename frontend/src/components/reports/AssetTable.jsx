import React from "react";

const AssetTable = ({ assets = [] }) => {
  return (
    <div className="overflow-auto mt-4">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="text-left">
            <th className="p-2 border">Asset</th>
            <th className="p-2 border">Department</th>
            <th className="p-2 border">Vendor</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => (
            <tr key={a.id}>
              <td className="p-2 border">{a.name} <div className="text-xs text-gray-500">{a.asset_code || a.barcode}</div></td>
              <td className="p-2 border">{a.department || "Unassigned"}</td>
              <td className="p-2 border">{a.vendor || "Unassigned"}</td>
              <td className="p-2 border">{a.category || "Unassigned"}</td>
              <td className="p-2 border">{a.status}</td>
              <td className="p-2 border">{a.assigned_to || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssetTable;
