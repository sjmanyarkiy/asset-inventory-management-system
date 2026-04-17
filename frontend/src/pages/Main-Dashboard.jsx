import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import AssetList from "../components/AssetList";

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-1">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-3xl font-bold text-gray-800">
        {value ?? 0}
      </span>
    </div>
  );
}

function MainDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://127.0.0.1:5000/api/dashboard/summary",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to load dashboard: ${res.status}`);
        }

        const data = await res.json();
        console.log("Dashboard data:", data);

        setStats(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        <MenuBar />

        <main className="flex-1 p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SummaryCard label="Total Assets" value={stats?.total_assets} />
            <SummaryCard label="Categories" value={stats?.total_categories} />
            <SummaryCard label="Total Users" value={stats?.total_users} />
            <SummaryCard
              label="Under Repair"
              value={stats?.by_status?.Repair ?? 0}
            />
          </div>

          {/* Status Breakdown */}
          {stats?.by_status && (
            <div className="bg-white rounded-xl shadow p-5">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Assets by Status
              </h2>
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
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                Assets by Category
              </h2>
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

          {/* Search + Assets */}
          <SearchBar onSearch={setSearchTerm} />
          <AssetList searchTerm={searchTerm} />
        </main>
      </div>
    </div>
  );
}

export default MainDashboard;