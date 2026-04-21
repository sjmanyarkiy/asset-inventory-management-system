import React, { useState, useEffect } from 'react';
import axios from '../src/api/axios';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
  Modal,
  Form,
  Tabs,
  Tab
} from 'react-bootstrap';

const RequestApprovalPage = () => {
  const [assetRequests, setAssetRequests] = useState([]);
  const [repairRequests, setRepairRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  const [approvedAssetRequests, setApprovedAssetRequests] = useState([]);
  const [approvedRepairRequests, setApprovedRepairRequests] = useState([]);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestType, setRequestType] = useState('asset'); // 'asset' or 'repair'

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch requests on mount
  useEffect(() => {
    fetchAllRequests();
  }, []);

  // const fetchAllRequests = async () => {
  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem('access_token');
  //     const headers = { 'Authorization': `Bearer ${token}` };

  //     // Fetch asset requests
  //     const assetRes = await axios.get(`${API_URL}/api/review/assets`, { headers });
  //     setAssetRequests(assetRes.data.requests || []);

  //     // Fetch repair requests
  //     const repairRes = await axios.get(`${API_URL}/api/review/repairs`, { headers });
  //     setRepairRequests(repairRes.data.requests || []);

  //     setError('');
  //   } catch (err) {
  //     console.error('Failed to fetch requests:', err);
  //     setError('Failed to load requests. Make sure you have manager permissions.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchAllRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [assetRes, repairRes, approvedAssetRes, approvedRepairRes] =
      await Promise.all([
        axios.get(`${API_URL}/api/requests/assets?status=Pending`, { headers }),
        axios.get(`${API_URL}/api/requests/repairs?status=Pending`, { headers }),

        axios.get(`${API_URL}/api/requests/assets?status=Approved`, { headers }),
        axios.get(`${API_URL}/api/requests/repairs?status=Approved`, { headers }),
      ]);

      setAssetRequests(assetRes.data.requests || []);
      setRepairRequests(repairRes.data.requests || []);

      setApprovedAssetRequests(approvedAssetRes.data.requests || []);
      setApprovedRepairRequests(approvedRepairRes.data.requests || []);

      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // Open modal for approval/rejection
  const openReviewModal = (request, type, action) => {
    setSelectedRequest(request);
    setActionType(action); // 'approve' or 'reject'
    setRequestType(type); // 'asset' or 'repair'
    setReviewNotes('');
    setShowModal(true);
  };

  // Submit review (approve/reject)
  const handleSubmitReview = async () => {
    if (actionType === 'reject' && !reviewNotes.trim()) {
      setError('Rejection notes are required');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const endpoint = requestType === 'asset'
        ? `/api/review/assets/${selectedRequest.id}/${actionType}`
        : `/api/review/repairs/${selectedRequest.id}/${actionType}`;

      const response = await axios.post(
        `${API_URL}${endpoint}`,
        { notes: reviewNotes },
        { headers }
      );

      setSuccess(`Request ${actionType}d successfully!`);
      setShowModal(false);

      // Refresh requests
      await fetchAllRequests();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to process request';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'Approved':
        return <Badge bg="success">Approved</Badge>;
      case 'Rejected':
        return <Badge bg="danger">Rejected</Badge>;
      case 'Completed':
        return <Badge bg="info">Completed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Urgency badge
  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'High':
        return <Badge bg="danger">High</Badge>;
      case 'Medium':
        return <Badge bg="warning">Medium</Badge>;
      case 'Low':
        return <Badge bg="secondary">Low</Badge>;
      default:
        return <Badge bg="secondary">{urgency}</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      {/* <Button variant="outline-primary" onClick={fetchAllRequests} className="ms-2">
        🔄 Refresh
      </Button> */}
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold text-primary">Request Management</h2>
          <p className="text-muted">Review and approve/reject asset and repair requests</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading requests...</p>
        </div>
      ) : (
        <Tabs defaultActiveKey="assets" className="mb-4">
          {/* ASSET REQUESTS TAB */}
          <Tab eventKey="assets" title={`Asset Requests (${assetRequests.length})`}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                {assetRequests.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <p>No pending asset requests at this time.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead className="table-light">
                        <tr>
                          <th>Requested By</th>
                          <th>Asset Type</th>
                          <th>Qty</th>
                          <th>Department</th>
                          <th>Reason</th>
                          <th>Urgency</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assetRequests.map(req => (
                          <tr key={req.id}>
                            <td>
                              <div className="fw-500">
                                {req.requested_user?.first_name || "Unknown"}{" "}
                                {req.requested_user?.last_name || ""}
                              </div>
                              <small className="text-muted">
                                {req.requested_user?.email || "No email"}
                              </small>
                            </td>
                            <td>{req.asset_type?.name || 'N/A'}</td>
                            <td className="text-center">{req.quantity}</td>
                            <td>{req.department?.name || 'N/A'}</td>
                            <td className="text-muted small">
                              {req.reason.substring(0, 40)}
                              {req.reason.length > 40 ? '...' : ''}
                            </td>
                            {/* <td>
                              <div>
                                {expandedRow === req.id ? req.reason : `${req.reason.slice(0, 50)}...`}
                              </div>

                              <Button
                                variant="link"
                                size="sm"
                                onClick={() =>
                                  setExpandedRow(expandedRow === req.id ? null : req.id)
                                }
                              >
                                {expandedRow === req.id ? "Show less" : "View full"}
                              </Button>
                            </td> */}
                            <td>{getUrgencyBadge(req.urgency)}</td>
                            <td>{getStatusBadge(req.status)}</td>
                            <td className="text-muted small">
                              {new Date(req.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              {req.status === 'Pending' && (
                                <div className="d-flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => openReviewModal(req, 'asset', 'approve')}
                                  >
                                    ✓
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => openReviewModal(req, 'asset', 'reject')}
                                  >
                                    ✕
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab>

          {/* REPAIR REQUESTS TAB */}
          <Tab eventKey="repairs" title={`Repair Requests (${repairRequests.length})`}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                {repairRequests.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <p>No pending repair requests at this time.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table striped hover>
                      <thead className="table-light">
                        <tr>
                          <th>Requested By</th>
                          <th>Asset</th>
                          <th>Issue</th>
                          <th>Urgency</th>
                          <th>Status</th>
                          <th>Submitted</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {repairRequests.map(req => (
                          <tr key={req.id}>
                            <td>
                              <div className="fw-500">
                                {req.requested_by?.first_name} {req.requested_by?.last_name}
                              </div>
                              <small className="text-muted">{req.requested_by?.username}</small>
                            </td>
                            <td>{req.asset?.asset_name || 'N/A'}</td>
                            <td className="text-muted small">
                              {req.issue_description.substring(0, 40)}
                              {req.issue_description.length > 40 ? '...' : ''}
                            </td>
                            <td>{getUrgencyBadge(req.urgency)}</td>
                            <td>{getStatusBadge(req.status)}</td>
                            <td className="text-muted small">
                              {new Date(req.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              {req.status === 'Pending' && (
                                <div className="d-flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => openReviewModal(req, 'repair', 'approve')}
                                  >
                                    ✓
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => openReviewModal(req, 'repair', 'reject')}
                                  >
                                    ✕
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab>
          {/* APPROVED REQUEST*/}
          <Tab eventKey="approved" title={`Approved Requests (${approvedAssetRequests.length + approvedRepairRequests.length})`}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3">Approved Asset Requests</h5>

                {approvedAssetRequests.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    No approved asset requests.
                  </p>
                ) : (
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Requested By</th>
                        <th>Asset Type</th>
                        <th>Qty</th>
                        <th>Department</th>
                        <th>Urgency</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {approvedAssetRequests.map(req => (
                        <tr key={req.id}>
                          <td>
                            {req.requested_by?.first_name} {req.requested_by?.last_name}
                          </td>
                          <td>{req.asset_type?.name}</td>
                          <td>{req.quantity}</td>
                          <td>{req.department?.name}</td>
                          <td>{getUrgencyBadge(req.urgency)}</td>
                          <td>{getStatusBadge(req.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
            <Card className="shadow-sm border-0 mt-4">
              <Card.Body>
                <h5 className="mb-3">Approved Repair Requests</h5>

                {approvedRepairRequests.length === 0 ? (
                  <p className="text-muted text-center py-4">
                    No approved repair requests.
                  </p>
                ) : (
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Requested By</th>
                        <th>Asset</th>
                        <th>Issue</th>
                        <th>Urgency</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {approvedRepairRequests.map(req => (
                        <tr key={req.id}>
                          <td>
                            {req.requested_by?.first_name} {req.requested_by?.last_name}
                          </td>
                          <td>{req.asset?.asset_name}</td>
                          <td>{req.issue_description}</td>
                          <td>{getUrgencyBadge(req.urgency)}</td>
                          <td>{getStatusBadge(req.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      )}

      {/* REVIEW MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === 'approve' ? '✓ Approve' : '✕ Reject'} Request
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              {requestType === 'asset' ? (
                <>
                  <p>
                    <strong>Asset:</strong> {selectedRequest.asset_type?.name}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {selectedRequest.quantity}
                  </p>
                  <p>
                    <strong>Reason:</strong> {selectedRequest.reason}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Asset:</strong> {selectedRequest.asset?.asset_name}
                  </p>
                  <p>
                    <strong>Issue:</strong> {selectedRequest.issue_description}
                  </p>
                </>
              )}

              <p>
                <strong>Requested By:</strong> {selectedRequest.requested_by?.first_name}{' '}
                {selectedRequest.requested_by?.last_name}
              </p>

              <Form.Group className="mt-3">
                <Form.Label className="fw-500">
                  {actionType === 'approve' ? 'Approval Notes (optional)' : 'Rejection Reason (required)'}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={
                    actionType === 'approve'
                      ? 'Add any notes about the approval...'
                      : 'Explain why this request is being rejected...'
                  }
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant={actionType === 'approve' ? 'success' : 'danger'}
            onClick={handleSubmitReview}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              `${actionType === 'approve' ? 'Approve' : 'Reject'} Request`
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RequestApprovalPage;