import React from 'react';
import { Container, Row, Col, Card, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import MenuBar from "../components/MenuBar";
import AccessTab from '../components/AccessTab';
import AssignedTab from '../components/AssignedTab';
import RepairedTab from '../components/RepairedTab';
import { useAuth } from '../AuthContext';

export default function ReportsDashboard() {
  const [active, setActive] = React.useState('assigned');
  const auth = useAuth();
  const navigate = useNavigate();

  const logout = React.useCallback(() => {
    if (auth && typeof auth.logout === 'function') auth.logout();
    navigate('/login');
  }, [auth, navigate]);

  const role = auth?.user?.role;

  return (
    <>
      <h3 className="fw-bold text-primary">Reports</h3>
      <p className="text-muted mb-0">
        View and analyze asset activity
      </p>
      

      {/* Tabs */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white">
          <Nav variant="tabs" activeKey={active}>
            {role && ['ADMIN', 'PROCUREMENT', 'FINANCE'].includes(role) && (
              <Nav.Item>
                <Nav.Link eventKey="access" onClick={() => setActive('access')}>
                  Access
                </Nav.Link>
              </Nav.Item>
            )}

            <Nav.Item>
              <Nav.Link eventKey="assigned" onClick={() => setActive('assigned')}>
                Assigned
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link eventKey="repaired" onClick={() => setActive('repaired')}>
                Repaired
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>

        <Card.Body>
          {active === 'access' && <AccessTab />}
          {active === 'assigned' && <AssignedTab />}
          {active === 'repaired' && <RepairedTab />}
        </Card.Body>
      </Card>
    </>
  );
}