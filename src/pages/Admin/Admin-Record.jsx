import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import supabase from "../../config/supabaseClient";
import "./Style/Record.css";

const AdminRecord = () => {
    const navigate = useNavigate();
    const { darkMode } = useApp();
    const [user, setUser] = useState(null);
    const [records, setRecords] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [viewMode, setViewMode] = useState('active'); // 'active', 'archived', 'all'
    const [formData, setFormData] = useState({
        policy_id: '',
        client_name: '',
        serial_number: '',
        intermediary: '',
        intermediary_email: '',
        submission_type: '',
        agency: '',
        date_submitted: '',
        date_processed: '',
        date_issued: '',
        is_archived: false
    });
    const [stats, setStats] = useState({
        totalRecords: 0,
        uniqueClients: 0,
        recentSubmissions: 0,
        pendingProcessing: 0
    });

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert("Please login first");
            navigate("/");
            return;
        }

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
        fetchPolicies();
        fetchRecords();
    };

    const fetchPolicies = async () => {
        try {
            const { data, error } = await supabase
                .from("policy")
                .select("*")
                .eq("active_status", true)
                .order("policy_name");

            if (error) throw error;
            setPolicies(data || []);
        } catch (err) {
            console.error("Error fetching policies:", err);
        }
    };

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const { data: recordsData, error: recordsError } = await supabase
                .from("record")
                .select("*")
                .order("date_submitted", { ascending: false });

            if (recordsError) throw recordsError;

            console.log("Records fetched:", recordsData);

            if (recordsData && recordsData.length > 0) {
                const policyIds = [...new Set(recordsData
                    .map(r => r.policy_id)
                    .filter(id => id != null))];

                let policyMap = {};

                if (policyIds.length > 0) {
                    const { data: policiesData, error: policiesError } = await supabase
                        .from("policy")
                        .select("*")
                        .in("policy_id", policyIds);

                    if (policiesError) throw policiesError;

                    policiesData.forEach(p => {
                        policyMap[p.policy_id] = p;
                    });
                }

                const enrichedRecords = recordsData.map(record => ({
                    ...record,
                    policy: record.policy_id ? policyMap[record.policy_id] : null
                }));

                setRecords(enrichedRecords);
                calculateStats(enrichedRecords);
            } else {
                setRecords([]);
                calculateStats([]);
            }
        } catch (err) {
            console.error("Error fetching records:", err);
            alert("Error fetching records: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const activeRecords = data.filter(record => !record.is_archived);
        
        const uniqueClients = new Set(activeRecords.map(record => record.client_name)).size;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentSubmissions = activeRecords.filter(record =>
            record.date_submitted && new Date(record.date_submitted) >= thirtyDaysAgo
        ).length;

        const pendingProcessing = activeRecords.filter(record =>
            !record.date_processed && !record.is_archived
        ).length;

        setStats({
            totalRecords: activeRecords.length,
            uniqueClients,
            recentSubmissions,
            pendingProcessing
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePolicyChange = (e) => {
        const policyId = e.target.value;
        setFormData(prev => ({
            ...prev,
            policy_id: policyId
        }));

        const policy = policies.find(p => p.policy_id === parseInt(policyId));
        setSelectedPolicy(policy);
    };

    const openCreateModal = () => {
        setEditingRecord(null);
        setSelectedPolicy(null);
        setFormData({
            policy_id: '',
            client_name: '',
            serial_number: '',
            intermediary: '',
            intermediary_email: '',
            submission_type: '',
            agency: '',
            date_submitted: '',
            date_processed: '',
            date_issued: '',
            is_archived: false
        });
        setShowModal(true);
    };

    const openEditModal = (record) => {
        setEditingRecord(record);
        setSelectedPolicy(record.policy);
        setFormData({
            policy_id: record.policy_id || '',
            client_name: record.client_name || '',
            serial_number: record.serial_number || '',
            intermediary: record.intermediary || '',
            intermediary_email: record.intermediary_email || '',
            submission_type: record.submission_type || '',
            agency: record.agency || '',
            date_submitted: record.date_submitted || '',
            date_processed: record.date_processed || '',
            date_issued: record.date_issued || '',
            is_archived: record.is_archived || false
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!formData.client_name || !formData.policy_id) {
                alert("Client Name and Policy are required");
                setLoading(false);
                return;
            }

            if (editingRecord) {
                const { error } = await supabase
                    .from("record")
                    .update({
                        policy_id: formData.policy_id,
                        client_name: formData.client_name,
                        serial_number: formData.serial_number ? parseInt(formData.serial_number) : null,
                        intermediary: formData.intermediary,
                        intermediary_email: formData.intermediary_email,
                        submission_type: formData.submission_type,
                        agency: formData.agency,
                        date_submitted: formData.date_submitted || null,
                        date_processed: formData.date_processed || null,
                        date_issued: formData.date_issued || null,
                        is_archived: formData.is_archived,
                        updated_at: new Date()
                    })
                    .eq('id', editingRecord.id);

                if (error) throw error;

                await supabase
                    .from("activity_logs")
                    .insert([{
                        action: 'POLICY_UPDATE',
                        performed_by: user.id,
                        details: `Updated record for ${formData.client_name}`,
                        created_at: new Date()
                    }]);

            } else {
                const { data, error } = await supabase
                    .from("record")
                    .insert([{
                        policy_id: formData.policy_id,
                        client_name: formData.client_name,
                        serial_number: formData.serial_number ? parseInt(formData.serial_number) : null,
                        intermediary: formData.intermediary,
                        intermediary_email: formData.intermediary_email,
                        submission_type: formData.submission_type,
                        agency: formData.agency,
                        date_submitted: formData.date_submitted || null,
                        date_processed: formData.date_processed || null,
                        date_issued: formData.date_issued || null,
                        is_archived: false
                    }])
                    .select();

                if (error) throw error;

                await supabase
                    .from("activity_logs")
                    .insert([{
                        action: 'POLICY_CREATE',
                        performed_by: user.id,
                        details: `Created new record for ${formData.client_name}`,
                        created_at: new Date()
                    }]);
            }

            await fetchRecords();
            setShowModal(false);
            alert(`Record ${editingRecord ? 'updated' : 'created'} successfully!`);
        } catch (err) {
            console.error("Error saving record:", err);
            alert("Error saving record: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async (id, clientName, currentArchiveStatus) => {
        const action = currentArchiveStatus ? "restore" : "archive";
        if (!window.confirm(`Are you sure you want to ${action} the record for ${clientName}?`)) {
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from("record")
                .update({ 
                    is_archived: !currentArchiveStatus,
                    updated_at: new Date()
                })
                .eq('id', id);

            if (error) throw error;

            await supabase
                .from("activity_logs")
                .insert([{
                    action: currentArchiveStatus ? 'POLICY_RESTORE' : 'POLICY_ARCHIVE',
                    performed_by: user.id,
                    details: `${currentArchiveStatus ? 'Restored' : 'Archived'} record for ${clientName}`,
                    created_at: new Date()
                }]);

            await fetchRecords();
            alert(`Record ${currentArchiveStatus ? 'restored' : 'archived'} successfully!`);
        } catch (err) {
            console.error("Error archiving record:", err);
            alert("Error archiving record: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const options = { year: "numeric", month: "short", day: "numeric" };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    const getStatusBadge = (record) => {
        if (record.is_archived) {
            return <span className="status-badge status-archived">Archived</span>;
        } else if (record.date_issued) {
            return <span className="status-badge status-issued">Issued</span>;
        } else if (record.date_processed) {
            return <span className="status-badge status-processed">Processed</span>;
        } else if (record.date_submitted) {
            return <span className="status-badge status-submitted">Submitted</span>;
        }
        return <span className="status-badge status-draft">Draft</span>;
    };

    // Truncate long client names
    const truncateName = (name, maxLength = 25) => {
        if (!name) return '—';
        return name.length > maxLength ? name.substring(0, maxLength) + '…' : name;
    };

    // Filter records based on view mode
    const getFilteredRecords = () => {
        if (viewMode === 'active') {
            return records.filter(record => !record.is_archived);
        } else if (viewMode === 'archived') {
            return records.filter(record => record.is_archived);
        }
        return records; // 'all' view
    };

    const filteredRecords = getFilteredRecords();

    return (
        <div className="dashboard-content">
            <div className="header-row">
                <div>
                    <h1 className="title">Insurance Records</h1>
                    <p className="subtitle">Manage and track all policy records</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="cards-grid">
                <div className="card stats-card">
                    <div className="card-icon blue-bg">
                        <i className="fa-solid fa-file-lines"></i>
                    </div>
                    <div className="card-info">
                        <h3 className="card-title">Total Records</h3>
                        <p className="card-number">{stats.totalRecords}</p>
                    </div>
                </div>

                <div className="card stats-card">
                    <div className="card-icon indigo-bg">
                        <i className="fa-solid fa-users"></i>
                    </div>
                    <div className="card-info">
                        <h3 className="card-title">Unique Clients</h3>
                        <p className="card-number">{stats.uniqueClients}</p>
                    </div>
                </div>

                <div className="card stats-card">
                    <div className="card-icon green-bg">
                        <i className="fa-solid fa-calendar-check"></i>
                    </div>
                    <div className="card-info">
                        <h3 className="card-title">Recent Submissions</h3>
                        <p className="card-number">{stats.recentSubmissions}</p>
                    </div>
                </div>

                <div className="card stats-card">
                    <div className="card-icon orange-bg">
                        <i className="fa-solid fa-clock"></i>
                    </div>
                    <div className="card-info">
                        <h3 className="card-title">Pending Processing</h3>
                        <p className="card-number">{stats.pendingProcessing}</p>
                    </div>
                </div>
            </div>

            <div className="content-container">
                <div className="container-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", background: "transparent", borderBottom: "none", padding: "20px 0 10px 0" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#333", margin: 0 }}>
                        <i className="fa-solid fa-database" style={{ marginRight: '8px' }}></i>
                        {viewMode === 'active' ? 'Active Policy Records' : 
                         viewMode === 'archived' ? 'Archived Records' : 'All Records'} 
                        ({filteredRecords.length} total)
                    </h2>
                    <div className="header-actions">
                        <button className="btn-secondary" onClick={fetchRecords}>
                            <i className="fa-solid fa-rotate-right"></i> Refresh
                        </button>
                        <button 
                            className={`btn-archive ${viewMode === 'archived' ? 'active' : ''}`} 
                            onClick={() => setViewMode(viewMode === 'archived' ? 'active' : 'archived')}
                        >
                            <i className={`fa-solid ${viewMode === 'archived' ? 'fa-file-lines' : 'fa-archive'}`}></i> 
                            {viewMode === 'archived' ? 'Policy Record' : 'Archived'}
                        </button>
                        <button className="btn-primary" onClick={openCreateModal}>
                            <i className="fa-solid fa-plus"></i> New Record
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="admin-user-table records-table">
                        <thead>
                            <tr>
                                <th className="id-col">ID</th>
                                <th className="client-col">Client Name</th>
                                <th className="policy-col">Policy</th>
                                <th className="policy-type-col">Policy Type</th>
                                <th className="submission-col">Submission</th>
                                <th className="serial-col">Serial #</th>
                                <th className="intermediary-col">Intermediary</th>
                                <th className="email-col">Email</th>
                                <th className="agency-col">Agency</th>
                                <th className="date-col">Submitted</th>
                                <th className="date-col">Processed</th>
                                <th className="date-col">Issued</th>
                                <th className="status-col">Status</th>
                                <th className="actions-col">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="14" className="loading-cell">
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        Loading records...
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="14" className="empty-cell">
                                        <i className="fa-solid fa-inbox"></i>
                                        {viewMode === 'active' ? 'No active records found.' : 
                                         viewMode === 'archived' ? 'No archived records found.' : 
                                         'No records found.'} Click "New Record" to add one.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.id} className={record.is_archived ? 'archived-row' : ''}>
                                        <td className="record-id">#{record.id}</td>
                                        <td className="client-cell" title={record.client_name}>
                                            <div className="client-name">{truncateName(record.client_name)}</div>
                                        </td>
                                        <td className="policy-cell" title={record.policy?.policy_name}>
                                            {record.policy ? (
                                                <span className="policy-name-badge">
                                                    {truncateName(record.policy.policy_name, 20)}
                                                </span>
                                            ) : (
                                                <span className="no-policy">—</span>
                                            )}
                                        </td>
                                        <td className="policy-type-cell">
                                            {record.policy ? (
                                                <span className="policy-type-badge">
                                                    {truncateName(record.policy.policy_type, 15)}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="submission-cell">
                                            {record.submission_type ? (
                                                <span className={`submission-badge ${record.submission_type.toLowerCase()}`}>
                                                    {record.submission_type}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="serial-cell">{record.serial_number || '—'}</td>
                                        <td className="intermediary-cell" title={record.intermediary}>
                                            {record.intermediary ? truncateName(record.intermediary, 15) : '—'}
                                        </td>
                                        <td className="email-cell" title={record.intermediary_email}>
                                            {record.intermediary_email ? truncateName(record.intermediary_email, 20) : '—'}
                                        </td>
                                        <td className="agency-cell" title={record.agency}>
                                            {record.agency ? truncateName(record.agency, 15) : '—'}
                                        </td>
                                        <td className="date-cell">{formatDate(record.date_submitted)}</td>
                                        <td className="date-cell">{formatDate(record.date_processed)}</td>
                                        <td className="date-cell">{formatDate(record.date_issued)}</td>
                                        <td className="status-cell">{getStatusBadge(record)}</td>
                                        <td className="actions-cell">
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => openEditModal(record)}
                                                    className="edit-btn"
                                                    title="Edit Record"
                                                >
                                                    <i className="fa-solid fa-edit"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(record.id, record.client_name, record.is_archived)}
                                                    className={record.is_archived ? "restore-btn" : "archive-btn"}
                                                    title={record.is_archived ? "Restore Record" : "Archive Record"}
                                                >
                                                    <i className={`fa-solid ${record.is_archived ? 'fa-box-open' : 'fa-box-archive'}`}></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className={`modal-content ${darkMode ? 'dark-mode' : ''}`} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingRecord ? 'Edit Record' : 'Create New Record'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-form-grid">
                                <div className="form-group full-width">
                                    <label>Client Name <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="client_name"
                                        value={formData.client_name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter client full name"
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Select Policy <span className="required">*</span></label>
                                    <select
                                        name="policy_id"
                                        value={formData.policy_id}
                                        onChange={handlePolicyChange}
                                        required
                                    >
                                        <option value="">Select a Policy</option>
                                        {policies.map((policy) => (
                                            <option key={policy.policy_id} value={policy.policy_id}>
                                                {policy.policy_name} ({policy.policy_type})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedPolicy && (
                                    <div className="policy-details full-width">
                                        <div className="policy-detail-item">
                                            <span className="detail-label">Policy Type</span>
                                            <span className="detail-value">{selectedPolicy.policy_type}</span>
                                        </div>
                                        <div className="policy-detail-item">
                                            <span className="detail-label">Form Type</span>
                                            <span className="detail-value">{selectedPolicy.form_type}</span>
                                        </div>
                                        <div className="policy-detail-item">
                                            <span className="detail-label">Request Type</span>
                                            <span className="detail-value">{selectedPolicy.request_type}</span>
                                        </div>
                                        <div className="policy-detail-item">
                                            <span className="detail-label">Agency</span>
                                            <span className="detail-value">{selectedPolicy.agency}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="form-group full-width">
                                    <label>Submission Type</label>
                                    <select
                                        name="submission_type"
                                        value={formData.submission_type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Submission Type</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Email">Email</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Serial Number</label>
                                    <input
                                        type="number"
                                        name="serial_number"
                                        value={formData.serial_number}
                                        onChange={handleInputChange}
                                        placeholder="Enter serial number"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Agency</label>
                                    <input
                                        type="text"
                                        name="agency"
                                        value={formData.agency}
                                        onChange={handleInputChange}
                                        placeholder="Enter agency name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Intermediary</label>
                                    <input
                                        type="text"
                                        name="intermediary"
                                        value={formData.intermediary}
                                        onChange={handleInputChange}
                                        placeholder="Enter intermediary name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Intermediary Email</label>
                                    <input
                                        type="email"
                                        name="intermediary_email"
                                        value={formData.intermediary_email}
                                        onChange={handleInputChange}
                                        placeholder="Enter email address"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Date Submitted</label>
                                    <input
                                        type="date"
                                        name="date_submitted"
                                        value={formatDateForInput(formData.date_submitted)}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Date Processed</label>
                                    <input
                                        type="date"
                                        name="date_processed"
                                        value={formatDateForInput(formData.date_processed)}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Date Issued</label>
                                    <input
                                        type="date"
                                        name="date_issued"
                                        value={formatDateForInput(formData.date_issued)}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                {editingRecord && (
                                    <div className="form-group full-width">
                                        <label>
                                            <input
                                                type="checkbox"
                                                name="is_archived"
                                                checked={formData.is_archived}
                                                onChange={(e) => setFormData(prev => ({ ...prev, is_archived: e.target.checked }))}
                                            />
                                            <span style={{ marginLeft: '8px' }}>Mark as Archived</span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Saving...' : (editingRecord ? 'Update Record' : 'Create Record')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRecord;