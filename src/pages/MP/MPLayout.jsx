// MPLayout.jsx - Admin-styled layout for Management Partners
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import "./MP_Styles.css";
// [CHANGE] Import the new logo
import sidebarLogo from "../../assets/White logo.png";
import topLogo from "../../assets/2.png";

const MPLayout = ({ children, title = "Dashboard" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userRole, darkMode, toggleDarkMode } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [cisOpen, setCisOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState(location.pathname);

  // Keep the active highlight in sync with routing
  useEffect(() => {
    setSelectedPath(location.pathname);
    setCisOpen(location.pathname.startsWith("/mp/cis"));
  }, [location.pathname]);

  const isActive = (path) => selectedPath === path;

  const mpMenuItems = [
    {
      path: "/mp/dashboard",
      label: "Dashboard",
      icon: <i className="fa-solid fa-chart-line"></i>,
    },
    {
      path: "/mp/al-performance",
      label: "Agency Leaders",
      icon: <i className="fa-solid fa-users"></i>,
    },
    {
      path: "/mp/ap-performance",
      label: "Agency Partners",
      icon: <i className="fa-solid fa-user-group"></i>,
    },
    {
      path: "#cis",
      label: "Client Information System",
      icon: <i className="fa-solid fa-file-lines"></i>,
      isDropdown: true,
      subItems: [
        { path: "/mp/cis/CISDashboard", label: "Dashboard" },
        { path: "/mp/cis", label: "Fill Out" },
        { path: "/mp/cis/record", label: "Record" },
      ],
    },
  ];

  const handleLogout = async () => {
    localStorage.removeItem("mpData");
    navigate("/");
  };

  return (
    <div className="mp-layout">
      {/* SIDEBAR */}
      <aside className={`mp-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <button
          className="mp-sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <i
            className={`fa-solid ${sidebarOpen ? "fa-chevron-left" : "fa-chevron-right"}`}
          ></i>
        </button>

        <div className="sidebar-header">
          <Link
            to="/mp/dashboard"
            className="sidebar-logo"
            title="MP Dashboard"
          >
            {sidebarOpen ? (
              <img
                src={sidebarLogo}
                alt="Caelum Logo"
                className="sidebar-logo-img"
              />
            ) : (
              <img
                src={sidebarLogo}
                alt="C"
                className="sidebar-logo-img collapsed"
              />
            )}
          </Link>
        </div>

        <div className="sidebar-menu">
          {mpMenuItems.map((item) => (
            <div key={item.path}>
              {item.isDropdown ? (
                <>
                  <div
                    className={`sidebar-item dropdown-toggle ${
                      selectedPath === "#cis" ? "active" : ""
                    }`}
                    onClick={() => {
                      setCisOpen((o) => !o);
                      setSelectedPath("#cis");
                    }}
                    title={!sidebarOpen ? item.label : ""}
                  >
                    <div className="sidebar-icon">{item.icon}</div>
                    {sidebarOpen && <span>{item.label}</span>}
                    {sidebarOpen && (
                      <span className="dropdown-arrow">
                        {cisOpen ? "▾" : "▸"}
                      </span>
                    )}
                  </div>

                  {cisOpen &&
                    item.subItems.map((sub) => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className={`sidebar-item sub-item ${
                          isActive(sub.path) ? "active" : ""
                        }`}
                        onClick={() => setSelectedPath(sub.path)}
                      >
                        {sidebarOpen && <span>{sub.label}</span>}
                      </Link>
                    ))}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`sidebar-item ${
                    isActive(item.path) ? "active" : ""
                  }`}
                  onClick={() => setSelectedPath(item.path)}
                >
                  <div className="sidebar-icon">{item.icon}</div>
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          {/* Optional footer content if needed */}
        </div>
      </aside>

      {/* HEADER */}
      <header className={`mp-header ${sidebarOpen ? "" : "expanded"}`}>
        <div className="mp-header-content">
          <div className="header-left">
            {sidebarOpen && <h1 className="header-title-inline">{title}</h1>}
          </div>

          <div className="header-center-logo">
            {!sidebarOpen && (
              <img src={topLogo} alt="Logo" className="header-logo-img" />
            )}
          </div>

          <div className="mp-header-user">
            <button
              className="mp-dark-mode-toggle"
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                marginRight: "15px",
                fontSize: "18px",
                color: darkMode ? "#e2e8f0" : "#64748b",
                transition: "color 0.3s",
              }}
            >
              <i className={`fa-solid ${darkMode ? "fa-sun" : "fa-moon"}`}></i>
            </button>
            <button
              className="mp-user-profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="mp-user-avatar">
                {currentUser?.name ? (
                  <span>{currentUser.name.charAt(0).toUpperCase()}</span>
                ) : (
                  <i className="fa-solid fa-user"></i>
                )}
              </div>
              <span>
                {currentUser?.name || "Management Partner"} - {userRole || "MP"}
              </span>
            </button>

            {showProfileMenu && (
              <div className="mp-profile-dropdown">
                <div
                  className="mp-dropdown-item"
                  onClick={() => navigate("/profile")}
                >
                  <i className="fa-solid fa-user"></i> Profile
                </div>
                <hr className="mp-dropdown-divider" />
                <button
                  onClick={handleLogout}
                  className="mp-dropdown-item mp-logout-item"
                >
                  <i className="fa-solid fa-right-from-bracket"></i> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
        <div className="container">
          {/* Page Title - Only when Sidebar Closed */}
          {!sidebarOpen && (
            <div className="mp-dashboard-header">
              <h1>{title}</h1>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};

export default MPLayout;
