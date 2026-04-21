import { useEffect, useState } from "react";
import { Modal, Button, Form, Badge, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/slices/authSlice";
import axios from "../../src/api/axios";
import AssetForm from "../assets/AssetForm"; // adjust path if needed

function AssetList({ searchTerm = "" }) {
  const user = useSelector(selectUser);
  const userRole = user?.role?.hierarchy_level || 0;

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  // =========================
  // ADD / EDIT ASSET MODAL
  // =========================
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // =========================
  // ASSIGN MODAL
  // =========================
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, status]);

  useEffect(() => {
    fetchAssets();
  }, [searchTerm, status, page]);

  // =========================
  // FETCH ASSETS
  // =========================
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

  // =========================
  // OPEN CREATE FORM
  // =========================
  const openCreateForm = () => {
    setSelectedAsset(null);
    setShowAssetForm(true);
  };

  const openEditForm = (asset) => {
    setSelectedAsset(asset);
    setShowAssetForm(true);
  };

  // =========================
  // EMPLOYEES
  // =========================
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

  // =========================
  // ASSIGN ASSET
  // =========================
  const assignAsset = async (asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
    setSelectedUserId("");
    fetchEmployees();
  };

  const handleAssign = async () => {
    if (!selectedAsset || !selectedUserId) return;

    setAssigning(true);
    try {
      const res = await axios.post(
        `/api/assets/${selectedAsset.id}/assign`,
        { user_id: parseInt(selectedUserId) }
      );

      setAssets((prev) =>
        prev.map((a) => (a.id === selectedAsset.id ? res.data.asset : a))
      );

      setShowModal(false);
    } catch (err) {
      console.error("Assign failed:", err);
    } finally {
      setAssigning(false);
    }
  };

  // =========================
  // RETURN ASSET
  // =========================
  const returnAsset = async (assetId) => {
    try {
      await axios.post(`/api/assets/${assetId}/return`);
      fetchAssets();
    } catch (err) {
      console.error("Return failed:", err);
    }
  };

  // =========================
  // STATUS BADGE
  // =========================
  const getStatusBadge = (status) => {
    const map = {
      Available: <Badge bg="success">Available</Badge>,
      Assigned: <Badge bg="primary">Assigned</Badge>,
      Repair: <Badge bg="warning">Repair</Badge>,
      Retired: <Badge bg="secondary">Retired</Badge>,
    };
    return map[status] || <Badge bg="dark">{status}</Badge>;
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner /> Loading...
      </div>
    );

  return (
    <div>

      {/* =========================
          HEADER ACTIONS
      ========================= */}
      <div className="d-flex justify-content-between mb-3">
        <h4>Assets</h4>

        <Button onClick={openCreateForm}>
          + Add Asset
        </Button>
      </div>

      {/* =========================
          TABLE
      ========================= */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Assigned</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.id}</td>
                <td>{asset.asset_name}</td>
                <td>{asset.asset_category?.name || "-"}</td>
                <td>{getStatusBadge(asset.status)}</td>
                <td>
                  {asset.assigned_user
                    ? `${asset.assigned_user.first_name} ${asset.assigned_user.last_name}`
                    : "-"}
                </td>

                <td>
                  {userRole <= 2 && asset.status === "Available" && (
                    <Button
                      size="sm"
                      onClick={() => assignAsset(asset)}
                      className="me-1"
                    >
                      Assign
                    </Button>
                  )}

                  {userRole <= 2 && asset.status === "Assigned" && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => returnAsset(asset.id)}
                    >
                      Return
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => openEditForm(asset)}
                    className="ms-1"
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =========================
          PAGINATION
      ========================= */}
      <div className="d-flex justify-content-between mt-3">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>

      {/* =========================
          ADD / EDIT FORM (FIXED)
      ========================= */}
      {showAssetForm && (
        <Modal show onHide={() => setShowAssetForm(false)} size="lg">
          <Modal.Body>
            <AssetForm
              selectedAsset={selectedAsset}
              onClose={() => setShowAssetForm(false)}
              onSuccess={fetchAssets}
            />
          </Modal.Body>
        </Modal>
      )}

      {/* =========================
          ASSIGN MODAL
      ========================= */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Assign Asset</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">Select employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.first_name} {e.last_name}
              </option>
            ))}
          </Form.Select>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
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