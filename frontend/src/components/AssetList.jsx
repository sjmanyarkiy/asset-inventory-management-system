import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
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

    fetch(`http://localhost:5000/api/assets?${params.toString()}`)
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
      setEmployees([]);
    }
  };

  const openAssignModal = (asset) => {
    console.log("OPEN MODAL", asset);
    setSelectedAsset(asset);
    setSelectedUserId("");
    setShowModal(true);
    fetchEmployees();
  };

  // const assignAsset = async () => {
  //   if (!selectedAsset || !selectedUserId) return;

  //   setAssigning(true);

  //   try {
  //     const res = await axios.post(
  //       `http://localhost:5000/api/admin/assets/${selectedAsset.id}/assign`,
  //       {
  //         user_id: parseInt(selectedUserId),
  //       }
  //     );

  //     setAssets((prev) =>
  //       prev.map((a) =>
  //         a.id === selectedAsset.id ? res.data.asset : a
  //       )
  //     );

  //     setShowModal(false);
  //     setSelectedAsset(null);
  //     setSelectedUserId("");
  //   } catch (err) {
  //     console.error("Assignment failed:", err);
  //   } finally {
  //     setAssigning(false);
  //   }
  // };

  const assignAsset = async () => {
    if (!selectedAsset || !selectedUserId) return;

    setAssigning(true);

    try {
      // const res = await axios.post(
      //   `http://localhost:5000/api/admin/assets/${selectedAsset.id}/assign`,
      //   { user_id: parseInt(selectedUserId) }
      // );
      const res = await axios.post(
        `http://localhost:5000/api/assets/${selectedAsset.id}/assign`,
        { user_id: parseInt(selectedUserId) }
      );
      // update UI instantly
      setAssets((prev) =>
        prev.map((a) =>
          a.id === selectedAsset.id ? res.data.asset : a
        )
      );

      setShowModal(false);
      setSelectedAsset(null);
      setSelectedUserId("");
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  const returnAsset = async (assetId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/assets/${assetId}/return`,
        { current_user_id: 1 } // replace with auth user
      );

      setAssets((prev) =>
        prev.map((a) => (a.id === assetId ? res.data.asset : a))
      );
    } catch (err) {
      console.error(err);
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
                <th className="p-3 border text-left">Assigned To</th>
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
                    {/* <td className="p-3 border">{asset.name}</td> */}
                    <td className="p-3 border">{asset.asset_name}</td>
                    {/* <td className="p-3 border">{asset.category}</td> */}
                    <td className="p-3 border">{asset.asset_category}</td>
                    <td className={`p-3 border ${getStatusClass(asset.status)}`}>
                      {asset.status}
                    </td>
                    {/* <td className="p-3 border">
                      {asset.assigned_user?.first_name
                        ? `${asset.assigned_user.first_name} ${asset.assigned_user.last_name}`
                        : "—"}
                    </td> */}
                    <td>
                      {asset.assigned_user
                        ? `${asset.assigned_user.first_name ?? ""} ${asset.assigned_user.last_name ?? ""}`.trim()
                        : "—"}
                    </td>

                    <td className="p-3 border">
                      <div className="d-flex gap-2 align-items-center">

                        {asset.status === "Available" && (
                          <button
                            onClick={() => openAssignModal(asset)}
                            className="btn btn-sm btn-outline-primary"
                          >
                            Assign
                          </button>
                        )}

                        {asset.status === "Assigned" && (
                          <button
                            onClick={() => returnAsset(asset.id)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            Return
                          </button>
                        )}

                        {asset.status === "Repair" && (
                          <span className="badge bg-warning text-dark">
                            In Repair
                          </span>
                        )}

                        {!["Available", "Assigned", "Repair"].includes(asset.status) && (
                          <span className="text-muted small">—</span>
                        )}

                      </div>
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
          {/* {showModal && selectedAsset && (
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
                  {employees
                    .filter(emp => emp && emp.id)
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {(emp.first_name || "") + " " + (emp.last_name || "")}
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
          )} */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Assign Asset</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              {selectedAsset && (
                <>
                  <p className="mb-3">
                    <strong>{selectedAsset.asset_name}</strong>
                  </p>

                  <Form.Select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {(emp.first_name || "") + " " + (emp.last_name || "")}
                      </option>
                    ))}
                  </Form.Select>
                </>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>

              <Button
                variant="primary"
                onClick={assignAsset}
                disabled={assigning || !selectedUserId}
              >
                {assigning ? "Assigning..." : "Assign"}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}

export default AssetList;