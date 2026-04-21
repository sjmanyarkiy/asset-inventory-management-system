import React, { useEffect, useState, useMemo } from "react";
import { Card, Nav, Row, Col, Badge, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "../src/api/axios";
import AccessTab from "../src/components/AccessTab";
import RepairedTab from "../src/components/RepairedTab";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slices/authSlice";

export default function ReportsDashboard() {
  const [active, setActive] = useState("assigned");
  const [assignedAssets, setAssignedAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const role = user?.role?.name?.toLowerCase();

  const logout = () => navigate("/login");

  // -------------------------
  // FETCH ASSIGNED DATA
  // -------------------------
  useEffect(() => {
    const fetchAssigned = async () => {
      if (active !== "assigned") return;

      setLoading(true);
      try {
        const res = await axios.get("/api/assets", {
          params: {
            status: "assigned",
            per_page: 100,
            page: 1,
          },
        });

        setAssignedAssets(res.data.assets || []);
      } catch (err) {
        console.error("Failed to load assigned assets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssigned();
  }, [active]);

  // -------------------------
  // SUMMARY STATS
  // -------------------------
  const stats = useMemo(() => {
    return {
      totalAssigned: assignedAssets.length,
      uniqueUsers: new Set(
        assignedAssets.map((a) => a.assigned_user?.id).filter(Boolean)
      ).size,
    };
  }, [assignedAssets]);

  return (
    <div className="container-fluid">

      {/* HEADER */}
      <div className="mb-3">
        <h3 className="fw-bold text-primary">Reports Dashboard</h3>
        <p className="text-muted">
          Asset tracking, assignments, and system activity overview
        </p>
      </div>

      {/* SUMMARY CARDS */}
      {active === "assigned" && (
        <Row className="mb-3">
          <Col md={4}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h6 className="text-muted">Total Assigned</h6>
                <h3 className="fw-bold text-primary">
                  {loading ? "..." : stats.totalAssigned}
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h6 className="text-muted">Active Users</h6>
                <h3 className="fw-bold text-success">
                  {loading ? "..." : stats.uniqueUsers}
                </h3>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h6 className="text-muted">Status</h6>
                <Badge bg="primary">Live Data</Badge>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* MAIN CARD */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white">

          <Nav variant="tabs" activeKey={active}>
            {role &&
              ["admin", "super admin", "procurement", "finance"].includes(
                role
              ) && (
                <Nav.Item>
                  <Nav.Link
                    eventKey="access"
                    onClick={() => setActive("access")}
                  >
                    Access
                  </Nav.Link>
                </Nav.Item>
              )}

            <Nav.Item>
              <Nav.Link
                eventKey="assigned"
                onClick={() => setActive("assigned")}
              >
                Assigned
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                eventKey="repaired"
                onClick={() => setActive("repaired")}
              >
                Repaired
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>

        <Card.Body>

          {/* ACCESS */}
          {active === "access" && <AccessTab />}

          {/* ASSIGNED (IMPROVED UI TABLE) */}
          {active === "assigned" && (
            <>
              {loading ? (
                <div className="text-center py-4">
                  <Spinner />
                </div>
              ) : assignedAssets.length === 0 ? (
                <p className="text-muted text-center py-4">
                  No assigned assets found
                </p>
              ) : (
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Code</th>
                      <th>Assigned To</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {assignedAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td>{asset.asset_name}</td>
                        <td>{asset.asset_code}</td>
                        <td>
                          {asset.assigned_user
                            ? `${asset.assigned_user.first_name} ${asset.assigned_user.last_name}`
                            : "-"}
                        </td>
                        <td>
                          <Badge bg="primary">Assigned</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}

          {/* REPAIRED */}
          {active === "repaired" && <RepairedTab />}
        </Card.Body>
      </Card>
    </div>
  );
}