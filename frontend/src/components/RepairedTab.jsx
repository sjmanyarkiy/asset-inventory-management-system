import React, { useEffect, useState } from "react";
import { Card, Table, Badge, Spinner } from "react-bootstrap";
import axios from "../api/axios";

export default function RepairedTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------------
  // FETCH REPAIRED ASSETS
  // -------------------------
  useEffect(() => {
    const fetchRepaired = async () => {
      setLoading(true);

      try {
        const res = await axios.get("/api/reports/repaired");
        setData(res.data.items || []);
      } catch (err) {
        console.error("Repaired fetch error:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRepaired();
  }, []);

  return (
    <div>

      {/* HEADER */}
      <div className="mb-3">
        <h5 className="fw-bold">Repaired Assets</h5>
        <p className="text-muted mb-0">
          Assets that have been sent for repair and resolved
        </p>
      </div>

      {/* TABLE CARD */}
      <Card className="shadow-sm border-0">
        <Card.Body>

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : data.length === 0 ? (
            <p className="text-center text-muted py-4">
              No repaired assets found
            </p>
          ) : (
            <Table hover responsive className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Repair ID</th>
                  <th>Asset ID</th>
                  <th>Status</th>
                  <th>Reported At</th>
                </tr>
              </thead>

              <tbody>
                {data.map((item, index) => (
                  <tr key={item.repair_id || index}>
                    <td className="fw-semibold">
                      #{item.repair_id}
                    </td>

                    <td>{item.asset_id}</td>

                    <td>
                      <Badge bg="success">
                        {item.status || "Repaired"}
                      </Badge>
                    </td>

                    <td>
                      {item.reported_at
                        ? new Date(item.reported_at).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

        </Card.Body>
      </Card>
    </div>
  );
}