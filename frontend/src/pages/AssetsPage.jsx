import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import AssetSearch from "../components/assets/AssetSearch";
import AssetList from "../components/assets/AssetList";
import AssetModal from "../components/assets/AssetModal";

import {
  fetchAssets,
  deleteAsset,
} from "../features/assets/assetSlice";

const DEFAULT_FILTERS = {
  category_id: "",
  asset_type_id: "",
  vendor_id: "",
  department_id: "",
  status: "",
};

const buildQueryParams = (search, filters) => {
  return Object.entries({ q: search, ...filters }).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

const AssetsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    data: assets = [],
    loading,
    error,
  } = useSelector((state) => state.assets);

  const [search, setSearch] = useState(searchParams.get("q") || "");

  // ✅ UPDATED: includes STATUS filter (already backend-ready)
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    category_id: searchParams.get("category_id") || "",
    asset_type_id: searchParams.get("asset_type_id") || "",
    vendor_id: searchParams.get("vendor_id") || "",
    department_id: searchParams.get("department_id") || "",
    status: searchParams.get("status") || "",
  }));

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingAssetIds, setDeletingAssetIds] = useState(() => new Set());
  const inFlightDeleteIdsRef = useRef(new Set());

  const queryParams = useMemo(() => buildQueryParams(search, filters), [search, filters]);
  const visibleAssets = useMemo(
    () => assets.filter((asset) => !deletingAssetIds.has(asset.id)),
    [assets, deletingAssetIds]
  );

  // =========================
  // FETCH ASSETS (REDUX SOURCE OF TRUTH)
  // =========================
  useEffect(() => {
    dispatch(fetchAssets(queryParams));
  }, [queryParams, dispatch]);

  useEffect(() => {
    setSearchParams(queryParams, { replace: true });
  }, [queryParams, setSearchParams]);

  // =========================
  // DELETE
  // =========================
  const handleDelete = useCallback(async (id) => {
    if (inFlightDeleteIdsRef.current.has(id)) {
      return;
    }

    inFlightDeleteIdsRef.current.add(id);
    setDeletingAssetIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    try {
      await dispatch(deleteAsset({ id })).unwrap();
      toast.success("Asset deleted successfully");
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Failed to delete asset");
    } finally {
      inFlightDeleteIdsRef.current.delete(id);
      setDeletingAssetIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [dispatch]);

  // =========================
  // EDIT
  // =========================
  const handleEdit = useCallback((asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  }, []);

  // =========================
  // CREATE
  // =========================
  const handleCreate = useCallback(() => {
    setSelectedAsset(null);
    setShowModal(true);
  }, []);

  // =========================
  // SUCCESS CALLBACK
  // =========================
  const handleSuccess = useCallback(() => {
    const wasEdit = !!selectedAsset;
    setShowModal(false);
    setSelectedAsset(null);
    toast.success(wasEdit ? "Asset updated successfully" : "Asset created successfully");
  }, [selectedAsset]);

  const handleRetry = useCallback(() => {
    dispatch(fetchAssets(queryParams));
  }, [dispatch, queryParams]);

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
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          + Add Asset
        </button>
      </div>

      {/* LIST */}
      <AssetList
        assets={visibleAssets}
        loading={loading}
        error={error}
        onRetry={handleRetry}
        deletingAssetIds={deletingAssetIds}
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