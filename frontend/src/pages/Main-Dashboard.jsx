import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import AssetList from "../components/AssetList";

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-1">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-3xl font-bold text-gray-800">{value ?? "—"}</span>
    </div>
  );
}

function MainDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/assets/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Stats fetch error:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        <MenuBar />

        <main className="flex-1 p-6 space-y-6">

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard label="Total Assets" value={stats?.total} />
            <SummaryCard label="Categories" value={stats ? Object.keys(stats.by_category).length : null} />
            <SummaryCard label="Assigned" value={stats?.by_status?.Assigned} />
            <SummaryCard label="Under Repair" value={stats?.by_status?.Repair} />
          </div>

          {/* Status Breakdown */}
          {stats?.by_status && (
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Assets by Status</h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.by_status).map(([status, count]) => (
                  <span
                    key={status}
                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                  >
                    {status}: <strong>{count}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          {stats?.by_category && (
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Assets by Category</h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.by_category).map(([cat, count]) => (
                  <span
                    key={cat}
                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200"
                  >
                    {cat}: <strong>{count}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Asset List with Search */}
          <SearchBar onSearch={setSearchTerm} />
          <AssetList searchTerm={searchTerm} />

        </main>
      </div>
    </div>
  );
}

export default MainDashboard;