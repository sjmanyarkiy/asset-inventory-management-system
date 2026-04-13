import React, { useEffect, useMemo, useState } from "react";
import ReportCards from "../components/reports/ReportCards";
import Filters from "../components/reports/Filters";
import AssetTable from "../components/reports/AssetTable";
import ExportButtons from "../components/reports/ExportButtons";
import { getAssets } from "../features/assets/assetAPI";

const ReportsDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    setLoading(true);
    getAssets()
      .then((res) => setAssets(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const departments = useMemo(() => [...new Set(assets.map((a) => a.department).filter(Boolean))], [assets]);
  const vendors = useMemo(() => [...new Set(assets.map((a) => a.vendor).filter(Boolean))], [assets]);
  const categories = useMemo(() => [...new Set(assets.map((a) => a.category).filter(Boolean))], [assets]);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (filters.department && a.department !== filters.department) return false;
      if (filters.vendor && a.vendor !== filters.vendor) return false;
      if (filters.category && a.category !== filters.category) return false;
      if (filters.status && a.status !== filters.status) return false;
      if (filters.q) {
        const q = filters.q.toLowerCase();
        if (!(`${a.name}`.toLowerCase().includes(q) || `${a.asset_code || a.barcode}`.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [assets, filters]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reports Dashboard</h1>

      <section className="mb-6">
        <ReportCards assets={assets} />
      </section>

      <section className="mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Assets</h2>
          <ExportButtons assets={filtered} />
        </div>

        <div className="mt-3">
          <Filters
            departments={departments}
            vendors={vendors}
            categories={categories}
            filters={filters}
            setFilters={setFilters}
          />
        </div>
      </section>

      <section>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <AssetTable assets={filtered} />
        )}
      </section>
    </div>
  );
};

export default ReportsDashboard;
