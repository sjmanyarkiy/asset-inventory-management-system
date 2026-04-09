import React from "react";
import DataTable from "./DataTable";
import axios from "../api/axios";

export default function AssignedTab() {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    axios
      .get("/api/reports/assigned")
      .then((r) => {
        if (mounted) setData(r.data.items || []);
      })
      .catch(() => mounted && setData([]));
    return () => (mounted = false);
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
