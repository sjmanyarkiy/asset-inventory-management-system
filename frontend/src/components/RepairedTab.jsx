import React from "react";
import DataTable from "./DataTable";
import axios from "../api/axios";
import { useEffect } from 'react';

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

  useEffect(() => {
    axios.get("http://localhost:5000/api/reports/assigned")
      .then(res => {
        console.log("Assigned data:", res.data);
        setData(res.data);
      })
      .catch(err => {
        console.error("Assigned tab error:", err.response || err);
      });
  }, []);

  return (
    <div>
      <h3>Repaired</h3>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
