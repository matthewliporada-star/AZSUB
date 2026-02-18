import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import supabase from "../../config/supabaseClient";
import "./Style/AdminLayout.css";
import "./Style/Dashboard.css"; // Reuse dashboard styles for container
import LogoImage from "../../assets/logo1.png";

const AdminActivityLogs = () => {
    const navigate = useNavigate();
    const { darkMode, toggleDarkMode } = useApp();
    const [user, setUser] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => { // Defined inside component
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert("Please login first");
            navigate("/");
            return;
        }

        // Robust role check: Try profiles table first, fallback to metadata
        let accountType = session.user.user_metadata?.account_type;

        try {
            const { data: profile, error } = await supabase
                .from("profiles")
                .select("account_type")
                .eq("id", session.user.id)
                .single();

            if (!error && profile) {
                accountType = profile.account_type;
            }
        } catch (err) {
            console.warn("Profile check failed, using metadata:", err);
        }

        if (accountType?.toLowerCase() !== "admin") {
            alert("Access denied");
            navigate("/");
            return;
        }
        setUser(session.user);
        fetchLogs();
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("activity_logs")
                .select("*, profiles:performed_by(first_name, last_name, account_type, email)")
                .order("created_at", { ascending: false })
                .limit(100);

            if (error) throw error;
            setLogs(data || []);
        } catch (err) {
            console.error("Error fetching logs:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    const getActionLabel = (action) => {
        const labels = {
            'POLICY_CREATE': 'Policy Created',
            'POLICY_UPDATE': 'Policy Updated',
            'POLICY_STATUS_CHANGE': 'Status Changed',
            'USER_LOGIN': 'User Login',
            'USER_LOGOUT': 'User Logout'
        };
        return labels[action] || action.replace(/_/g, ' ');
    };

    return (
        <div className="admin-container">
            {/* SIDEBAR */}
            <aside className={`admin-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
                <button className="admin-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <i className="fa-solid fa-bars"></i>
                </button>
                <div className="admin-sidebar-logo">
                    <img src={LogoImage} alt="Logo" className="admin-logo-img" />
                </div>
                <ul className="admin-sidebar-menu">
                    <li onClick={() => navigate("/admin/dashboard")}>
                        <i className="fa-solid fa-chart-line"></i> {sidebarOpen && <span>Dashboard</span>}
                    </li>
                    <li onClick={() => navigate("/admin/ManageUsers")}>
                        <i className="fa-solid fa-users"></i> {sidebarOpen && <span>Manage Users</span>}
                    </li>
                    <li onClick={() => navigate("/admin/policies")}>
                        <i className="fa-solid fa-file-shield"></i> {sidebarOpen && <span>Policies</span>}
                    </li>
                    <li className="active">
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
                            className="admin-dark-mode-toggle"
                            onClick={toggleDarkMode}
                            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginRight: '15px', fontSize: '18px', color: darkMode ? '#e2e8f0' : '#64748b', transition: 'color 0.3s' }}
                        >
                            <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                        </button>
                        <button className="admin-user-profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                            <div className="admin-user-avatar">
                                <i className="fa-solid fa-user"></i>
                            </div>
                            <span>{user?.user_metadata?.last_name || "User"} - Admin</span>
                        </button>
                        {showProfileMenu && (
                            <div className="admin-profile-dropdown">
                                <a onClick={() => navigate("/admin/Profile")} className="admin-dropdown-item"><i className="fa-solid fa-user"></i> Profile</a>
                                <a onClick={logout} className="admin-dropdown-item admin-logout-item"><i className="fa-solid fa-right-from-bracket"></i> Logout</a>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className={`admin-main-content ${sidebarOpen ? '' : 'expanded'}`}>
                <div className="header-row">
                    <div>
                        <h1 className="title">Activity Logs</h1>
                        <p className="subtitle">Track system changes and user actions</p>
                    </div>
                </div>

                <div className="content-container">
                    <div className="container-header">
                        <h2>System Activities (Last 100)</h2>
                        <button className="btn-secondary" onClick={fetchLogs} title="Refresh Logs">
                            <i className="fa-solid fa-rotate-right"></i> Refresh
                        </button>
                    </div>
                    <div className="container-body" style={{ padding: 0 }}>
                        <table className="admin-user-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#003266', borderBottom: '1px solid #003266' }}>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#ffffff' }}>Date & Time</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#ffffff' }}>User</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#ffffff' }}>Action</th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#ffffff' }}>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Loading...</td></tr>
                                ) : logs.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No logs found.</td></tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px 20px', whiteSpace: 'nowrap', color: '#444' }}>
                                                {formatDate(log.created_at)}
                                            </td>
                                            <td style={{ padding: '12px 20px', color: '#444' }}>
                                                {log.profiles ? (
                                                    <div>
                                                        <div style={{ fontWeight: '600' }}>{log.profiles.first_name} {log.profiles.last_name}</div>
                                                        <div style={{ fontSize: '11px', color: '#888' }}>{log.profiles.account_type}</div>
                                                    </div>
                                                ) : <span style={{ color: '#999', fontStyle: 'italic' }}>System/Unknown</span>}
                                            </td>
                                            <td style={{ padding: '12px 20px' }}>
                                                <span
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        backgroundColor:
                                                            log.action?.includes('CREATE') ? '#e6fffa' :
                                                                log.action?.includes('UPDATE') || log.action?.includes('CHANGE') ? '#ebf8ff' :
                                                                    log.action?.includes('DELETE') ? '#fff5f5' : '#f0f0f0',
                                                        color:
                                                            log.action?.includes('CREATE') ? '#234e52' :
                                                                log.action?.includes('UPDATE') || log.action?.includes('CHANGE') ? '#2c5282' :
                                                                    log.action?.includes('DELETE') ? '#c53030' : '#444'
                                                    }}
                                                >
                                                    {getActionLabel(log.action)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 20px', color: '#555' }}>
                                                {log.details}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminActivityLogs;
