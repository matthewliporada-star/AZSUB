// src/components/Layout/MainLayout.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import WaitingForAccess from "../../pages/Common/WaitingForAccess";
import supabase from "../../config/supabaseClient";

// Import Scoped Styles
import "../../pages/AP/AP_Styles.css";
import "../../pages/AL/AL_Styles.css";
import "../../pages/Admin/Style/AdminGlobal.css";

const MainLayout = ({ children }) => {
  const { userRole, currentUser } = useApp();
  const location = useLocation();

  const isAP = location.pathname.startsWith("/ap");
  const isAL = location.pathname.startsWith("/al");
  const isAdmin = location.pathname.startsWith("/admin");
  const isSuperAdmin = location.pathname.startsWith("/super-admin");

  let layoutClass = "default-layout";
  const normalizedRole = userRole?.toUpperCase();
  if (isAP || normalizedRole === "AP") layoutClass = "ap-layout";
  else if (isAL || normalizedRole === "AL") layoutClass = "al-layout";
  else if (
    isAdmin ||
    normalizedRole === "ADMIN" ||
    isSuperAdmin ||
    normalizedRole === "SUPER_ADMIN"
  )
    layoutClass = "admin-layout";

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check for CIS-only redirect
  useEffect(() => {
    const checkAndRedirectForCISOnly = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("account_type")
          .eq("id", session.user.id)
          .single();

        const role = profile?.account_type?.toLowerCase();
        if (!role) return;
        
        const { data: accessData } = await supabase
          .from("user_access")
          .select("cis_access, az_sub_access")
          .eq("user_id", session.user.id)
          .maybeSingle();

        const cis = accessData?.cis_access || "Disable";
        const azSub = accessData?.az_sub_access || "Disable";
        const isOnlyCISAccess = cis === "Enable" && azSub === "Disable";
        
        const currentPath = location.pathname;
        const isCISPath = currentPath.includes("/cis");
        
        if (isOnlyCISAccess && !isCISPath) {
          window.location.replace(`/${role}/cis/CISDashboard`);
        }
      } catch (err) {
        console.error("Error checking CIS redirect:", err);
      }
    };
    
    checkAndRedirectForCISOnly();
  }, [location.pathname]);

  if (currentUser?.status === "Waiting for Access") {
    return (
      <div className={`app-layout-wrapper ${layoutClass}`}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
          <TopBar sidebarOpen={sidebarOpen} />
          <div className="container">
            <WaitingForAccess />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-layout-wrapper ${layoutClass}`}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
        <TopBar sidebarOpen={sidebarOpen} />
        <div className="container">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;