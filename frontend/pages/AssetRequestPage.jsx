import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import AssetRequestForm from '../src/components/AssetRequestForm';

const AssetRequestPage = () => {
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(
        `${API_URL}/api/requests/assets`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setMyRequests(response.data.requests || []);
      setError('');
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'Approved':
        return <Badge bg="success">Approved</Badge>;
      case 'Rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'High':
        return <Badge bg="danger">High</Badge>;
      case 'Medium':
        return <Badge bg="warning">Medium</Badge>;
      case 'Low':
        return <Badge bg="info">Low</Badge>;
      default:
        return <Badge bg="secondary">{urgency}</Badge>;
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold text-primary">Asset Requests</h2>
          <p className="text-muted">Request new assets or submit repair requests</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Request Form */}
      <Row className="mb-5">
        <Col lg={8}>
          <AssetRequestForm onRequestSubmitted={fetchMyRequests} />
        </Col>
      </Row>

      {/* My Requests */}
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-light">
              <h5 className="mb-0">My Requests</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Loading your requests...</p>
                </div>
              ) : myRequests.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p>You haven't submitted any requests yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead className="table-light">
                      <tr>
                        <th>Asset Type</th>
                        <th>Quantity</th>
                        <th>Urgency</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRequests.map(request => (
                        <tr key={request.id}>
                          <td className="fw-500">
                            {request.asset_type?.name || 'N/A'}
                          </td>
                          <td>{request.quantity}</td>
                          <td>{getUrgencyBadge(request.urgency)}</td>
                          <td>{getStatusBadge(request.status)}</td>
                          <td className="text-muted small">
                            {request.created_at
                              ? new Date(request.created_at).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="text-muted small">
                            {request.reason.substring(0, 30)}
                            {request.reason.length > 30 ? '...' : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AssetRequestPage;