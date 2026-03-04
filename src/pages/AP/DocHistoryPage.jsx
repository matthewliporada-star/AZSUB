import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

const DocHistoryPage = () => {
    const { monitoringData, loadMonitoringData, currentUser, darkMode } = useApp();
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingSearchTerm, setPendingSearchTerm] = useState('');
    const [expandedCardId, setExpandedCardId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, status: null });

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        loadMonitoringData();
    }, []);

    // [UPDATE] Admin check
    const isAdmin = currentUser?.role?.toLowerCase() === 'admin' || currentUser?.account_type?.toLowerCase() === 'admin';

    // Filter Logic
    const submissions = monitoringData.filter(item => {
        // Restrict to current user's transactions only, unless Admin
        if (!isAdmin && currentUser?.id && item.profile_id !== currentUser.id) return false;

        const hasDocuments = item.form_type;
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

        let matchesSearch = true;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const name = (item.client_name || item.client_first_name || '').toLowerCase();
            const serial = String(item.serial_number || '').toLowerCase();
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

    const executeUpdateStatus = async () => {
        const { id, status: newStatus } = confirmModal;
        if (!id) return;

        setConfirmModal({ isOpen: false, id: null, status: null });

        try {
            console.log(`Updating submission ${id} to ${newStatus}`);
            const res = await api.updateSubmissionStatus(id, newStatus);

            if (res.success) {
                alert(`Successfully marked as ${newStatus}! ✓`);
                await loadMonitoringData();
            } else {
                alert(`Error: ${res.message || 'Failed to update status'}`);
            }
        } catch (error) {
            console.error('Update status error:', error);
            alert('Failed to connect to server. Please try again.');
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
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder="Search client, serial, or policy..."
                                value={pendingSearchTerm}
                                onChange={(e) => setPendingSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setSearchTerm(pendingSearchTerm);
                                        setCurrentPage(1);
                                    }
                                }}
                                style={{
                                    padding: '9px 14px',
                                    borderRadius: '8px 0 0 8px',
                                    border: darkMode ? '2px solid #395998' : '2px solid #d0d5dd',
                                    borderRight: 'none',
                                    width: '240px',
                                    fontSize: '14px',
                                    transition: 'border-color 0.3s',
                                    background: darkMode ? '#0d1117' : 'white',
                                    color: darkMode ? '#FFFDFE' : '#333',
                                    height: '40px',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#395998';
                                    e.target.parentElement.querySelector('button').style.borderColor = '#395998';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = darkMode ? '#395998' : '#d0d5dd';
                                    e.target.parentElement.querySelector('button').style.borderColor = darkMode ? '#395998' : '#d0d5dd';
                                }}
                            />
                            <button
                                onClick={() => { setSearchTerm(pendingSearchTerm); setCurrentPage(1); }}
                                style={{
                                    padding: '0 16px',
                                    background: '#395998',
                                    color: '#FFFDFE',
                                    border: '2px solid #395998',
                                    borderRadius: '0 8px 8px 0',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    height: '40px',
                                    boxSizing: 'border-box',
                                    whiteSpace: 'nowrap'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#2d4a80';
                                    e.currentTarget.style.borderColor = '#2d4a80';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#395998';
                                    e.currentTarget.style.borderColor = '#395998';
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                Search
                            </button>
                        </div>
                        {searchTerm && (
                            <button
                                onClick={() => { setPendingSearchTerm(''); setSearchTerm(''); setCurrentPage(1); }}
                                style={{
                                    padding: '0 14px',
                                    background: darkMode ? '#374151' : '#f3f4f6',
                                    color: darkMode ? '#e2e8f0' : '#6b7280',
                                    border: darkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    height: '40px',
                                    boxSizing: 'border-box'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = darkMode ? '#4b5563' : '#e5e7eb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = darkMode ? '#374151' : '#f3f4f6';
                                }}
                            >
                                ✕ Clear
                            </button>
                        )}
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="monitoring-select"
                            style={{
                                fontWeight: '600',
                                minWidth: '180px',
                                height: '40px'
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
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {currentItems.map(item => {
                                const statusStyle = getStatusStyle(item.status || 'Pending');
                                const status = item.status || 'Pending';

                                return (
                                    <div
                                        key={item.id}
                                        className="history-card"
                                        style={{
                                            borderLeft: 'none',
                                            overflow: 'hidden',
                                            position: 'relative',
                                            cursor: status === 'Pending' ? 'pointer' : 'default'
                                        }}
                                        onClick={() => {
                                            if (status === 'Pending') {
                                                setExpandedCardId(expandedCardId === item.id ? null : item.id);
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        {/* Card Header — Name, Date, Status all in one row */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '16px',
                                            paddingBottom: '14px',
                                            borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#f0f0f0'}`
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                {/* Avatar circle */}
                                                <div style={{
                                                    width: '42px',
                                                    height: '42px',
                                                    borderRadius: '50%',
                                                    background: darkMode ? '#395998' : '#e8eef6',
                                                    color: darkMode ? '#FFFDFE' : '#395998',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '16px',
                                                    fontWeight: '700',
                                                    flexShrink: 0
                                                }}>
                                                    {(item.client_name || item.client_first_name || '?')[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{
                                                        fontSize: '16px',
                                                        fontWeight: '700',
                                                        color: darkMode ? '#e2e8f0' : '#1a1a2e',
                                                        lineHeight: 1.3
                                                    }}>
                                                        {item.client_name || `${item.client_first_name} ${item.client_last_name}`}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: darkMode ? '#64748b' : '#8f9bb3',
                                                        marginTop: '2px'
                                                    }}>
                                                        {new Date(item.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 14px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                color: statusStyle.color,
                                                background: statusStyle.bg,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {statusStyle.icon} {status}
                                            </span>
                                        </div>

                                        {/* Info Row — compact horizontal layout */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                            gap: '12px',
                                            marginBottom: status === 'Pending' ? '16px' : '0'
                                        }}>
                                            <div style={{
                                                padding: '10px 14px',
                                                background: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                borderRadius: '8px'
                                            }}>
                                                <div style={{
                                                    fontSize: '10px',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: darkMode ? '#64748b' : '#8f9bb3',
                                                    marginBottom: '4px'
                                                }}>Serial Number</div>
                                                <div style={{
                                                    fontFamily: 'monospace',
                                                    fontWeight: '700',
                                                    fontSize: '14px',
                                                    color: darkMode ? '#60a5fa' : '#395998'
                                                }}>{item.serial_number}</div>
                                            </div>
                                            <div style={{
                                                padding: '10px 14px',
                                                background: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                borderRadius: '8px'
                                            }}>
                                                <div style={{
                                                    fontSize: '10px',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: darkMode ? '#64748b' : '#8f9bb3',
                                                    marginBottom: '4px'
                                                }}>Policy Type</div>
                                                <div style={{
                                                    fontWeight: '600',
                                                    fontSize: '13px',
                                                    color: darkMode ? '#e2e8f0' : '#1a1a2e'
                                                }}>{item.policy_type}</div>
                                            </div>
                                            <div style={{
                                                padding: '10px 14px',
                                                background: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                borderRadius: '8px'
                                            }}>
                                                <div style={{
                                                    fontSize: '10px',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: darkMode ? '#64748b' : '#8f9bb3',
                                                    marginBottom: '4px'
                                                }}>Agency</div>
                                                <div style={{
                                                    fontWeight: '600',
                                                    fontSize: '13px',
                                                    color: darkMode ? '#e2e8f0' : '#1a1a2e'
                                                }}>{item.agency || 'N/A'}</div>
                                            </div>
                                            <div style={{
                                                padding: '10px 14px',
                                                background: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                borderRadius: '8px'
                                            }}>
                                                <div style={{
                                                    fontSize: '10px',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: darkMode ? '#64748b' : '#8f9bb3',
                                                    marginBottom: '4px'
                                                }}>Form Type</div>
                                                <div style={{
                                                    fontWeight: '600',
                                                    fontSize: '13px',
                                                    color: darkMode ? '#e2e8f0' : '#1a1a2e'
                                                }}>{item.form_type}</div>
                                            </div>
                                            <div style={{
                                                padding: '10px 14px',
                                                background: darkMode ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                                                borderRadius: '8px'
                                            }}>
                                                <div style={{
                                                    fontSize: '10px',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: darkMode ? '#64748b' : '#8f9bb3',
                                                    marginBottom: '4px'
                                                }}>Payment Mode</div>
                                                <div style={{
                                                    fontWeight: '600',
                                                    fontSize: '13px',
                                                    color: darkMode ? '#e2e8f0' : '#1a1a2e'
                                                }}>{item.mode_of_payment || 'N/A'}</div>
                                            </div>
                                        </div>

                                        {/* Action Buttons (Only for Pending) — flat design */}
                                        {status === 'Pending' && expandedCardId === item.id && (
                                            <div style={{
                                                display: 'flex',
                                                gap: '10px',
                                                paddingTop: '14px',
                                                borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.06)' : '#f0f0f0'}`
                                            }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, id: item.id, status: 'Issued' }); }}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px 20px',
                                                        background: '#16a34a',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '13px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#15803d';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#16a34a';
                                                    }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                    Issue Policy
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: true, id: item.id, status: 'Declined' }); }}
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px 20px',
                                                        background: '#dc2626',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        fontSize: '13px',
                                                        fontWeight: '700',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#b91c1c';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = '#dc2626';
                                                    }}
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                    Decline
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

            {/* Custom Confirmation Modal */}
            {confirmModal.isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    animation: 'fadeIn 0.2s ease-out'
                }} onClick={(e) => { e.stopPropagation(); setConfirmModal({ isOpen: false, id: null, status: null }); }}>
                    <div style={{
                        background: darkMode ? '#1e293b' : 'white',
                        padding: '30px',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        transform: 'translateY(0)',
                        animation: 'slideUp 0.2s ease-out',
                        textAlign: 'center'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: confirmModal.status === 'Issued' ? (darkMode ? '#14532d' : '#dcfce7') : (darkMode ? '#7f1d1d' : '#fee2e2'),
                            color: confirmModal.status === 'Issued' ? '#16a34a' : '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px auto'
                        }}>
                            {confirmModal.status === 'Issued' ? (
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </div>
                        <h3 style={{ margin: '0 0 10px 0', color: darkMode ? '#FFFDFE' : '#1e293b', fontSize: '18px' }}>
                            Confirm Action
                        </h3>
                        <p style={{ margin: '0 0 24px 0', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '15px' }}>
                            Are you sure you want to mark this submission as <strong>{confirmModal.status}</strong>?
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, id: null, status: null })}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: darkMode ? '1px solid #475569' : '1px solid #cbd5e1',
                                    background: darkMode ? '#334155' : 'white',
                                    color: darkMode ? '#e2e8f0' : '#475569',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    flex: 1
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeUpdateStatus}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: confirmModal.status === 'Issued' ? '#16a34a' : '#ef4444',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    flex: 1
                                }}
                            >
                                Yes, Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocHistoryPage;