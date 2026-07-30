import { useAuth } from '../context/AuthContext.jsx';

import SuperAdminDashboard from '../components/dashboards/SuperAdminDashboard.jsx';
import SocietyAdminDashboard from '../components/dashboards/SocietyAdminDashboard.jsx';
import ResidentDashboard from '../components/dashboards/ResidentDashboard.jsx';
import StaffDashboard from '../components/dashboards/StaffDashboard.jsx';
import VendorDashboard from '../components/dashboards/VendorDashboard.jsx';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      {user?.role === 'SUPER_ADMIN' && <SuperAdminDashboard />}
      {user?.role === 'SOCIETY_ADMIN' && <SocietyAdminDashboard />}
      {user?.role === 'RESIDENT' && <ResidentDashboard />}
      {user?.role === 'STAFF' && <StaffDashboard />}
      {user?.role === 'VENDOR' && <VendorDashboard />}
   </>
  );
}
