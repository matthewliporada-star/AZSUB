import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

const DocHistoryPage = () => {
    const { monitoringData, loadMonitoringData, currentUser, darkMode } = useApp();
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        loadMonitoringData();
    }, []);

    // Filter Logic
    const submissions = monitoringData.filter(item => {
        // [UPDATE] Restrict to current user's transactions only
        if (currentUser?.id && item.profile_id !== currentUser.id) return false;

        const hasDocuments = item.form_type;
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

        let matchesSearch = true;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const name = (item.client_name || item.client_first_name || '').toLowerCase();
            const serial = (item.serial_number || '').toLowerCase();
            const policy = (item.policy_type || '').toLowerCase();
            matchesSearch = name.includes(term) || serial.includes(term) || policy.includes(term);
        }

        return hasDocuments && matchesStatus && matchesSearch;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // --- PAGINATION CALCULATIONS ---
    const totalPages = Math.ceil(submissions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = submissions.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const updateStatus = async (id, newStatus) => {
        if (!confirm(`Mark this submission as ${newStatus}?`)) return;
        try {
            const res = await api.updateSubmissionStatus(id, newStatus);
            if (res.success) {
                alert('Status Updated Successfully! ✓');
                loadMonitoringData();
            }
        } catch (error) {
            alert('Error updating status');
        }
    };

    // Get status styling
    const getStatusStyle = (status) => {
        const styles = {
            'Pending': {
                color: darkMode ? '#e2e8f0' : '#1e3a8a',
                bg: darkMode ? '#334155' : '#e0f2fe',
                border: darkMode ? '#334155' : '#3b82f6',
                icon: '⏱'
            },
            'Issued': {
                color: darkMode ? '#FFFDFE' : '#155724',
                bg: darkMode ? '#395998' : '#d4edda',
                border: darkMode ? '#395998' : '#28a745',
                icon: '✓'
            },
            'Declined': {
                color: darkMode ? '#FFFDFE' : '#721c24',
                bg: darkMode ? '#E1942D' : '#f8d7da',
                border: darkMode ? '#E1942D' : '#dc3545',
                icon: '✕'
            }
        };
        return styles[status] || styles['Pending'];
    };

    // Count by status
    const statusCounts = {
        All: submissions.length,
        Pending: submissions.filter(s => s.status === 'Pending').length,
        Issued: submissions.filter(s => s.status === 'Issued').length,
        Declined: submissions.filter(s => s.status === 'Declined').length
    };

    return (
        <div className="content-container animate-spring">
            <div style={{ marginBottom: '24px', borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : '#eaecf0'}`, paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h2 style={{ margin: '0 0 6px 0', color: darkMode ? '#FFFDFE' : '#101828', fontWeight: '700' }}>Document Submission History</h2>
                        <p style={{ margin: 0, fontSize: '14px', color: darkMode ? '#94a3b8' : '#667085' }}>
                            Review and manage all document submissions
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder="Search client, serial, or policy..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="monitoring-input"
                            style={{
                                width: '300px',
                                background: darkMode ? '#0d1117' : 'white'
                            }}
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="monitoring-select"
                            style={{
                                fontWeight: '600',
                                minWidth: '180px'
                            }}
                        >
                            <option value="All">All Statuses ({statusCounts.All})</option>
                            <option value="Pending">⏱ Pending ({statusCounts.Pending})</option>
                            <option value="Issued">✓ Issued ({statusCounts.Issued})</option>
                            <option value="Declined">✕ Declined ({statusCounts.Declined})</option>
                        </select>
                    </div>
                </div>
            </div>
            <div>
                {currentItems.length === 0 ? (
                    <div className="history-empty-state" style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        borderRadius: '12px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📄</div>
                        <h3 style={{ color: darkMode ? '#FFFDFE' : '#495057', marginBottom: '8px', fontWeight: '700' }}>No submissions found</h3>
                        <p style={{ margin: 0, fontSize: '14px' }}>
                            {searchTerm || statusFilter !== 'All'
                                ? 'Try adjusting your filters or search terms'
                                : 'Document submissions will appear here once created'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {currentItems.map(item => {
                                const statusStyle = getStatusStyle(item.status || 'Pending');

                                return (
                                    <div
                                        key={item.id}
                                        className="history-card"
                                        style={{ borderLeft: `5px solid ${statusStyle.border}` }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        {/* Header: Name & Status */}
                                        <div className="history-card-header">
                                            <div>
                                                <div style={{
                                                    fontSize: '20px',
                                                    fontWeight: '700',
                                                    color: darkMode ? '#e2e8f0' : '#2c3e50',
                                                    marginBottom: '6px'
                                                }}>
                                                    {item.client_name || `${item.client_first_name} ${item.client_last_name}`}
                                                </div>
                                                <div className="history-tag">
                                                    📄 Document Submission
                                                </div>
                                            </div>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '8px 18px',
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                color: statusStyle.color,
                                                background: statusStyle.bg,
                                                border: `2px solid ${statusStyle.border}`,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {statusStyle.icon} {item.status || 'Pending'}
                                            </span>
                                        </div>

                                        {/* Body: Information Grid */}
                                        <div className="history-info-grid" style={{ marginBottom: item.status === 'Pending' ? '20px' : '0' }}>
                                            <div>
                                                <div className="history-label" style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Serial Number</div>
                                                <div className="history-serial-tag">
                                                    {item.serial_number}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="history-label" style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Policy Type</div>
                                                <div className="history-value" style={{ fontWeight: '700', fontSize: '15px' }}>{item.policy_type}</div>
                                            </div>
                                            <div>
                                                <div className="history-label" style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Submission Date</div>
                                                <div className="history-value" style={{ fontSize: '14px' }}>
                                                    {new Date(item.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="history-label" style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Agency</div>
                                                <div className="history-value" style={{ fontSize: '14px', fontWeight: '600' }}>{item.agency || 'N/A'}</div>
                                            </div>
                                            <div>
                                                <div className="history-label" style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Form Type</div>
                                                <div className="history-serial-tag" style={{ fontSize: '13px', padding: '4px 10px' }}>{item.form_type}</div>
                                            </div>
                                            <div>
                                                <div className="history-label" style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Payment Mode</div>
                                                <div className="history-value" style={{ fontSize: '14px' }}>{item.mode_of_payment || 'N/A'}</div>
                                            </div>
                                        </div>

                                        {/* Action Buttons (Only for Pending) */}
                                        {item.status === 'Pending' && (
                                            <div style={{
                                                display: 'flex',
                                                gap: '12px',
                                                marginTop: '20px',
                                                paddingTop: '20px',
                                                borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa'}`
                                            }}>
                                                <button
                                                    onClick={() => updateStatus(item.id, 'Issued')}
                                                    style={{
                                                        flex: 1,
                                                        padding: '12px 24px',
                                                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s',
                                                        boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.transform = 'translateY(-2px)';
                                                        e.target.style.boxShadow = '0 6px 16px rgba(40, 167, 69, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = 'translateY(0)';
                                                        e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
                                                    }}
                                                >
                                                    <span style={{ fontSize: '18px' }}>✓</span> Issue Policy
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(item.id, 'Declined')}
                                                    style={{
                                                        flex: 1,
                                                        padding: '12px 24px',
                                                        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s',
                                                        boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.transform = 'translateY(-2px)';
                                                        e.target.style.boxShadow = '0 6px 16px rgba(220, 53, 69, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.transform = 'translateY(0)';
                                                        e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                                                    }}
                                                >
                                                    <span style={{ fontSize: '18px' }}>✕</span> Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* --- ENHANCED PAGINATION CONTROLS --- */}
                        {totalPages > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '30px',
                                padding: '20px',
                                background: darkMode ? '#161B22' : '#f8f9fa',
                                borderRadius: '12px',
                                border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.05)' : '#eaecf0'}`
                            }}>
                                <div style={{ fontSize: '14px', color: darkMode ? '#94a3b8' : '#6c757d', fontWeight: 500 }}>
                                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, submissions.length)} of {submissions.length} submissions
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: currentPage === 1 ? (darkMode ? '#2a2a2a' : '#e9ecef') : '#395998',
                                            color: currentPage === 1 ? (darkMode ? '#666' : '#adb5bd') : '#FFFDFE',
                                            border: darkMode ? '1px solid #444' : 'none',
                                            borderRadius: '8px',
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            transition: 'all 0.3s',
                                            boxShadow: currentPage === 1 ? 'none' : '0 2px 4px rgba(0,85,184,0.2)',
                                            width: '140px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentPage !== 1) {
                                                e.target.style.backgroundColor = '#004494';
                                                e.target.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentPage !== 1) {
                                                e.target.style.backgroundColor = '#0055b8';
                                                e.target.style.transform = 'translateY(0)';
                                            }
                                        }}
                                    >
                                        ← Previous
                                    </button>

                                    <div style={{
                                        padding: '10px 20px',
                                        background: darkMode ? '#0d1117' : 'white',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        color: darkMode ? '#e2e8f0' : '#101828',
                                        border: `1px solid ${darkMode ? '#30363d' : '#d0d5dd'}`,
                                        minWidth: '140px',
                                        textAlign: 'center'
                                    }}>
                                        Page {currentPage} of {totalPages}
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: currentPage === totalPages ? (darkMode ? '#2a2a2a' : '#e9ecef') : '#395998',
                                            color: currentPage === totalPages ? (darkMode ? '#666' : '#adb5bd') : '#FFFDFE',
                                            border: darkMode ? '1px solid #444' : 'none',
                                            borderRadius: '8px',
                                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                            fontWeight: 600,
                                            fontSize: '14px',
                                            transition: 'all 0.3s',
                                            boxShadow: currentPage === totalPages ? 'none' : '0 2px 4px rgba(0,85,184,0.2)',
                                            width: '140px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentPage !== totalPages) {
                                                e.target.style.backgroundColor = '#004494';
                                                e.target.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentPage !== totalPages) {
                                                e.target.style.backgroundColor = '#0055b8';
                                                e.target.style.transform = 'translateY(0)';
                                            }
                                        }}
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DocHistoryPage;