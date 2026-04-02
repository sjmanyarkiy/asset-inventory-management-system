import React from "react";
import DataTable from "./DataTable";

export default function RepairedTab() {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    fetch("/api/reports/repaired")
      .then((r) => r.json())
      .then((json) => setData(json.items || []))
      .catch(() => setData([]));
  }, []);

  const columns = [
    { header: "Repair ID", accessor: "repair_id" },
    { header: "Asset ID", accessor: "asset_id" },
    { header: "Status", accessor: "status" },
    { header: "Reported At", accessor: "reported_at" },
  ];

  return (
    <div>
      <h3>Repaired</h3>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
