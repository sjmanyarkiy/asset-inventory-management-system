import React, { memo, useCallback, useMemo, useState } from "react";
import ImagePreview from "../shared/ImagePreview";

const BASE_URL = "http://127.0.0.1:5001";

const STATUS_STYLES = {
  assigned: "bg-green-100 text-green-800 border border-green-200",
  available: "bg-blue-100 text-blue-800 border border-blue-200",
  under_repair: "bg-orange-100 text-orange-800 border border-orange-200",
  retired: "bg-gray-100 text-gray-700 border border-gray-200",
};

const STATUS_LABELS = {
  available: "Available",
  assigned: "Assigned",
  under_repair: "Under Repair",
  retired: "Retired",
};

const getStatusClasses = (statusValue) => {
  const normalizedStatus = String(statusValue || "").trim().toLowerCase();
  return STATUS_STYLES[normalizedStatus] || "bg-slate-100 text-slate-700 border border-slate-200";
};

const areAssetRowPropsEqual = (prevProps, nextProps) => {
  return (
    prevProps.asset === nextProps.asset &&
    prevProps.isDeleting === nextProps.isDeleting &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onRequestDelete === nextProps.onRequestDelete &&
    prevProps.onPreview === nextProps.onPreview
  );
};

const AssetRow = memo(function AssetRow({ asset, isDeleting, onEdit, onRequestDelete, onPreview }) {
  const normalizedStatus = useMemo(
    () => String(asset.status || "Unknown").trim().toLowerCase(),
    [asset.status]
  );

  const img = useMemo(
    () => (asset.image_file ? `${BASE_URL}/${asset.image_file.replace(/\\/g, "/")}` : null),
    [asset.image_file]
  );

  const handleEditClick = useCallback(() => {
    onEdit?.(asset);
  }, [asset, onEdit]);

  const handleDeleteClick = useCallback(() => {
    onRequestDelete?.(asset.id);
  }, [asset.id, onRequestDelete]);

  const handlePreviewClick = useCallback(() => {
    if (img) onPreview?.(img);
  }, [img, onPreview]);

  return (
    <tr className="border-t">
      <td className="p-2">{asset.name}</td>
      <td className="p-2">{asset.category}</td>
      <td className="p-2">{asset.asset_type}</td>
      <td className="p-2">{asset.department}</td>
      <td className="p-2">
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(normalizedStatus)}`}>
          {STATUS_LABELS[normalizedStatus] || asset.status || "Unknown"}
        </span>
      </td>

      <td className="p-2 text-center">
        {img ? (
          <div className="flex flex-col items-center gap-1">
            <img
              src={img}
              className="w-10 h-10 rounded object-cover"
              alt="asset"
            />

            <button
              type="button"
              onClick={handlePreviewClick}
              disabled={isDeleting}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Preview
            </button>
          </div>
        ) : (
          <span className="text-gray-400">No Image</span>
        )}
      </td>

      <td className="p-2 text-right space-x-2">
        <button
          onClick={handleEditClick}
          disabled={isDeleting}
          className={`px-2 py-1 rounded text-white ${
            isDeleting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          Edit
        </button>

        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className={`px-2 py-1 rounded text-white ${
            isDeleting ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </td>
    </tr>
  );
}, areAssetRowPropsEqual);

const AssetList = ({
  assets = [],
  loading = false,
  error = null,
  onRetry,
  deletingAssetIds = [],
  onEdit,
  onDelete,
}) => {
  const [previewImage, setPreviewImage] = useState(null);

  const deletingSet = useMemo(() => {
    if (deletingAssetIds instanceof Set) {
      return deletingAssetIds;
    }

    return new Set(deletingAssetIds);
  }, [deletingAssetIds]);
  const loadingRows = useMemo(() => Array.from({ length: 5 }), []);

  const handleRequestDelete = useCallback((id) => {
    if (!window.confirm("Delete this asset?")) return;

    onDelete?.(id);
  }, [onDelete]);

  const handlePreviewOpen = useCallback((image) => {
    setPreviewImage(image);
  }, []);

  const handlePreviewClose = useCallback(() => {
    setPreviewImage(null);
  }, []);

  const rowItems = useMemo(
    () =>
      assets.map((asset) => (
        <AssetRow
          key={asset.id}
          asset={asset}
          isDeleting={deletingSet.has(asset.id)}
          onEdit={onEdit}
          onRequestDelete={handleRequestDelete}
          onPreview={handlePreviewOpen}
        />
      )),
    [assets, deletingSet, onEdit, handleRequestDelete, handlePreviewOpen]
  );


  if (loading) {
    return (
      <div className="mt-6 rounded border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
          Loading assets...
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Department</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Image</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingRows.map((_, idx) => (
                <tr key={idx} className="border-t animate-pulse">
                  <td className="p-2"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="p-2"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                  <td className="p-2"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                  <td className="p-2"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="p-2"><div className="h-5 bg-gray-200 rounded-full w-20" /></td>
                  <td className="p-2"><div className="h-8 w-8 bg-gray-200 rounded" /></td>
                  <td className="p-2"><div className="ml-auto h-4 bg-gray-200 rounded w-20" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">We couldn’t load assets right now.</p>
        <p className="text-xs text-red-600 mt-1">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!assets.length) {
    return (
      <div className="mt-6 rounded border border-dashed border-gray-300 bg-white p-8 text-center">
        <p className="text-gray-700 font-medium">No assets found.</p>
        <p className="text-sm text-gray-500 mt-1">Click “Add Asset” to get started.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Department</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Image</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {rowItems}
        </tbody>
      </table>

      {/* ✅ PREVIEW MODAL (ONLY opens via button click) */}
      {previewImage && (
        <ImagePreview
          image={previewImage}
          onClose={handlePreviewClose}
        />
      )}
    </div>
  );
};

export default memo(AssetList);