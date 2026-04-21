import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Badge, Spinner, Row, Col } from "react-bootstrap";
import axios from "../../src/api/axios";
import AssetBarcode from "../components/AssetBarcode";

export default function AssetDetailPage() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

  if (!asset) {
    return <p className="text-danger">Asset not found</p>;
  }

  const imageUrl =
    asset.image_url ||
    asset.image ||
    "https://via.placeholder.com/400x250?text=No+Image";

  return (
    <div className="container py-4">

      <Row className="g-4">

        {/* IMAGE SECTION */}
        <Col md={5}>
          <Card className="shadow-sm border-0">
            <img
              src={imageUrl}
              alt={asset.asset_name}
              style={{
                width: "100%",
                height: "300px",
                objectFit: "cover",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px"
              }}
            />
          </Card>
        </Col>

        {/* DETAILS SECTION */}
        <Col md={7}>
          <Card className="shadow-sm border-0 p-3">

            <h3 className="mb-2">{asset.asset_name}</h3>

            <p className="text-muted mb-2">
              Code: <strong>{asset.asset_code}</strong>
            </p>

            <p className="mb-2">
              Status:{" "}
              <Badge bg={asset.status === "Available" ? "success" : "primary"}>
                {asset.status}
              </Badge>
            </p>

            <p className="mb-3">{asset.description || "No description"}</p>

            <div className="mb-3">
              <strong>Category:</strong>{" "}
              {asset.asset_category?.name || "Unassigned"}
            </div>

            <div className="mb-3">
              <strong>Assigned To:</strong>{" "}
              {asset.assigned_user
                ? `${asset.assigned_user.first_name} ${asset.assigned_user.last_name}`
                : "Not assigned"}
            </div>

            {/* BARCODE */}
            <div className="mt-4">
              <AssetBarcode asset={asset} />
            </div>

          </Card>
        </Col>
      </Row>
    </div>
  );
}