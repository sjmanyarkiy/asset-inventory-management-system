import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Navbar from "../components/Navbar";
import MenuBar from "../components/MenuBar";
import SearchBar from "../components/SearchBar";
import AssetList from "../components/AssetList";

function MainDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <MenuBar />
        <main className="flex-grow-1 p-4">
          <SearchBar onSearch={setSearchTerm} />
          <div className="mt-4">
            <AssetList searchTerm={searchTerm} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainDashboard;