import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import supabase from "../../config/supabaseClient";
// [CHANGE] Import the new logo
import logoLight from "../../assets/logo1.png";
import logoDark from "../../assets/White logo.png";

const Sidebar = ({ sidebarOpen = true, setSidebarOpen }) => {
  const location = useLocation();
  const { userRole, currentUser, loading, darkMode } = useApp();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [cisAccess, setCisAccess] = useState("Disable");
  const [azSubAccess, setAzSubAccess] = useState("Disable");
  const [userRoleState, setUserRoleState] = useState(null);

  // Fetch user access settings
  useEffect(() => {
    const getUserAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("account_type")
          .eq("id", session.user.id)
          .single();
        
        if (profile) {
          setUserRoleState(profile.account_type?.toUpperCase());
        }

        // For AL, AP, MD, MP - check access settings
        const rolesWithAccess = ["AL", "AP", "MD", "MP"];
        if (rolesWithAccess.includes(profile?.account_type?.toUpperCase())) {
          const { data: accessData } = await supabase
            .from("user_access")
            .select("cis_access, az_sub_access")
            .eq("user_id", session.user.id)
            .maybeSingle();
          
          if (accessData) {
            setCisAccess(accessData.cis_access || "Disable");
            setAzSubAccess(accessData.az_sub_access || "Disable");
          } else {
            setCisAccess("Disable");
            setAzSubAccess("Disable");
          }
        } else {
          // Admins and Super Admins always see full menu
          setCisAccess("Enable");
          setAzSubAccess("Enable");
        }
      } catch (err) {
        console.error("Error getting user access:", err);
      }
    };

    getUserAccess();
  }, []);

  // Check if only CIS access is enabled (and AZ SUB is disabled)
  const isOnlyCISAccess = cisAccess === "Enable" && azSubAccess === "Disable";
  // Check if both are enabled (full access)
  const hasFullAccess = cisAccess === "Enable" && azSubAccess === "Enable";
  // Check if only AZ SUB is enabled
  const isOnlyAZSubAccess = cisAccess === "Disable" && azSubAccess === "Enable";

  // Add near the top, after other imports
  const cisIcon = (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path>
      <path d="M12 6v6l4 2"></path>
    </svg>
  );

  // CIS Only Menu Items (for when only CIS access is enabled)
  const getCISOnlyMenuItems = (rolePath) => [
    {
      path: "#cis",
      label: "Client Information System",
      icon: cisIcon,
      isDropdown: true,
      subItems: [
        { path: `/${rolePath}/cis/CISDashboard`, label: "Dashboard" },
        { path: `/${rolePath}/cis`, label: "Fill Out" },
        { path: `/${rolePath}/cis/record`, label: "Record" },
      ],
    },
  ];

  // Full Menu Items (when both access are enabled or for admins)
  const getFullAPMenuItems = () => [
    {
      path: "/ap/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      path: "/ap/monitoring",
      label: "Solutions Provider Monitoring",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      ),
    },
    {
      path: "/ap/clients",
      label: "Client Profiles",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      path: "/ap/submission",
      label: "Submission",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
      ),
    },
    {
      path: "/ap/serial-history",
      label: "Serial Request History",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
    },
    {
      path: "/ap/doc-history",
      label: "Document Submission History",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      ),
    },
    {
      path: "#cis",
      label: "Client Information System",
      icon: cisIcon,
      isDropdown: true,
      subItems: [
        { path: "/ap/cis/CISDashboard", label: "Dashboard" },
        { path: "/ap/cis", label: "Fill Out" },
        { path: "/ap/cis/record", label: "Record" },
      ],
    },
  ];

  const getFullALMenuItems = () => [
    {
      path: "/al/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      path: "/al/team-performance",
      label: "Team Performance",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      path: "/al/monitoring",
      label: "Solutions Provider Monitoring",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      ),
    },
    {
      path: "/al/clients",
      label: "Client Profiles",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      path: "/al/submission",
      label: "Submission",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
      ),
    },
    {
      path: "/al/serial-history",
      label: "Serial Request History",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
    },
    {
      path: "/al/doc-history",
      label: "Document Submission History",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      ),
    },
    {
      path: "#cis",
      label: "Client Information System",
      icon: cisIcon,
      isDropdown: true,
      subItems: [
        { path: "/al/cis/CISDashboard", label: "Dashboard" },
        { path: "/al/cis", label: "Fill Out" },
        { path: "/al/cis/record", label: "Record" },
      ],
    },
  ];

  const getFullMPMenuItems = () => [
    {
      path: "/mp/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      path: "/mp/clients",
      label: "Client Profiles",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
        </svg>
      ),
    },
    {
      path: "/mp/submission",
      label: "Submission",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
      ),
    },
    {
      path: "#cis",
      label: "Client Information System",
      icon: cisIcon,
      isDropdown: true,
      subItems: [
        { path: "/mp/cis/CISDashboard", label: "Dashboard" },
        { path: "/mp/cis", label: "Fill Out" },
        { path: "/mp/cis/record", label: "Record" },
      ],
    },
  ];

  const getFullMDMenuItems = () => [
    {
      path: "/md/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      path: "#cis",
      label: "Client Information System",
      icon: cisIcon,
      isDropdown: true,
      subItems: [
        { path: "/md/cis/CISDashboard", label: "Dashboard" },
        { path: "/md/cis", label: "Fill Out" },
        { path: "/md/cis/record", label: "Record" },
      ],
    },
  ];

  // Admin Menu Items (always full access)
  const adminMenuItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      path: "/admin/ManageUsers",
      label: "Manage Users",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      path: "/admin/policies",
      label: "Policies",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
    },
    {
      path: "/admin/activity-logs",
      label: "Activity Logs",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      ),
    },
    {
      path: "/admin/records",
      label: "Records",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
    },
  ];

  // Super-Admin Menu Items (always full access)
  const superAdminMenuItems = [
    {
      path: "/super-admin/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      path: "/super-admin/ManageUsers",
      label: "Manage Users",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      path: "#cis",
      label: "Client Information System",
      icon: cisIcon,
      isDropdown: true,
      subItems: [
        { path: "/super-admin/cis/CISDashboard", label: "Dashboard" },
        { path: "/super-admin/cis", label: "Fill Out" },
        { path: "/super-admin/cis/record", label: "Record" },
      ],
    },
  ];

  if (loading) {
    return (
      <div
        className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}
        style={{ backgroundColor: "#fff", borderRight: "1px solid #eaecf0" }}
      ></div>
    );
  }

  const isWaitingAccess = currentUser?.status === "Waiting for Access";
  const role = userRole?.toUpperCase();

  // Determine which menu items to show based on access settings
  let menuItems = [];
  
  if (!isWaitingAccess) {
    // For Admins and Super Admins - always show full menu
    if (role === "ADMIN") {
      menuItems = adminMenuItems;
    } else if (role === "SUPER_ADMIN") {
      menuItems = superAdminMenuItems;
    }
    // For AL, AP, MD, MP - check access settings
    else if (role === "AP") {
      if (isOnlyCISAccess) {
        // Only show CIS menu
        menuItems = getCISOnlyMenuItems("ap");
      } else if (hasFullAccess || isOnlyAZSubAccess) {
        // Show full menu (both access or only AZ SUB)
        menuItems = getFullAPMenuItems();
      }
    } else if (role === "AL") {
      if (isOnlyCISAccess) {
        // Only show CIS menu
        menuItems = getCISOnlyMenuItems("al");
      } else if (hasFullAccess || isOnlyAZSubAccess) {
        // Show full menu (both access or only AZ SUB)
        menuItems = getFullALMenuItems();
      }
    } else if (role === "MP") {
      if (isOnlyCISAccess) {
        // Only show CIS menu
        menuItems = getCISOnlyMenuItems("mp");
      } else if (hasFullAccess || isOnlyAZSubAccess) {
        // Show full menu (both access or only AZ SUB)
        menuItems = getFullMPMenuItems();
      }
    } else if (role === "MD") {
      if (isOnlyCISAccess) {
        // Only show CIS menu
        menuItems = getCISOnlyMenuItems("md");
      } else if (hasFullAccess || isOnlyAZSubAccess) {
        // Show full menu (both access or only AZ SUB)
        menuItems = getFullMDMenuItems();
      }
    }
  }

  return (
    <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
      {setSidebarOpen && (
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <i
            className={`fa-solid ${sidebarOpen ? "fa-chevron-left" : "fa-chevron-right"}`}
          ></i>
        </button>
      )}

      <div
        className="sidebar-header"
        style={{ borderBottom: "none", boxShadow: "none" }}
      >
        <div
          className="sidebar-logo"
          style={{
            height: "85px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            border: "none",
            padding: "10px 0",
            boxSizing: "border-box",
          }}
        >
          <img
            src={darkMode ? logoDark : logoLight}
            alt="Caelum"
            className={`sidebar-logo-img ${sidebarOpen ? "" : "collapsed"}`}
            style={{
              clipPath: "inset(0 0 5px 0)",
              maxHeight: "100%",
              display: "block",
            }}
          />
        </div>
      </div>
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <div key={item.path}>
            {item.isDropdown ? (
              <>
                <div
                  className={`sidebar-item dropdown-toggle ${
                    openDropdown === item.path ? "active" : ""
                  } ${location.pathname.startsWith(item.path.replace("#", "")) ? "active" : ""}`}
                  onClick={() => {
                    setOpenDropdown(
                      openDropdown === item.path ? null : item.path,
                    );
                  }}
                  title={!sidebarOpen ? item.label : ""}
                  style={{ cursor: "pointer" }}
                >
                  <div className="sidebar-icon">{item.icon}</div>
                  {sidebarOpen && <span>{item.label}</span>}
                  {sidebarOpen && (
                    <span
                      className="dropdown-arrow"
                      style={{ marginLeft: "auto" }}
                    >
                      {openDropdown === item.path ? "▾" : "▸"}
                    </span>
                  )}
                </div>

                {openDropdown === item.path &&
                  item.subItems.map((sub) => (
                    <Link
                      key={sub.path}
                      to={sub.path}
                      className={`sidebar-item sub-item ${
                        location.pathname === sub.path ? "active" : ""
                      }`}
                      title={!sidebarOpen ? sub.label : ""}
                    >
                      {sidebarOpen && <span>{sub.label}</span>}
                    </Link>
                  ))}
              </>
            ) : (
              <Link
                to={item.path}
                className={`sidebar-item ${location.pathname === item.path ? "active" : ""}`}
                title={!sidebarOpen ? item.label : ""}
              >
                <div className="sidebar-icon">{item.icon}</div>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;