import React from "react";
import DataTable from "./DataTable";
import axios from "../api/axios";

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

  return (
    <div>
      <h3>Access</h3>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
