import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AssetSearch from "../components/assets/AssetSearch";
import AssetList from "../components/assets/AssetList";
import AssetModal from "../components/assets/AssetModal";

import {
  fetchAssets,
  deleteAsset,
} from "../features/assets/assetSlice";

const AssetsPage = () => {
  const dispatch = useDispatch();

  const { data: assets = [] } = useSelector((state) => state.assets);

  const [search, setSearch] = useState("");

  // ✅ UPDATED: includes STATUS filter (already backend-ready)
  const [filters, setFilters] = useState({
    category_id: "",
    asset_type_id: "",
    vendor_id: "",
    department_id: "",
    status: "",   // ✅ NOW ACTIVELY USED AS FILTER
  });

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // =========================
  // FETCH ASSETS (REDUX SOURCE OF TRUTH)
  // =========================
  useEffect(() => {
    dispatch(
      fetchAssets({
        q: search,
        ...filters,
      })
    );
  }, [search, filters, dispatch]);

  // =========================
  // DELETE
  // =========================
  const handleDelete = (id) => {
    dispatch(deleteAsset(id));
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };

  // =========================
  // CREATE
  // =========================
  const handleCreate = () => {
    setSelectedAsset(null);
    setShowModal(true);
  };

  // =========================
  // SUCCESS CALLBACK
  // =========================
  const handleSuccess = () => {
    setShowModal(false);
    setSelectedAsset(null);

    dispatch(
      fetchAssets({
        q: search,
        ...filters,
      })
    );
  };

  return (
    <div className="p-4">

      {/* SEARCH + FILTERS */}
      <AssetSearch
        search={search}
        setSearch={setSearch}
        filters={filters}
        setFilters={setFilters}
      />

      {/* ACTIONS */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Add Asset
        </button>
      </div>

      {/* LIST */}
      <AssetList
        assets={assets}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* MODAL */}
      {showModal && (
        <AssetModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          selectedAsset={selectedAsset}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default AssetsPage;