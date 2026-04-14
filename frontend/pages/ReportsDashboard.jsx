import React from 'react';
import { Card, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AccessTab from '../src/components/AccessTab';
import AssignedTab from '../src/components/AssignedTab';
import RepairedTab from '../src/components/RepairedTab';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/slices/authSlice';

export default function ReportsDashboard() {
  const [active, setActive] = React.useState('assigned');

  const user = useSelector(selectUser);
  const navigate = useNavigate();

  const role = user?.role?.name?.toLowerCase();

  const logout = React.useCallback(() => {
    navigate('/login');
  }, [navigate]);

  return (
    <>
      <h3 className="fw-bold text-primary">Reports</h3>
      <p className="text-muted mb-0">View and analyze asset activity</p>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white">
          <Nav variant="tabs" activeKey={active}>
            {role && ['admin', 'super admin', 'procurement', 'finance'].includes(role) && (
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