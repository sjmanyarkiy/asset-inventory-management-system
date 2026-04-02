import React from "react";
import DataTable from "./DataTable";

export default function AssignedTab() {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    // For scaffold: fetch from /api/reports/assigned
    fetch("/api/reports/assigned")
      .then((r) => r.json())
      .then((json) => setData(json.items || []))
      .catch(() => setData([]));
  }, []);

  const columns = [
    { header: "Assignment ID", accessor: "assignment_id" },
    { header: "Asset", accessor: "asset_name" },
    { header: "Assigned To", accessor: "assigned_to" },
    { header: "Assigned At", accessor: "assigned_at" },
  ];

  return (
    <div>
      <h3>Assigned Assets</h3>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
