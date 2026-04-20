import { useEffect, useState } from "react";
import { Modal, Button, Form, Badge, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/slices/authSlice";
// import axios from "axios";
import axios from "../../src/api/axios"

function AssetList({ searchTerm = "" }) {
  const user = useSelector(selectUser);  // Role check
  const userRole = user?.role?.hierarchy_level || 0;  // 0=emp, 1=mgr, 2=admin
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  // Assignment modal
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => { setPage(1); }, [searchTerm, status]);

  // const fetchAssets = async () => {
  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem('access_token'); // defined token, logout if token is null
  //       if (!token) {
  //         console.error('No token - redirect to login');
  //         return;
  //       }
  //     const headers = { 'Authorization': `Bearer ${token}` };
  //     const response = await axios.get(`${API_URL}/api/assets`, { headers });
  //     setAssets(response.data.assets || []);
  //   } catch (error) {
  //     console.error('Failed to fetch assets:', error);
  //   } finally {
  //     setLoading(false);
  //   }
    
  //   try {
  //     const params = new URLSearchParams({
  //       search: searchTerm,
  //       status,
  //       page: page.toString(),
  //       per_page: perPage.toString(),
  //     });
      
  //     const response = await fetch(`${API_URL}/api/assets?${params}`, {
  //       headers: { 
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });
      
  //     if (!response.ok) {
  //       console.error('Assets API failed:', response.status, await response.text());
  //       return;
  //     }
      
  //     const data = await response.json();
  //     console.log('✅ Assets loaded:', data.assets?.length || 0);
  //     setAssets(data.assets || []);
  //     setTotalPages(Math.ceil((data.total || 0) / perPage));
  //   } catch (err) {
  //     console.error('❌ Assets fetch error:', err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      // Axios will attach Authorization automatically via interceptor
      const params = {
        search: searchTerm,
        status,
        page: page.toString(),
        per_page: perPage.toString(),
      };

      const response = await axios.get("/api/assets", { params });

      setAssets(response.data.assets || []);
      setTotalPages(Math.ceil((response.data.total || 0) / perPage));
    } catch (err) {
      console.error("❌ Failed to fetch assets:", err);
    } finally {
      setLoading(false);
    }
  };

  // const handleViewBarcode = (asset) => {
  //   setSelectedAsset(asset);
  //   setShowBarcodeModal(true);
  // };

  // const fetchEmployees = async () => {
  //   try {
  //     const token = localStorage.getItem('access_token');
  //     const res = await axios.get(`${API_URL}/api/admin/users?role=Employee`, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     setEmployees(res.data.users || []);
  //   } catch (err) {
  //     console.error('Employees fetch failed:', err);
  //   }
  // };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/api/admin/users", {
        params: { role: "Employee" },
      });
      setEmployees(res.data.users || []);
    } catch (err) {
      console.error("Employees fetch failed:", err);
    }
  };

  useEffect(() => { fetchAssets(); }, [searchTerm, status, page]);

  const openAssignModal = (asset) => {
    setSelectedAsset(asset);
    setSelectedUserId("");
    setShowModal(true);
    fetchEmployees();
  };

  // const assignAsset = async () => {
  //   if (!selectedAsset || !selectedUserId) return;
    
  //   setAssigning(true);
  //   const token = localStorage.getItem('access_token');
    
  //   try {
  //     const res = await axios.post(
  //       `${API_URL}/api/assets/${selectedAsset.id}/assign`,
  //       { user_id: parseInt(selectedUserId) },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
      
  //     // Optimistic update
  //     setAssets(prev => prev.map(a => 
  //       a.id === selectedAsset.id ? res.data.asset : a
  //     ));
  //     setShowModal(false);
  //   } catch (err) {
  //     console.error('Assign failed:', err);
  //   } finally {
  //     setAssigning(false);
  //   }
  // };

  const assignAsset = async () => {
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

  // const returnAsset = async (assetId) => {
  //   const token = localStorage.getItem('access_token');
  //   try {
  //     await axios.post(`${API_URL}/api/assets/${assetId}/return`, {}, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     });
  //     fetchAssets();  // Refresh
  //   } catch (err) {
  //     console.error('Return failed:', err);
  //   }
  // };

  const returnAsset = async (assetId) => {
    try {
      await axios.post(`/api/assets/${assetId}/return`);
      fetchAssets(); // refresh
    } catch (err) {
      console.error("Return failed:", err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'Available': <Badge bg="success">Available</Badge>,
      'Assigned': <Badge bg="primary">Assigned</Badge>,
      'Repair': <Badge bg="warning">Repair</Badge>,
      'Retired': <Badge bg="secondary">Retired</Badge>
    };
    return badges[status] || <Badge bg="dark">{status}</Badge>;
  };

  if (loading) return <div className="text-center py-5"><Spinner /> Loading...</div>;

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Asset Name</th>
            <th>Category</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Barcode</th>
            <th>View Asset</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map(asset => (
            <tr key={asset.id}>
              <td>{asset.id}</td>
              <td>{asset.asset_name}</td>
              <td>{asset.asset_category?.name || '-'}</td>
              <td>{getStatusBadge(asset.status)}</td>
              <td>{asset.assigned_user ? `${asset.assigned_user.first_name} ${asset.assigned_user.last_name}`.trim() || '-' : '-'}</td>
              {/* <td>
                {asset.barcode_image ? (
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleViewBarcode(asset)}
                  >
                    📊 View
                  </Button>
                ) : (
                  <span className="text-muted">No barcode</span>
                )}
              </td> */}
              <td>
                <span className="text-muted">Barcode coming soon</span>
                {/* {asset.barcode_image ? (
                  <Button onClick={() => handleViewBarcode(asset)}>📊 View</Button>
                ) : (
                  <span className="text-muted">Barcode coming soon</span>
                )} */}
              </td>
              <td>
                <Button size="sm" variant="outline-info">
                  View Details
                </Button>
              </td>
              <td>
                {userRole >= 2 && asset.status === 'Available' && (  // Admin only
                  <Button size="sm" className="me-1" variant="outline-primary" onClick={() => openAssignModal(asset)}>
                    Assign
                  </Button>
                )}
                {userRole >= 1 && asset.status === 'Assigned' && (  // Manager+
                  <Button size="sm" variant="outline-danger" onClick={() => returnAsset(asset.id)}>
                    Return
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal - unchanged */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        {/* Your existing modal JSX */}
        {/* Barcode Modal */}
        {selectedAsset && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Barcode: {selectedAsset.asset_code}</h5>
                  <button 
                    className="btn-close" 
                    onClick={() => setShowBarcodeModal(false)}
                  />
                </div>
                <div className="modal-body text-center">
                  <p className="text-muted mb-3">{selectedAsset.asset_name}</p>
                  
                  <div className="mb-4">
                    <h6>Code128 Barcode</h6>
                    {selectedAsset.barcode_image && (
                      <img 
                        src={selectedAsset.barcode_image} 
                        alt="barcode"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    )}
                  </div>

                  <div className="mb-4">
                    <h6>QR Code</h6>
                    {selectedAsset.qr_code_image && (
                      <img 
                        src={selectedAsset.qr_code_image} 
                        alt="qr-code"
                        style={{ maxWidth: '200px', height: 'auto' }}
                      />
                    )}
                  </div>

                  <p className="text-muted small">
                    Barcode: <code>{selectedAsset.barcode_data}</code>
                  </p>
                </div>
                <div className="modal-footer">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowBarcodeModal(false)}
                  >
                    Close
                  </button>
                  <button className="btn btn-primary" onClick={() => window.print()}>
                    🖨️ Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
      

      {/* Pagination */}
      <div className="d-flex justify-content-between mt-3">
        <Button disabled={page === 1} onClick={() => setPage(p => p-1)}>Previous</Button>
        <span>Page {page} of {totalPages}</span>
        <Button disabled={page === totalPages} onClick={() => setPage(p => p+1)}>Next</Button>
      </div>
    </div>
  );
}

export default AssetList;