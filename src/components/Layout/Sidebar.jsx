import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import supabase from "../../config/supabaseClient";
import logoLight from "../../assets/logo1.png";
import logoDark from "../../assets/White logo.png";

const Sidebar = ({ sidebarOpen = true, setSidebarOpen }) => {
  const location = useLocation();
  const { userRole, currentUser, loading, darkMode } = useApp();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [cisAccess, setCisAccess] = useState("Disable");
  const [azSubAccess, setAzSubAccess] = useState("Disable");
  const [accessLoaded, setAccessLoaded] = useState(false);
  const [userRoleState, setUserRoleState] = useState("");

  // Fetch user access settings
  useEffect(() => {
    const getUserAccess = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setAccessLoaded(true);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("account_type")
          .eq("id", session.user.id)
          .single();

        const role = profile?.account_type?.toUpperCase();
        setUserRoleState(role);

        const rolesWithAccess = ["AL", "AP", "MD", "MP"];
        if (rolesWithAccess.includes(role)) {
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
          setCisAccess("Enable");
          setAzSubAccess("Enable");
        }
      } catch (err) {
        console.error("Error getting user access:", err);
      } finally {
        setAccessLoaded(true);
      }
    };

    getUserAccess();
  }, []);

  // Icons
  const dashboardIcon = (
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
  );

  const clientsIcon = (
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
  );

  const submissionIcon = (
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
  );

  const monitoringIcon = (
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
  );

  const serialIcon = (
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
  );

  const docIcon = (
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
  );

  const teamIcon = (
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
  );

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

  // Get menu items based on role and access
  const getMenuItems = () => {
    const role = userRoleState || userRole?.toUpperCase();
    const items = [];

    console.log(
      `Building menu for role: ${role}, CIS: ${cisAccess}, AZ: ${azSubAccess}`,
    );

    // ADMIN and SUPER_ADMIN always get full menu
    if (role === "ADMIN") {
      return [
        { path: "/admin/dashboard", label: "Dashboard", icon: dashboardIcon },
        {
          path: "/admin/ManageUsers",
          label: "Manage Users",
          icon: clientsIcon,
        },
        { path: "/admin/policies", label: "Policies", icon: docIcon },
        {
          path: "/admin/activity-logs",
          label: "Activity Logs",
          icon: serialIcon,
        },
        { path: "/admin/records", label: "Records", icon: submissionIcon },
      ];
    }

    if (role === "SUPER_ADMIN") {
      return [
        {
          path: "/super-admin/dashboard",
          label: "Dashboard",
          icon: dashboardIcon,
        },
        {
          path: "/super-admin/ManageUsers",
          label: "Manage Users",
          icon: clientsIcon,
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
    }

    // For AP, AL, MP, MD - check access settings
    if (role === "AP") {
      // Only add AZ SUB menu items if AZ SUB is enabled
      if (azSubAccess === "Enable") {
        items.push(
          { path: "/ap/dashboard", label: "Dashboard", icon: dashboardIcon },
          {
            path: "/ap/monitoring",
            label: "Solutions Provider Monitoring",
            icon: monitoringIcon,
          },
          { path: "/ap/clients", label: "Client Profiles", icon: clientsIcon },
          { path: "/ap/submission", label: "Submission", icon: submissionIcon },
          {
            path: "/ap/serial-history",
            label: "Serial Request History",
            icon: serialIcon,
          },
          {
            path: "/ap/doc-history",
            label: "Document Submission History",
            icon: docIcon,
          },
        );
      }

      // Only add CIS menu if CIS is enabled
      if (cisAccess === "Enable") {
        items.push({
          path: "#cis",
          label: "Client Information System",
          icon: cisIcon,
          isDropdown: true,
          subItems: [
            { path: "/ap/cis/CISDashboard", label: "Dashboard" },
            { path: "/ap/cis", label: "Fill Out" },
            { path: "/ap/cis/record", label: "Record" },
          ],
        });
      }
      return items;
    }

    if (role === "AL") {
      if (azSubAccess === "Enable") {
        items.push(
          { path: "/al/dashboard", label: "Dashboard", icon: dashboardIcon },
          {
            path: "/al/team-performance",
            label: "Team Performance",
            icon: teamIcon,
          },
          {
            path: "/al/monitoring",
            label: "Solutions Provider Monitoring",
            icon: monitoringIcon,
          },
          { path: "/al/clients", label: "Client Profiles", icon: clientsIcon },
          { path: "/al/submission", label: "Submission", icon: submissionIcon },
          {
            path: "/al/serial-history",
            label: "Serial Request History",
            icon: serialIcon,
          },
          {
            path: "/al/doc-history",
            label: "Document Submission History",
            icon: docIcon,
          },
        );
      }

      if (cisAccess === "Enable") {
        items.push({
          path: "#cis",
          label: "Client Information System",
          icon: cisIcon,
          isDropdown: true,
          subItems: [
            { path: "/al/cis/CISDashboard", label: "Dashboard" },
            { path: "/al/cis", label: "Fill Out" },
            { path: "/al/cis/record", label: "Record" },
          ],
        });
      }
      return items;
    }

    if (role === "MP") {
      if (azSubAccess === "Enable") {
        items.push(
          { path: "/mp/dashboard", label: "Dashboard", icon: dashboardIcon },
          { path: "/mp/clients", label: "Client Profiles", icon: clientsIcon },
          { path: "/mp/submission", label: "Submission", icon: submissionIcon },
        );
      }

      if (cisAccess === "Enable") {
        items.push({
          path: "#cis",
          label: "Client Information System",
          icon: cisIcon,
          isDropdown: true,
          subItems: [
            { path: "/mp/cis/CISDashboard", label: "Dashboard" },
            { path: "/mp/cis", label: "Fill Out" },
            { path: "/mp/cis/record", label: "Record" },
          ],
        });
      }
      return items;
    }

    if (role === "MD") {
      if (azSubAccess === "Enable") {
        items.push({
          path: "/md/dashboard",
          label: "Dashboard",
          icon: dashboardIcon,
        });
      }

      if (cisAccess === "Enable") {
        items.push({
          path: "#cis",
          label: "Client Information System",
          icon: cisIcon,
          isDropdown: true,
          subItems: [
            { path: "/md/cis/CISDashboard", label: "Dashboard" },
            { path: "/md/cis", label: "Fill Out" },
            { path: "/md/cis/record", label: "Record" },
          ],
        });
      }
      return items;
    }

    return items;
  };

  if (loading || !accessLoaded) {
  return <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`} />;
}

  const isWaitingAccess = currentUser?.status === "Waiting for Access";
  const menuItems = !isWaitingAccess ? getMenuItems() : [];

  console.log(`Final menu items count: ${menuItems.length}`);
  console.log(
    `CIS Access value: ${cisAccess}, AZ Access value: ${azSubAccess}`,
  );

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
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === item.path ? null : item.path,
                    )
                  }
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
                      className={`sidebar-item sub-item ${location.pathname === sub.path ? "active" : ""}`}
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
