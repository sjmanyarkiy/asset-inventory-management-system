import { useEffect, useState } from "react";

function AssetList({ searchTerm = "" }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const perPage = 5;

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, status]);

  // Fetch assets
  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams({
      search: searchTerm,
      status,
      page,
      per_page: perPage,
    });

    const url = `http://127.0.0.1:5000/assets?${params.toString()}`;
    console.log("Fetching from:", url);

    fetch(url)
      .then((res) => {
        console.log("Response status:", res.status);

        if (!res.ok) {
          throw new Error("Failed to fetch assets");
        }

        return res.json();
      })
      .then((data) => {
        console.log("Fetched data:", data);
        console.log("Assets array:", data.assets);

        setAssets(data.assets || []);
        setTotalPages(Math.ceil((data.total || 0) / perPage));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setAssets([]);
        setLoading(false);
      });
  }, [searchTerm, status, page]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Available":
        return "text-green-600 font-semibold";
      case "Assigned":
        return "text-blue-600 font-semibold";
      case "Repair":
        return "text-red-600 font-semibold";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-2xl font-bold mb-2">Asset List</h3>

      <p className="text-sm text-gray-500 mb-4">
        Loaded assets: {assets.length}
      </p>

      {/* Filter */}
      <div className="flex mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 border rounded ml-auto"
        >
          <option value="">All Statuses</option>
          <option value="Assigned">Assigned</option>
          <option value="Available">Available</option>
          <option value="Repair">Repair</option>
        </select>
      </div>

      {/* Loading */}
      {loading ? (
        <p className="text-gray-600">Loading assets...</p>
      ) : (
        <>
          {/* Table */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border text-left">ID</th>
                <th className="p-3 border text-left">Asset Name</th>
                <th className="p-3 border text-left">Category</th>
                <th className="p-3 border text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center p-3 text-gray-500"
                  >
                    No assets found
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="p-3 border">{asset.id}</td>
                    <td className="p-3 border">{asset.name}</td>
                    <td className="p-3 border">{asset.category}</td>
                    <td
                      className={`p-3 border ${getStatusClass(
                        asset.status
                      )}`}
                    >
                      {asset.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() =>
                setPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AssetList;