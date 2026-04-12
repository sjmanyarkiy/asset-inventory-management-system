import React, { useState } from "react";
import ImagePreview from "../shared/ImagePreview";

const AssetList = ({ assets = [], onEdit, onDelete }) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState("");

  const BASE_URL = "http://127.0.0.1:5000";

  const handleDelete = (id) => {
    if (!window.confirm("Delete this asset?")) return;

    onDelete?.(id);
    setMessage("Asset deleted successfully");

    setTimeout(() => setMessage(""), 2500);
  };

  if (!assets.length) {
    return <div className="text-center text-gray-500 mt-6">No assets found</div>;
  }

  return (
    <div className="mt-6 overflow-x-auto">

      {message && (
        <div className="mb-3 bg-green-100 text-green-700 p-2 rounded">
          {message}
        </div>
      )}

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Type</th>
            <th>Department</th>
            <th>Status</th>
            <th>Image</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {assets.map((a) => {

            // ✅ SAFE IMAGE PATH (no auto rendering, fixed slashes)
            const img = a.image_file
              ? `${BASE_URL}/${a.image_file.replace(/\\/g, "/")}`
              : null;

            return (
              <tr key={a.id} className="border-t">

                <td>{a.name}</td>
                <td>{a.category}</td>
                <td>{a.asset_type}</td>
                <td>{a.department}</td>
                <td>{a.status}</td>

                {/* IMAGE COLUMN */}
                <td className="text-center">
                  {img ? (
                    <div className="flex flex-col items-center gap-1">

                      {/* Thumbnail ONLY (no click preview here) */}
                      <img
                        src={img}
                        className="w-10 h-10 rounded object-cover"
                        alt="asset"
                      />

                      {/* ONLY this button triggers preview */}
                      <button
                        type="button"
                        onClick={() => setPreviewImage(img)}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                      >
                        Preview
                      </button>

                    </div>
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </td>

                <td className="text-right space-x-2">
                  <button
                    onClick={() => onEdit(a)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(a.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>

              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ✅ PREVIEW MODAL (ONLY opens via button click) */}
      {previewImage && (
        <ImagePreview
          image={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};

export default AssetList;