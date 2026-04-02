import React from "react";
import DataTable from "./DataTable";

export default function AccessTab() {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    fetch("/api/reports/access")
      .then((r) => r.json())
      .then((json) => setData(json.items || []))
      .catch(() => setData([]));
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
