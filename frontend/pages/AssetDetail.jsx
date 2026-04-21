import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner, Badge, Card, Row, Col } from "react-bootstrap";
import axios from "../src/api/axios";
import AssetBarcode from "../components/AssetBarcode";

export default function AssetDetailPage() {
  const { id } = useParams();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH ASSET
  // =========================
  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await axios.get(`/api/assets/${id}`);
        setAsset(res.data);
      } catch (err) {
        console.error("Failed to load asset:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [id]);

  const getStatusBadge = (status) => {
    const map = {
      Available: <Badge bg="success">Available</Badge>,
      Assigned: <Badge bg="primary">Assigned</Badge>,
      Repair: <Badge bg="warning">Under Repair</Badge>,
      Retired: <Badge bg="secondary">Retired</Badge>,
    };
    return map[status] || <Badge bg="dark">{status}</Badge>;
  };

  // =========================
  // LOADING STATE
  // =========================
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <div>Loading asset...</div>
      </div>
    );
  }

  if (!asset) {
    return <div className="text-danger">Asset not found</div>;
  }

  return (
    <div className="container py-4">

      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold">{asset.asset_name}</h2>
        <div>{getStatusBadge(asset.status)}</div>
      </div>

      <Row>
        {/* LEFT SIDE - IMAGE */}
        <Col md={5}>
          <Card className="p-3 shadow-sm">
            {asset.image_url ? (
              <img
                src={asset.image_url}
                alt={asset.asset_name}
                style={{
                  width: "100%",
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            ) : (
              <div className="text-muted text-center py-5">
                No image available
              </div>
            )}
          </Card>
        </Col>

        {/* RIGHT SIDE - DETAILS */}
        <Col md={7}>
          <Card className="p-3 shadow-sm mb-3">
            <h5>Asset Details</h5>
            <hr />

            <p><strong>Asset Code:</strong> {asset.asset_code}</p>
            <p><strong>Category:</strong> {asset.asset_category?.name || "-"}</p>
            <p><strong>Type:</strong> {asset.asset_type?.name || "-"}</p>
            <p><strong>Vendor:</strong> {asset.vendor?.name || "-"}</p>
            <p><strong>Department:</strong> {asset.department?.name || "-"}</p>
            <p><strong>Description:</strong> {asset.description || "-"}</p>

            <p>
              <strong>Assigned To:</strong>{" "}
              {asset.assigned_user
                ? `${asset.assigned_user.first_name} ${asset.assigned_user.last_name}`
                : "Not assigned"}
            </p>
          </Card>

          {/* BARCODE */}
          <Card className="p-3 shadow-sm">
            <h5>Barcode</h5>
            <AssetBarcode asset={asset} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}