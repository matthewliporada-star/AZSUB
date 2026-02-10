import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../config/supabaseClient";
import "./Style/AdminLayout.css";
import "./Style/Dashboard.css";
import LogoImage from "../../assets/logo1.png";
import ActivityLog from "../../components/ActivityLog";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(0);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newSerialNumbers, setNewSerialNumbers] = useState(0);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("You need to login first");
        navigate("/");
        return;
      }

      const type = session.user.user_metadata?.account_type;

      if (!type || type.toLowerCase() !== "admin") {
        alert("You do not have access to this page");
        navigate("/");
        return;
      }

      setUser(session.user);
      fetchTotalUsers();
      fetchUsers();
      fetchNewSerialNumbers();
    };

    checkAdmin();
  }, [navigate]);

  const fetchTotalUsers = async () => {
    try {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      setTotalUsers(count || 0);
    } catch (err) {
      console.log("Profiles table missing. Defaulting to 1 admin.");
      setTotalUsers(1);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error.message);
      } else {
        setUsers(data || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchNewSerialNumbers = async () => {
    try {
      // Get serial numbers added in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      const { count, error } = await supabase
        .from("serial_number")
        .select("*", { count: "exact", head: true })
        .gte("date", sevenDaysAgoISO);

      if (error) {
        console.error("Error fetching new serial numbers:", error.message);
        setNewSerialNumbers(0);
      } else {
        setNewSerialNumbers(count || 0);
      }
    } catch (err) {
      console.error("Error fetching new serial numbers:", err);
      setNewSerialNumbers(0);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (





    <div className="admin-container">

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <button
          className="admin-sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <i className={`fa-solid ${sidebarOpen ? 'fa-bars' : 'fa-bars'}`}></i>
        </button>
        <div className="admin-sidebar-logo">
          <img src={LogoImage} alt="Logo" className="admin-logo-img" />
        </div>

        <ul className="admin-sidebar-menu">
          <li className="active" onClick={() => navigate("/admin/dashboard")}>
            <i className="fa-solid fa-chart-line"></i> {sidebarOpen && <span>Dashboard</span>}
          </li>

          <li onClick={() => navigate("/admin/ManageUsers")}>
            <i className="fa-solid fa-users"></i> {sidebarOpen && <span>Manage Users</span>}
          </li>

          <li onClick={() => navigate("/admin/policies")}>
            <i className="fa-solid fa-file-contract"></i> {sidebarOpen && <span>Policies</span>}
          </li>
          <li onClick={() => navigate("/admin/activity-logs")}>
            <i className="fa-solid fa-list-ul"></i> {sidebarOpen && <span>Activity Logs</span>}
          </li>
        </ul>
      </aside>

      {/* HEADER */}
      <header className={`admin-header ${sidebarOpen ? '' : 'expanded'}`}>
        <div className="admin-header-content">
          <h1>Admin Dashboard</h1>
          <div className="admin-header-user">
            <button
              className="admin-user-profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="admin-user-avatar">
                {user?.user_metadata?.last_name ? (
                  <span className="admin-avatar-initials">
                    {user.user_metadata.last_name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <i className="fa-solid fa-user"></i>
                )}
              </div>
              <span>{user?.user_metadata?.last_name || "User"} - Admin</span>
            </button>
            {showProfileMenu && (
              <div className="admin-profile-dropdown">
                <a onClick={() => navigate("/admin/Profile")} className="admin-dropdown-item">
                  <i className="fa-solid fa-user"></i> Profile
                </a>
                <a onClick={() => navigate("/admin/SerialNumber")} className="admin-dropdown-item">
                  <i className="fa-solid fa-barcode"></i> Serial Numbers
                </a>

                <hr className="admin-dropdown-divider" />
                <a onClick={logout} className="admin-dropdown-item admin-logout-item">
                  <i className="fa-solid fa-right-from-bracket"></i> Logout
                </a>
              </div>
            )}
          </div>
        </div>
      </header>


      {/* MAIN CONTENT */}
      <main className={`admin-main-content ${sidebarOpen ? '' : 'expanded'}`}>

        <div className="header-row">
          <div>
            <h1 className="title">Dashboard Overview</h1>
            <p className="subtitle">Welcome back, Admin 👋</p>
          </div>
        </div>

        {/* DASHBOARD GRID: STATS & ACTIVITY LOG */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>

          {/* LEFT COLUMN: CARDS & TABLE */}
          <div className="dashboard-left-col">

            {/* CARDS GRID */}
            <div className="admin-cards-grid" style={{ marginBottom: "24px" }}>

              {/* Total Users */}
              <div className="admin-card">
                <div className="admin-card-icon user-icon">
                  <i className="fa-solid fa-user-group"></i>
                </div>

                <div className="admin-card-info">
                  <p className="admin-card-title">Totals Users</p>
                  <h2 className="admin-card-number">{totalUsers}</h2>
                  <div className="bar-chart">
                    <div className="bar" style={{ height: "85%", backgroundColor: "#003266" }}></div>
                    <div className="bar" style={{ height: "70%", backgroundColor: "#0052a3" }}></div>
                    <div className="bar" style={{ height: "90%", backgroundColor: "#003266" }}></div>
                    <div className="bar" style={{ height: "65%", backgroundColor: "#0052a3" }}></div>
                    <div className="bar" style={{ height: "80%", backgroundColor: "#003266" }}></div>
                  </div>
                </div>
              </div>

              {/* New Serial Numbers */}
              <div className="admin-card admin-serial-card">
                <div className="admin-card-icon admin-serial-icon">
                  <i className="fa-solid fa-barcode"></i>
                  <div className="admin-icon-badge"></div>
                </div>

                <div className="admin-card-info">
                  <p className="admin-card-title">New serial numbers added</p>
                  <h2 className="admin-card-number">{newSerialNumbers}</h2>
                  <p style={{ fontSize: "12px", color: "#999", marginTop: "5px", marginBottom: "10px" }}>Last 7 days</p>
                  <div className="bar-chart">
                    <div className="bar" style={{ height: "60%", backgroundColor: "#f4b43c" }}></div>
                    <div className="bar" style={{ height: "75%", backgroundColor: "#f4b43c" }}></div>
                    <div className="bar" style={{ height: "45%", backgroundColor: "#f4b43c" }}></div>
                    <div className="bar" style={{ height: "90%", backgroundColor: "#f4b43c" }}></div>
                    <div className="bar" style={{ height: "55%", backgroundColor: "#f4b43c" }}></div>
                    <div className="bar" style={{ height: "70%", backgroundColor: "#f4b43c" }}></div>
                    <div className="bar" style={{ height: "85%", backgroundColor: "#f4b43c" }}></div>
                  </div>
                </div>
              </div>

            </div>

            {/* USER TABLE CONTAINER */}
            <div className="content-container">
              <div className="container-header">
                <h2>Users List</h2>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  onClick={() => navigate("/admin/ManageUsers")}
                >
                  View All
                </button>
              </div>
              <div className="container-body" style={{ padding: 0 }}>
                <table className="admin-user-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#003266', borderBottom: '1px solid #003266' }}>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#ffffff' }}>No.</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#ffffff' }}>Last Name</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#ffffff' }}>First Name</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#ffffff' }}>Email</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#ffffff' }}>Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((u, index) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px 20px' }}>{index + 1}</td>
                          <td style={{ padding: '12px 20px' }}>{u.last_name}</td>
                          <td style={{ padding: '12px 20px' }}>{u.first_name}</td>
                          <td style={{ padding: '12px 20px' }}>{u.email}</td>
                          <td style={{ padding: '12px 20px' }}>{u.account_type}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: ACTIVITY LOG */}
<div className="dashboard-right-col">
  <div className="box-card">
    <div className="box-header">
      <div className="header-content">
        <h2 className="box-title">Activity Log</h2>
        <span className="box-badge">Recent</span>
      </div>
      <button className="box-action-btn">View All</button>
    </div>
    <div className="box-body">
      <ActivityLog />
    </div>
  </div>
</div>

        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;
