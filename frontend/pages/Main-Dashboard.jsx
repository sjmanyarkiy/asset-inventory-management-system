import React, { useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Navbar from "../src/components/Navbar";
import MenuBar from "../src/components/MenuBar";
import SearchBar from "../src/components/SearchBar";
import AssetList from "../src/components/AssetList";

function MainDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <h3 className="fw-bold text-primary">Dashboard</h3>
      <p className="text-muted">Manage and track all assets</p>

      <Card className="shadow-sm border-0">
        <Card.Body>
          <SearchBar onSearch={setSearchTerm} />

          <div className="mt-4">
            <AssetList searchTerm={searchTerm} />
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

export default MainDashboard;