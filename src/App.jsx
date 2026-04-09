// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import "./responsive.css";
import { AppProvider, useApp } from "./context/AppContext";
import MainLayout from "./components/Layout/MainLayout";
import ProfileLayout from "./components/Layout/ProfileLayout";
import Login from "./pages/Login/Login";
import MPLayout from "./pages/MP/MPLayout";
import CISDashboard from "./pages/CIS/CISDashboard";
import CISRecord from "./pages/CIS/CISRecord";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRedirect from "./components/RoleBasedRedirect";

// MP Data Provider
import { MPDataProvider } from "./pages/MP/MPData.jsx";

// MD Data Provider
import { MDDataProvider } from "./pages/MD/MDData.jsx";

// AP Pages
import APDashboard from "./pages/AP/DashboardPage";
import MonitoringPage from "./pages/AP/MonitoringPage";
import ClientsPage from "./pages/AP/ClientsPage";
import SubmissionPage from "./pages/AP/SubmissionPage";
import SerialHistoryPage from "./pages/AP/SerialHistoryPage";
import DocHistoryPage from "./pages/AP/DocHistoryPage";
import FormPage from "./pages/AP/forms/FormPage";

// Admin Pages
import AdminDashboard from "./pages/Admin/Admin-Dashboard";
import ManageUsers from "./pages/Admin/ManageUsers";
import AdminSerialNumber from "./pages/Admin/Admin-SerialNumber";
import AdminPolicies from "./pages/Admin/Admin-Policies";
import AdminActivityLogs from "./pages/Admin/Admin-ActivityLogs";
import AdminRecord from "./pages/Admin/Admin-Record";
import AdminTracking from "./pages/Admin/Admin-Tracking";

// Super-Admin Pages
import SuperAdminDashboard from "./pages/Super-Admin/Super-Admin-Dashboard";
import SuperAdminManageUsers from "./pages/Super-Admin/ManageUsers";

// Common Pages
import ProfilePage from "./pages/Common/ProfilePage";
import WaitingForAccess from "./pages/Common/WaitingForAccess";
import LandingPage from "./pages/LandingPage/LandingPage";

// AL Pages
import ALDashboard from "./pages/AL/DashboardPage";
import ALTeamPerformance from "./pages/AL/PerformanceDashboardPage";
import CIS from "./pages/CIS/CIS";

// MP Pages
import MPDashboard from "./pages/MP/MP-Dashboard";
import ALPerformance from "./pages/MP/ALPerformance";
import APPerformance from "./pages/MP/APPerformance";

// MD Pages
import MDDashboard from "./pages/MD/MD-Dashboard";
import MDMPPerformance from "./pages/MD/MPPerformance";
import MDALPerformance from "./pages/MD/ALPerformance";
import MDAPPerformance from "./pages/MD/APPerformance";

function App() {
  return (
    <AppProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/verify-identity" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={<Navigate to="/verify-identity" replace />}
          />

          {/* Waiting for Access Page */}
          <Route path="/waiting" element={<WaitingForAccess />} />

          {/* Role Base Redirects */}
          <Route path="/ap" element={<RoleBasedRedirect />} />
          <Route path="/al" element={<RoleBasedRedirect />} />
          <Route path="/mp" element={<RoleBasedRedirect />} />
          <Route path="/md" element={<RoleBasedRedirect />} />

          {/* AP Routes */}
          <Route
            path="/ap/dashboard"
            element={
              <ProtectedRoute requiredRole="AP">
                <MainLayout>
                  <APDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ap/monitoring"
            element={
              <ProtectedRoute requiredRole="AP">
                <MainLayout>
                  <MonitoringPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ap/clients"
            element={
              <ProtectedRoute requiredRole="AP">
                <MainLayout>
                  <ClientsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ap/submission"
            element={
              <ProtectedRoute requiredRole="AP">
                <MainLayout>
                  <SubmissionPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ap/serial-history"
            element={
              <ProtectedRoute requiredRole="AP">
                <MainLayout>
                  <SerialHistoryPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ap/doc-history"
            element={
              <ProtectedRoute requiredRole="AP">
                <MainLayout>
                  <DocHistoryPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* AP CIS routes */}
          <Route
            path="/ap/cis"
            element={
              <ProtectedRoute requiredRole="AP">
                <MainLayout>
                  <Outlet />
                </MainLayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<CIS />} />
            <Route path="CISDashboard" element={<CISDashboard />} />
            <Route path="record" element={<CISRecord />} />
          </Route>

          {/* Standalone Application Form Route */}
          <Route path="/application-form/:formType" element={<FormPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ManageUsers"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <MainLayout>
                  <ManageUsers />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/SerialNumber"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <MainLayout>
                  <AdminSerialNumber />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/policies"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <MainLayout>
                  <AdminPolicies />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/activity-logs"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <MainLayout>
                  <AdminActivityLogs />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/records"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <MainLayout>
                  <AdminRecord />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            element={
              <MPDataProvider>
                <Outlet />
              </MPDataProvider>
            }
          >
            <Route
              path="/admin/tracking"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <MainLayout>
                    <AdminTracking />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              <ProfileLayout>
                <ProfilePage />
              </ProfileLayout>
            }
          />

          {/* Super-Admin Routes */}
          <Route
            path="/super-admin/dashboard"
            element={
              <ProtectedRoute requiredRole="SUPER_ADMIN">
                <MainLayout>
                  <SuperAdminDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin/ManageUsers"
            element={
              <ProtectedRoute requiredRole="SUPER_ADMIN">
                <MainLayout>
                  <SuperAdminManageUsers />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Super-Admin CIS routes */}
          <Route
            path="/super-admin/cis"
            element={
              <ProtectedRoute requiredRole="SUPER_ADMIN">
                <MainLayout>
                  <Outlet />
                </MainLayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<CIS />} />
            <Route path="CISDashboard" element={<CISDashboard />} />
            <Route path="record" element={<CISRecord />} />
          </Route>

          {/* AL Routes */}
          <Route
            path="/al/dashboard"
            element={
              <ProtectedRoute requiredRole="AL">
                <MainLayout>
                  <ALDashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/al/team-performance"
            element={
              <ProtectedRoute requiredRole="AL">
                <MainLayout>
                  <ALTeamPerformance />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/al/monitoring"
            element={
              <ProtectedRoute requiredRole="AL">
                <MainLayout>
                  <MonitoringPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/al/clients"
            element={
              <ProtectedRoute requiredRole="AL">
                <MainLayout>
                  <ClientsPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/al/submission"
            element={
              <ProtectedRoute requiredRole="AL">
                <MainLayout>
                  <SubmissionPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/al/serial-history"
            element={
              <ProtectedRoute requiredRole="AL">
                <MainLayout>
                  <SerialHistoryPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/al/doc-history"
            element={
              <ProtectedRoute requiredRole="AL">
                <MainLayout>
                  <DocHistoryPage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/al/cis"
            element={
              <ProtectedRoute requiredRole="AL">
                <MainLayout>
                  <Outlet />
                </MainLayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<CIS />} />
            <Route path="CISDashboard" element={<CISDashboard />} />
            <Route path="record" element={<CISRecord />} />
          </Route>

          {/* MP Routes */}
          <Route
            element={
              <MPDataProvider>
                <Outlet />
              </MPDataProvider>
            }
          >
            <Route
              path="/mp/dashboard"
              element={
                <ProtectedRoute requiredRole="MP">
                  <MPLayout>
                    <MPDashboard />
                  </MPLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mp/al-performance"
              element={
                <ProtectedRoute requiredRole="MP">
                  <MPLayout>
                    <ALPerformance />
                  </MPLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mp/ap-performance"
              element={
                <ProtectedRoute requiredRole="MP">
                  <MPLayout>
                    <APPerformance />
                  </MPLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mp/cis"
              element={
                <ProtectedRoute requiredRole="MP">
                  <MPLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<CIS />} />
              <Route path="CISDashboard" element={<CISDashboard />} />
              <Route path="record" element={<CISRecord />} />
            </Route>
          </Route>

          {/* MD Routes */}
          <Route
            element={
              <MDDataProvider>
                <Outlet />
              </MDDataProvider>
            }
          >
            <Route
              path="/md/dashboard"
              element={
                <ProtectedRoute requiredRole="MD">
                  <MDDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/md/mp-performance"
              element={
                <ProtectedRoute requiredRole="MD">
                  <MDMPPerformance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/md/al-performance"
              element={
                <ProtectedRoute requiredRole="MD">
                  <MDALPerformance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/md/ap-performance"
              element={
                <ProtectedRoute requiredRole="MD">
                  <MDAPPerformance />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
