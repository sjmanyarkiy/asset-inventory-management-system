import { useEffect, useState } from "react";
import { Modal, Button, Form, Badge, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/slices/authSlice";
import axios from "../../src/api/axios";
import AssetForm from "../assets/AssetForm";

function AssetList({ searchTerm = "" }) {
  const user = useSelector(selectUser);
  const userRole = user?.role?.hierarchy_level || 0;

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  // -------------------------
  // ASSET FORM MODAL
  // -------------------------
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // -------------------------
  // ASSIGN MODAL
  // -------------------------
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assetToAssign, setAssetToAssign] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, status]);

  useEffect(() => {
    fetchAssets();
  }, [searchTerm, status, page]);

  // -------------------------
  // FETCH ASSETS
  // -------------------------
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/assets", {
        params: {
          search: searchTerm,
          status,
          page,
          per_page: perPage,
        },
      });

      setAssets(res.data.assets || []);
      setTotalPages(Math.ceil((res.data.total || 0) / perPage));
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // OPEN CREATE
  // -------------------------
  const openCreate = () => {
    setSelectedAsset(null);
    setShowAssetForm(true);
  };

  // -------------------------
  // OPEN EDIT
  // -------------------------
  const openEdit = (asset) => {
    setSelectedAsset(asset);
    setShowAssetForm(true);
  };

  // -------------------------
  // FETCH EMPLOYEES
  // -------------------------
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/api/users", {
        params: { role: "Employee" },
      });
      setEmployees(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------
  // OPEN ASSIGN MODAL
  // -------------------------
  const openAssign = (asset) => {
    setAssetToAssign(asset);
    setSelectedUserId("");
    setShowAssignModal(true);
    fetchEmployees();
  };

  // -------------------------
  // ASSIGN
  // -------------------------
  const handleAssign = async () => {
    if (!assetToAssign || !selectedUserId) return;

    setAssigning(true);
    try {
      const res = await axios.post(
        `/api/assets/${assetToAssign.id}/assign`,
        { user_id: parseInt(selectedUserId) }
      );

      setAssets((prev) =>
        prev.map((a) =>
          a.id === assetToAssign.id ? res.data.asset : a
        )
      );

      setShowAssignModal(false);
    } catch (err) {
      console.error("Assign failed:", err);
    } finally {
      setAssigning(false);
    }
  };

  // -------------------------
  // RETURN
  // -------------------------
  const returnAsset = async (id) => {
    try {
      await axios.post(`/api/assets/${id}/return`);
      fetchAssets();
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------
  // STATUS BADGE
  // -------------------------
  const badge = (status) => {
    const map = {
      Available: "success",
      Assigned: "primary",
      Repair: "warning",
      Retired: "secondary",
    };

    return (
      <Badge bg={map[status] || "dark"}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  return (
    <div>

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-3">
        <h4>Assets</h4>

        <Button onClick={openCreate}>
          + Add Asset
        </Button>
      </div>

      {/* TABLE */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Asset</th>
              <th>Category</th>
              <th>Status</th>
              <th>Assigned</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {assets.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.asset_name}</td>
                <td>{a.asset_category?.name || "-"}</td>
                <td>{badge(a.status)}</td>
                <td>
                  {a.assigned_user
                    ? `${a.assigned_user.first_name} ${a.assigned_user.last_name}`
                    : "-"}
                </td>

                <td className="d-flex gap-2">
                  {userRole <= 2 && a.status === "Available" && (
                    <Button
                      size="sm"
                      onClick={() => openAssign(a)}
                    >
                      Assign
                    </Button>
                  )}

                  {userRole <= 2 && a.status === "Assigned" && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => returnAsset(a.id)}
                    >
                      Return
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => openEdit(a)}
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="d-flex justify-content-between mt-3">
        <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          Prev
        </Button>

        <span>Page {page} / {totalPages}</span>

        <Button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </Button>
      </div>

      {/* -------------------------
          ASSET FORM MODAL (FIXED UX)
      ------------------------- */}
      <Modal
        show={showAssetForm}
        onHide={() => setShowAssetForm(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedAsset ? "Edit Asset" : "Create Asset"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <AssetForm
            selectedAsset={selectedAsset}
            onClose={() => setShowAssetForm(false)}
            onSuccess={fetchAssets}
          />
        </Modal.Body>
      </Modal>

      {/* -------------------------
          ASSIGN MODAL
      ------------------------- */}
      <Modal
        show={showAssignModal}
        onHide={() => setShowAssignModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Assign Asset</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Select Employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.first_name} {e.last_name}
              </option>
            ))}
          </Form.Select>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAssignModal(false)}
          >
            Cancel
          </Button>

          <Button
            disabled={assigning || !selectedUserId}
            onClick={handleAssign}
          >
            {assigning ? "Assigning..." : "Assign"}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default AssetList;