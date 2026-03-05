import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './responsive.css';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/Layout/MainLayout';
import ProfileLayout from './components/Layout/ProfileLayout';
import Login from './pages/Login/Login';

// MP Data Provider
import { MPDataProvider } from './pages/MP/MPData.jsx';

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

// Common Pages
import ProfilePage from './pages/Common/ProfilePage';

// AL Pages
import ALDashboard from './pages/AL/DashboardPage';
import ALTeamPerformance from './pages/AL/PerformanceDashboardPage';

// MP Pages

import MPDashboard from './pages/MP/MP-Dashboard';
import ALPerformance from './pages/MP/ALPerformance';
import APPerformance from './pages/MP/APPerformance';

// MP Pages
import MDDashboard from './pages/MD/MD-Dashboard';

function App() {
  return (
    <AppProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

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
          <Route path="/profile" element={<ProfileLayout><ProfilePage /></ProfileLayout>} />


          {/* AL Routes - Same as AP plus Team Performance */}
          <Route path="/al/dashboard" element={<MainLayout><ALDashboard /></MainLayout>} />
          <Route path="/al/team-performance" element={<MainLayout><ALTeamPerformance /></MainLayout>} />
          <Route path="/al/monitoring" element={<MainLayout><MonitoringPage /></MainLayout>} />
          <Route path="/al/clients" element={<MainLayout><ClientsPage /></MainLayout>} />
          <Route path="/al/submission" element={<MainLayout><SubmissionPage /></MainLayout>} />
          <Route path="/al/serial-history" element={<MainLayout><SerialHistoryPage /></MainLayout>} />
          <Route path="/al/doc-history" element={<MainLayout><DocHistoryPage /></MainLayout>} />

          {/* MD/MP Routes */}
          <Route element={<MPDataProvider><Outlet /></MPDataProvider>}>
            <Route path="/mp/dashboard" element={<MPDashboard />} />
            <Route path="/mp/al-performance" element={<ALPerformance />} />
            <Route path="/mp/ap-performance" element={<APPerformance />} />
          </Route>

          {/* MD Routes */}
          <Route path="/md/dashboard" element={<MDDashboard />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
