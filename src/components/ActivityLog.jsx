import { useEffect, useState } from "react";
import supabase from "../config/supabaseClient";
import "../pages/Admin/Style/Dashboard.css"; // Ensure styles are available

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    // Listen for new logs
    useEffect(() => {
        const channel = supabase
            .channel("public:activity_logs")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "activity_logs" },
                (payload) => {
                    setLogs((prevLogs) => [payload.new, ...prevLogs]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from("activity_logs")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(10); // Limit to last 10 activities

            if (error) {
                console.error("Error fetching activity logs:", error.message);
            } else {
                setLogs(data || []);
            }
        } catch (err) {
            console.error("Unexpected error fetching logs:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
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

    if (loading) {
        return <div style={{ fontSize: "14px", color: "#666", padding: "20px" }}>Loading activities...</div>;
    }

    if (logs.length === 0) {
        return (
            <div style={{ fontSize: "14px", color: "#666", padding: "20px", textAlign: "center" }}>
                No recent activity found.
            </div>
        );
    }

    return (
        <div className="activity-log-timeline">
            {logs.map((log) => (
                <div key={log.id} className="activity-item">
                    <div className="activity-header">
                        <span className="activity-date">{formatDate(log.created_at)}</span>
                    </div>
                    <div className="activity-content">
                        <span className="activity-action" style={{ fontWeight: '600', color: '#003266' }}>
                            {getActionLabel(log.action)}:
                        </span>
                        <span style={{ marginLeft: '5px', color: '#555' }}>
                            {log.details}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityLog;
