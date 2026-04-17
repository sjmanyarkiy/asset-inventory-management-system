import React from 'react';
import { useNavigate } from 'react-router-dom';
import AccessTab from '../src/components/AccessTab';
import AssignedTab from '../src/components/AssignedTab';
import RepairedTab from '../src/components/RepairedTab';
import { useAuth } from '../src/AuthContext';

export default function ReportsDashboardClean() {
  const [active, setActive] = React.useState('assigned');
  const auth = useAuth();
  const navigate = useNavigate();

  const logout = React.useCallback(() => {
    if (auth && typeof auth.logout === 'function') auth.logout();
    navigate('/login');
  }, [auth, navigate]);

  const role = auth?.user?.role;

  return (
    <div>
      <h2>Reports Dashboard</h2>
      <div style={{ float: 'right' }}>
        <button onClick={logout}>Logout</button>
      </div>
      <nav>
        {role && ['ADMIN', 'PROCUREMENT', 'FINANCE'].includes(role) && (
          <button onClick={() => setActive('access')}>Access</button>
        )}
        <button onClick={() => setActive('assigned')}>Assigned</button>
        <button onClick={() => setActive('repaired')}>Repaired</button>
      </nav>

      <div style={{ marginTop: 16 }}>
        {active === 'access' && <AccessTab />}
        {active === 'assigned' && <AssignedTab />}
        {active === 'repaired' && <RepairedTab />}
      </div>
    </div>
  );
}
