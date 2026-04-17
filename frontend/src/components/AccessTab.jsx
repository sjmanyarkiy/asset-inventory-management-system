import React from "react";
import DataTable from "./DataTable";
import axios from "../api/axios";

import { useEffect } from 'react';

export default function AccessTab() {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    axios
      .get("/api/reports/access")
      .then((r) => mounted && setData(r.data.items || []))
      .catch(() => mounted && setData([]));
    return () => (mounted = false);
  }, []);

  const columns = [
    { header: "User ID", accessor: "user_id" },
    { header: "User Name", accessor: "user_name" },
    { header: "Access Level", accessor: "access_level" },
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
      <h3>Access</h3>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
