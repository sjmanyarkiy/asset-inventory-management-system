import React, { useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import Navbar from "../src/components/Navbar";
import MenuBar from "../src/components/MenuBar";
import SearchBar from "../src/components/SearchBar";
import AssetList from "../src/components/AssetList";

// import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useNavigate } from "react-router-dom";

function MainDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); 
  const data = [
    { name: "Assigned", value: 0 },
    { name: "Available", value: 0 },
    { name: "Maintenance", value: 0 },
  ];

  const COLORS = ["#28a745", "#007bff", "#dc3545"];

  return (
    <>
      <h3 className="fw-bold text-primary">Dashboard</h3>
      <p className="text-muted">Overview of asset system</p>

      <div className="d-flex justify-content-end mb-3">
        <Button variant="primary" onClick={() => navigate("/assets")}>
          View All Assets
        </Button>
      </div>
      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6>Total Assets</h6>
              <h3 className="fw-bold">120</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6>Assigned</h6>
              <h3 className="fw-bold text-success">80</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6>Available</h6>
              <h3 className="fw-bold text-primary">30</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6>Maintenance</h6>
              <h3 className="fw-bold text-danger">10</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h6>Asset Distribution</h6>
              <div className="d-flex justify-content-center">
                <PieChart width={300} height={250}>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label
                  >
                    {data.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row> */}
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