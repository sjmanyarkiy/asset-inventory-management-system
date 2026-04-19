import { LinkContainer } from 'react-router-bootstrap';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Plus, List } from 'lucide-react';

const AdminDashboard = () => (
  <Container className="py-4">
    <h2 className="fw-bold mb-4">Admin Panel</h2>
    
    <Row>
      {[
        { title: 'Assets', create: '/admin/assets/create', view: '/admin/assets', icon: 'database' },
        { title: 'Vendors', create: '/admin/vendors/create', view: '/admin/vendors', icon: 'truck' },
        // Add others...
      ].map((item) => (
        <Col md={6} lg={4} className="mb-4">
          <Card className="shadow h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>{item.title}</Card.Title>
              <div className="flex-grow-1 d-flex flex-column justify-content-center">
                <LinkContainer to={item.create}>
                  <Button variant="primary" className="me-2 mb-2">
                    <Plus size={18} className="me-2" />
                    Create
                  </Button>
                </LinkContainer>
                <LinkContainer to={item.view}>
                  <Button variant="outline-primary">
                    <List size={18} className="me-2" />
                    View All
                  </Button>
                </LinkContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </Container>
);