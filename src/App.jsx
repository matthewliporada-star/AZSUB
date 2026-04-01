import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './responsive.css';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/Layout/MainLayout';
import ProfileLayout from './components/Layout/ProfileLayout';
import Login from './pages/Login/Login';
import MPLayout from './pages/MP/MPLayout';
import CISDashboard from "./pages/CIS/CISDashboard";
import CISRecord from "./pages/CIS/CISRecord";

// MP Data Provider
import { MPDataProvider } from './pages/MP/MPData.jsx';

// MD Data Provider
import { MDDataProvider } from './pages/MD/MDData.jsx';

// AP Pages
import APDashboard from './pages/AP/DashboardPage';
import MonitoringPage from './pages/AP/MonitoringPage';
import ClientsPage from './pages/AP/ClientsPage';
import SubmissionPage from './pages/AP/SubmissionPage';
import SerialHistoryPage from './pages/AP/SerialHistoryPage';
import DocHistoryPage from './pages/AP/DocHistoryPage';
import FormPage from './pages/AP/forms/FormPage';

// Admin Pages
import AdminDashboard from './pages/Admin/Admin-Dashboard';
import ManageUsers from './pages/Admin/ManageUsers';
import AdminSerialNumber from './pages/Admin/Admin-SerialNumber';
import AdminPolicies from './pages/Admin/Admin-Policies';
import AdminActivityLogs from './pages/Admin/Admin-ActivityLogs';
import AdminRecord from './pages/Admin/Admin-Record';
import AdminTracking from './pages/Admin/Admin-Tracking';

// Super-Admin Pages
import SuperAdminDashboard from './pages/Super-Admin/Super-Admin-Dashboard';
import SuperAdminManageUsers from './pages/Super-Admin/ManageUsers';

// Common Pages
import ProfilePage from './pages/Common/ProfilePage';
import LandingPage from './pages/LandingPage/LandingPage';

// AL Pages
import ALDashboard from './pages/AL/DashboardPage';
import ALTeamPerformance from './pages/AL/PerformanceDashboardPage';
import CIS from './pages/CIS/CIS';

// MP Pages

import MPDashboard from './pages/MP/MP-Dashboard';
import ALPerformance from './pages/MP/ALPerformance';
import APPerformance from './pages/MP/APPerformance';

// MD Pages
import MDDashboard from './pages/MD/MD-Dashboard';
import MDMPPerformance from './pages/MD/MPPerformance';
import MDALPerformance from './pages/MD/ALPerformance';
import MDAPPerformance from './pages/MD/APPerformance';

function App() {
  return (
    <AppProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
           {/* Public Routes */}
          <Route path="/verify-identity" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/verify-identity" replace />} />

          {/* AP Routes */}
          <Route path="/ap/dashboard" element={<MainLayout><APDashboard /></MainLayout>} />
          <Route path="/ap/monitoring" element={<MainLayout><MonitoringPage /></MainLayout>} />
          <Route path="/ap/clients" element={<MainLayout><ClientsPage /></MainLayout>} />
          <Route path="/ap/submission" element={<MainLayout><SubmissionPage /></MainLayout>} />
          <Route path="/ap/serial-history" element={<MainLayout><SerialHistoryPage /></MainLayout>} />
          <Route path="/ap/doc-history" element={<MainLayout><DocHistoryPage /></MainLayout>} />


          {/* Standalone Application Form Route */}
          <Route path="/application-form/:formType" element={<FormPage />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<MainLayout><AdminDashboard /></MainLayout>} />
          <Route path="/admin/ManageUsers" element={<MainLayout><ManageUsers /></MainLayout>} />
          <Route path="/admin/SerialNumber" element={<MainLayout><AdminSerialNumber /></MainLayout>} />
          <Route path="/admin/policies" element={<MainLayout><AdminPolicies /></MainLayout>} />
          <Route path="/admin/activity-logs" element={<MainLayout><AdminActivityLogs /></MainLayout>} />
          <Route path="/admin/records" element={<MainLayout><AdminRecord /></MainLayout>} />
          <Route element={<MPDataProvider><Outlet /></MPDataProvider>}>
            <Route path="/admin/tracking" element={<MainLayout><AdminTracking /></MainLayout>} />
          </Route>
          <Route path="/profile" element={<ProfileLayout><ProfilePage /></ProfileLayout>} />

          {/* Super-Admin Routes */}
          <Route path="/super-admin/dashboard" element={<MainLayout><SuperAdminDashboard /></MainLayout>} />
          <Route path="/super-admin/ManageUsers" element={<MainLayout><SuperAdminManageUsers /></MainLayout>} />


          {/* AL Routes - Same as AP plus Team Performance */}
          <Route path="/al/dashboard" element={<MainLayout><ALDashboard /></MainLayout>} />
          <Route path="/al/team-performance" element={<MainLayout><ALTeamPerformance /></MainLayout>} />
          <Route path="/al/monitoring" element={<MainLayout><MonitoringPage /></MainLayout>} />
          <Route path="/al/clients" element={<MainLayout><ClientsPage /></MainLayout>} />
          <Route path="/al/submission" element={<MainLayout><SubmissionPage /></MainLayout>} />
          <Route path="/al/serial-history" element={<MainLayout><SerialHistoryPage /></MainLayout>} />
          <Route path="/al/doc-history" element={<MainLayout><DocHistoryPage /></MainLayout>} />
          <Route path="/al/cis" element={<MainLayout><Outlet /></MainLayout>}>
          <Route index element={<CIS />} />
          <Route path="CISDashboard" element={<CISDashboard />} />
          <Route path="record" element={<CISRecord />} />
          </Route>
          

          {/* MD/MP Routes */}
          <Route element={<MPDataProvider><Outlet /></MPDataProvider>}>
          <Route path="/mp/dashboard" element={<MPLayout><MPDashboard /></MPLayout>} />
          <Route path="/mp/al-performance" element={<MPLayout><ALPerformance /></MPLayout>} />
          <Route path="/mp/ap-performance" element={<MPLayout><APPerformance /></MPLayout>} />
         

         {/* FIXED: CIS routes inside provider */}
          <Route path="/mp/cis" element={<MPLayout />}>
          <Route index element={<CIS />} />
          <Route path="CISDashboard" element={<CISDashboard />} />
          <Route path="record" element={<CISRecord />} />
          </Route>
          </Route>


          {/* MD Routes with MD Data Provider */}
          <Route element={<MDDataProvider><Outlet /></MDDataProvider>}>
            <Route path="/md/dashboard" element={<MDDashboard />} />
            <Route path="/md/mp-performance" element={<MDMPPerformance />} />
            <Route path="/md/al-performance" element={<MDALPerformance />} />
            <Route path="/md/ap-performance" element={<MDAPPerformance />} />
          </Route>


          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
