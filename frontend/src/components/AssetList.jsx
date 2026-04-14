import { useEffect, useState } from "react";
import axios from "axios";

function AssetList({ searchTerm = "" }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 5;

  // Assignment state
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, status]);

  useEffect(() => {
    fetchAssets();
  }, [searchTerm, status, page]);

  const fetchAssets = () => {
    setLoading(true);

    const params = new URLSearchParams({
      search: searchTerm,
      status,
      page,
      per_page: perPage,
    });

    fetch(`http://localhost:5000/assets?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setAssets(data.assets || []);
        setTotalPages(Math.ceil(data.total / perPage));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/users?role=Employee"
      );
      setEmployees(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const openAssignModal = (asset) => {
    setSelectedAsset(asset);
    setSelectedUserId(asset.assigned_to_user_id || "");
    setShowModal(true);
    fetchEmployees();
  };

  const assignAsset = async () => {
    if (!selectedAsset || !selectedUserId) return;

    setAssigning(true);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/admin/assets/${selectedAsset.id}/assign`,
        {
          user_id: parseInt(selectedUserId),
        }
      );

      setAssets((prev) =>
        prev.map((a) =>
          a.id === selectedAsset.id ? res.data.asset : a
        )
      );

      setShowModal(false);
      setSelectedAsset(null);
      setSelectedUserId("");
    } catch (err) {
      console.error("Assignment failed:", err);
    } finally {
      setAssigning(false);
    }
  };

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
      <h3 className="text-2xl font-bold mb-4">Asset List</h3>

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

      {loading ? (
        <p className="text-gray-600">Loading assets...</p>
      ) : (
        <>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border text-left">ID</th>
                <th className="p-3 border text-left">Asset Name</th>
                <th className="p-3 border text-left">Category</th>
                <th className="p-3 border text-left">Status</th>
                <th className="p-3 border text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-3 text-gray-500">
                    No assets found
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="p-3 border">{asset.id}</td>
                    <td className="p-3 border">{asset.name}</td>
                    <td className="p-3 border">{asset.category}</td>
                    <td className={`p-3 border ${getStatusClass(asset.status)}`}>
                      {asset.status}
                    </td>

                    <td className="p-3 border">
                      <button
                        onClick={() => openAssignModal(asset)}
                        className="px-3 py-1 bg-blue-500 text rounded hover:bg-blue-600"
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

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
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {/* ASSIGN MODAL */}
          {showModal && selectedAsset && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-3">
                  Assign Asset
                </h2>

                <p className="mb-2">
                  <strong>{selectedAsset.name}</strong>
                </p>

                <select
                  className="w-full p-2 border rounded mb-4"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={assignAsset}
                    disabled={assigning || !selectedUserId}
                    className="px-4 py-2 bg-blue-500 rounded disabled:opacity-50"
                  >
                    {assigning ? "Assigning..." : "Assign"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AssetList;