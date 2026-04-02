import React from "react";
import AccessTab from "../components/AccessTab";
import AssignedTab from "../components/AssignedTab";
import RepairedTab from "../components/RepairedTab";

export default function ReportsDashboard() {
  const [active, setActive] = React.useState("assigned");

  return (
    <div>
      <h2>Reports Dashboard</h2>
      <nav>
        <button onClick={() => setActive("access")}>Access</button>
        <button onClick={() => setActive("assigned")}>Assigned</button>
        <button onClick={() => setActive("repaired")}>Repaired</button>
      </nav>

      <div style={{ marginTop: 16 }}>
        {active === "access" && <AccessTab />}
        {active === "assigned" && <AssignedTab />}
        {active === "repaired" && <RepairedTab />}
      </div>
    </div>
  );
}
