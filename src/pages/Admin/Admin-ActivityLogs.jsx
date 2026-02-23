import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import supabase from "../../config/supabaseClient";
import "./Style/Dashboard.css"; // Reuse dashboard styles for container

const AdminActivityLogs = () => {
    const navigate = useNavigate();
    const { darkMode } = useApp();
    const [user, setUser] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

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
        <div className="dashboard-content" style={{ padding: '40px 50px' }}>
            <div className="header-row" style={{ marginBottom: "24px" }}>
                <div>
                    <h1 className="title" style={{ fontSize: "28px", fontWeight: "700", color: "#333" }}>Activity Logs</h1>
                    <p className="subtitle" style={{ color: "#666" }}>Track system changes and user actions</p>
                </div>
            </div>

            <div className="content-container animate-spring delay-2" style={{
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                padding: "24px",
                border: "1px solid rgba(0,0,0,0.05)"
            }}>
                <div className="container-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#333", margin: 0 }}>System Activities (Last 100)</h2>
                    <button className="btn-secondary" onClick={fetchLogs} title="Refresh Logs" style={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        fontWeight: "500"
                    }}>
                        <i className="fa-solid fa-rotate-right"></i> Refresh
                    </button>
                </div>
                <div className="container-body" style={{ padding: 0 }}>
                    <table className="admin-user-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: "600" }}>Date & Time</th>
                                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: "600" }}>User</th>
                                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: "600" }}>Action</th>
                                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b', fontWeight: "600" }}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-secondary" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="4" className="text-secondary" style={{ padding: '40px', textAlign: 'center' }}>No logs found.</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td className="text-secondary" style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                                            {formatDate(log.created_at)}
                                        </td>
                                        <td className="text-secondary" style={{ padding: '16px 20px' }}>
                                            {log.profiles ? (
                                                <div>
                                                    <div style={{ fontWeight: '600' }} className="text-primary">{log.profiles.first_name} {log.profiles.last_name}</div>
                                                    <div style={{ fontSize: '11px' }} className="text-dim">{log.profiles.account_type}</div>
                                                </div>
                                            ) : <span className="text-muted">System/Unknown</span>}
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <span className={`action-badge ${log.action?.includes('CREATE') ? 'action-badge-success' :
                                                    log.action?.includes('UPDATE') || log.action?.includes('CHANGE') ? 'action-badge-info' :
                                                        log.action?.includes('DELETE') ? 'action-badge-danger' : 'action-badge-default'
                                                }`}>
                                                {getActionLabel(log.action)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: '14px' }} className="text-primary">
                                            {log.details}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminActivityLogs;
