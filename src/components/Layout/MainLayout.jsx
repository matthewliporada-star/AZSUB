import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

// Import Scoped Styles
import "../../pages/AP/AP_Styles.css";
import "../../pages/AL/AL_Styles.css";
import "../../pages/Admin/Style/AdminGlobal.css";

const MainLayout = ({ children }) => {
  const { userRole } = useApp();
  const location = useLocation();

  // Determine the section based on path for scoping CSS
  const isAP = location.pathname.startsWith("/ap");
  const isAL = location.pathname.startsWith("/al");
  const isAdmin = location.pathname.startsWith("/admin");
  const isSuperAdmin = location.pathname.startsWith("/super-admin");

  // Specific wrapper class - Fallback to userRole if no path prefix
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

  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
