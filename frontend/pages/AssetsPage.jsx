import { useEffect, useState } from "react";
import axios from "../src/api/axios";

import AssetSearch from "../src/components/AssetSearch";
import AssetList from "../src/components/AssetList";
import AssetForm from "./AssetForm";

const AssetsPage = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category_id: "",
    asset_type_id: "",
    vendor_id: "",
    department_id: "",
    status: ""
  });

  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // const BASE_URL = "http://127.0.0.1:5000";

  // =========================
  // FETCH ASSETS (FIXED QUERY MATCH BACKEND)
  // =========================
  // const fetchAssets = async () => {
  //   setLoading(true);

  //   try {
  //     const res = await axios.get(`${BASE_URL}/assets`, {
  //       params: {
  //         page,
  //         q: search,
  //         ...filters
  //       }
  //     });

  //     setAssets(res.data.data || []);
  //   } catch (err) {
  //     console.error("Fetch assets error:", err);
  //   }

  //   setLoading(false);
  // };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/assets", {
        params: {
          page,
          search,
          ...filters
        }
      });

      setAssets(res.data.assets || []);
    } catch (err) {
      console.error("Fetch assets error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, [search, filters, page]);

  // =========================
  // DELETE
  // =========================
  // const handleDelete = async (id) => {
  //   if (!window.confirm("Delete this asset?")) return;

  //   try {
  //     await axios.delete(`${BASE_URL}/assets/${id}`);
  //     fetchAssets();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    try {
      await axios.delete(`/api/assets/${id}`);
      fetchAssets();
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (asset) => {
    setSelectedAsset(asset);
    setShowForm(true);
  };

  // =========================
  // CREATE
  // =========================
  const handleCreate = () => {
    setSelectedAsset(null);
    setShowForm(true);
  };

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Assets</h1>

        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Add Asset
        </button>
      </div>

      {/* SEARCH */}
      <AssetSearch
        search={search}
        setSearch={setSearch}
        filters={filters}
        setFilters={setFilters}
      />

      {/* LIST */}
      <AssetList
        assets={assets}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* PAGINATION */}
      <div className="flex justify-center gap-3 mt-4">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        <span>Page {page}</span>

        <button onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>

      {/* MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <AssetForm
            selectedAsset={selectedAsset}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              fetchAssets();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AssetsPage;
