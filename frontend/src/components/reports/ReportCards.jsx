import React from "react";

const ReportCards = ({ assets = [] }) => {
  const total = assets.length;
  const assigned = assets.filter((a) => a.status === "assigned").length;
  const available = assets.filter((a) => a.status === "available").length;
  const underRepair = assets.filter((a) => a.status === "under_repair" || a.status === "maintenance").length;

  const card = (title, value, bg = "bg-gray-100") => (
    <div className={`p-4 rounded shadow ${bg}`} style={{ minWidth: 160 }}>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );

  return (
    <div className="flex gap-4 flex-wrap">
      {card("Total Assets", total, "bg-white")}
      {card("Assigned", assigned, "bg-white")}
      {card("Available", available, "bg-white")}
      {card("Under Repair", underRepair, "bg-white")}
    </div>
  );
};

export default ReportCards;
