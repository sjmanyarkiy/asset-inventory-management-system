import React, { useEffect, useState } from "react";
import axios from "../src/api/axios";
import {
  Container,
  Card,
  Table,
  Badge,
  Button,
  Form,
  Row,
  Col,
  Spinner
} from "react-bootstrap";

export default function RepairRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    asset_id: "",
    issue_description: "",
    urgency: "Medium"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, assetRes] = await Promise.all([
        axios.get("/api/requests/repairs"),
        axios.get("/api/assets")
      ]);

      setRequests(reqRes.data.requests || []);
      setAssets(assetRes.data.assets || []);
    } catch (err) {
      console.error("Error loading repair requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const submitRequest = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/api/requests/repairs", form);
      setForm({ asset_id: "", issue_description: "", urgency: "Medium" });
      fetchData();
    } catch (err) {
      console.error("Failed to submit repair request:", err);
    }
  };

  const statusBadge = (status) => {
    const map = {
      Pending: "warning",
      Approved: "success",
      "In Progress": "info",
      Completed: "primary",
      Rejected: "danger"
    };

    return <Badge bg={map[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <Container className="py-4">

      <h3 className="fw-bold text-primary">Repair Requests</h3>
      <p className="text-muted">Report and track asset issues</p>

      {/* CREATE FORM */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5>New Repair Request</h5>

          <Form onSubmit={submitRequest}>
            <Row>
              <Col md={4}>
                <Form.Select
                  value={form.asset_id}
                  onChange={(e) =>
                    setForm({ ...form, asset_id: e.target.value })
                  }
                  required
                >
                  <option value="">Select Asset</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.asset_name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={4}>
                <Form.Select
                  value={form.urgency}
                  onChange={(e) =>
                    setForm({ ...form, urgency: e.target.value })
                  }
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </Form.Select>
              </Col>

              <Col md={4}>
                <Button type="submit" className="w-100">
                  Submit Request
                </Button>
              </Col>
            </Row>

            <Form.Control
              as="textarea"
              rows={3}
              className="mt-3"
              placeholder="Describe the issue..."
              value={form.issue_description}
              onChange={(e) =>
                setForm({ ...form, issue_description: e.target.value })
              }
              required
            />
          </Form>
        </Card.Body>
      </Card>

      {/* LIST */}
      <Card className="shadow-sm">
        <Card.Body>
          <h5>Your Repair Requests</h5>

          {loading ? (
            <Spinner animation="border" />
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Issue</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>{r.asset?.asset_name}</td>
                    <td>{r.issue_description}</td>
                    <td>{r.urgency}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td>
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}