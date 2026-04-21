import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "../src/api/axios";
import AssetList from "../src/components/AssetList";

function MainDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // -------------------------
  // FETCH ASSETS
  // -------------------------
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/assets", {
        params: {
          page: 1,
          per_page: 1000, // get all for dashboard stats
        },
      });

      setAssets(res.data.assets || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // -------------------------
  // CALCULATED STATS
  // -------------------------
  const totalAssets = assets.length;

  const assigned = assets.filter(
    (a) => a.status?.toLowerCase() === "assigned"
  ).length;

  const available = assets.filter(
    (a) => a.status?.toLowerCase() === "available"
  ).length;

  const maintenance = assets.filter(
    (a) =>
      a.status?.toLowerCase() === "repair" ||
      a.status?.toLowerCase() === "maintenance"
  ).length;

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <h3 className="fw-bold text-primary">Dashboard</h3>
      <p className="text-muted">Overview of asset system</p>

      <div className="d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={() => navigate("/assets")}>
          View All Assets
        </Button>
      </div>

      {/* =========================
          STATS CARDS
      ========================= */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6>Total Assets</h6>
              <h3 className="fw-bold">{totalAssets}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6>Assigned</h6>
              <h3 className="fw-bold text-success">{assigned}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6>Available</h6>
              <h3 className="fw-bold text-primary">{available}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6>Maintenance</h6>
              <h3 className="fw-bold text-danger">{maintenance}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* =========================
          RECENT ASSETS
      ========================= */}
      <Card className="shadow-sm border-0 mt-4">
        <Card.Body>
          <h5>Recent Assets</h5>
          <AssetList searchTerm={searchTerm} />
        </Card.Body>
      </Card>
    </>
  );
}

export default MainDashboard;