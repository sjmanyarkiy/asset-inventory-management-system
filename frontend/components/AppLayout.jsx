import React from "react";
import MenuBar from "../../frontend/src/components/MenuBar";
import { Container } from "react-bootstrap";

const AppLayout = ({ children }) => {
  return (
    <div className="d-flex bg-light min-vh-100">

      {/* Sidebar */}
      <MenuBar />

      {/* Main content */}
      <div className="flex-grow-1 p-4">
        <Container fluid>
          {children}
        </Container>
      </div>

    </div>
  );
};

export default AppLayout;