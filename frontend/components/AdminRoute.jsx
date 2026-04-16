import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { Container, Row, Col, Alert } from 'react-bootstrap';

const AdminRoute = ({ children }) => {
  const { isAdmin } = usePermissions();

  if (!isAdmin()) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6}>
            <Alert variant="danger">
              <Alert.Heading>Access Denied</Alert.Heading>
              <p>
                You do not have permission to access this page. 
                Only administrators can view this section.
              </p>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return children;
};

export default AdminRoute;