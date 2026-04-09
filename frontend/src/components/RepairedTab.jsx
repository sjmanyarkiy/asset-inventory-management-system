import React from "react";
import DataTable from "./DataTable";
import axios from "../api/axios";

export default function RepairedTab() {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    axios
      .get("/api/reports/repaired")
      .then((r) => mounted && setData(r.data.items || []))
      .catch(() => mounted && setData([]));
    return () => (mounted = false);
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
