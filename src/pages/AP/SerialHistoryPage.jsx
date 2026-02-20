import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const SerialHistoryPage = () => {
    const { monitoringData, loadMonitoringData, currentUser, darkMode } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingSearchTerm, setPendingSearchTerm] = useState('');

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadMonitoringData();
    }, []);

    // Filter Logic
    const filteredItems = monitoringData.filter(item => {
        // [UPDATE] Restrict to current user's transactions only
        if (currentUser?.id && item.profile_id !== currentUser.id) return false;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const name = (item.client_name || item.client_first_name || '').toLowerCase();
            const serial = String(item.serial_number || '').toLowerCase();
            return name.includes(term) || serial.includes(term);
        }
        return true;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Get status badge styling
    const getStatusBadge = (item) => {
        if (item.form_type) {
            return { text: 'Submitted', color: darkMode ? '#FFFDFE' : '#28a745', bg: darkMode ? '#395998' : '#d4edda' };
        }
        // [UPDATE] Changed text from 'Pending Docs' to 'Serial Generated'
        return { text: 'Serial Generated', color: darkMode ? '#e2e8f0' : '#1e3a8a', bg: darkMode ? '#1e293b' : '#e0f2fe' };
    };

    return (
        <div className="content-container">
            <div style={{ marginBottom: '20px', paddingBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <h2 style={{ margin: '0 0 5px 0', color: darkMode ? '#FFFDFE' : 'inherit' }}>Serial Request History</h2>
                        <p style={{ margin: 0, fontSize: '14px', color: darkMode ? '#cbd5e1' : '#6c757d' }}>
                            Track all serial number requests and their submission status
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder="Search Serial or Name..."
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
                                    background: darkMode ? '#1f2937' : 'white',
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
                        <div style={{
                            padding: '10px 15px',
                            background: darkMode ? '#0055b8' : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: darkMode ? '#FFFDFE' : '#0055b8',
                            boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : 'none'
                        }}>
                            Total: {filteredItems.length}
                        </div>
                    </div>
                </div>
            </div>
            <div>
                {currentItems.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        color: darkMode ? '#cbd5e1' : '#6c757d',
                        background: darkMode ? '#1f2937' : '#f8f9fa',
                        borderRadius: '12px',
                        border: darkMode ? '2px dashed #3b82f6' : '2px dashed #dee2e6'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
                        <h3 style={{ color: darkMode ? '#FFFDFE' : '#495057', marginBottom: '8px' }}>No serial requests found</h3>
                        <p style={{ margin: 0, fontSize: '14px', color: darkMode ? '#cbd5e1' : 'inherit' }}>
                            {searchTerm ? 'Try adjusting your search terms' : 'Serial requests will appear here once created'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="serial-table" style={{ minWidth: '800px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '15%' }}>Serial Number</th>
                                        <th style={{ width: '25%' }}>Client Name</th>
                                        <th style={{ width: '25%' }}>Policy Type</th>
                                        <th style={{ width: '15%' }}>Date Generated</th>
                                        <th style={{ width: '20%', textAlign: 'center' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map(item => {
                                        const status = getStatusBadge(item);
                                        return (
                                            <tr key={item.id} style={{ transition: 'all 0.2s' }}>
                                                <td>
                                                    <div style={{
                                                        fontFamily: 'monospace',
                                                        fontWeight: 700,
                                                        color: darkMode ? '#FFFDFE' : '#003781',
                                                        fontSize: '15px',
                                                        background: darkMode ? '#395998' : '#e3f2fd',
                                                        padding: '6px 10px',
                                                        borderRadius: '6px',
                                                        display: 'inline-block'
                                                    }}>
                                                        {item.serial_number}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 600, color: darkMode ? '#FFFDFE' : '#2c3e50', marginBottom: '2px' }}>
                                                        {item.client_name || `${item.client_first_name} ${item.client_last_name}`}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ color: darkMode ? '#FFFDFE' : '#495057' }}>
                                                        {item.policy_type}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '14px', color: darkMode ? '#cbd5e1' : '#6c757d' }}>
                                                        {new Date(item.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '6px 14px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        color: status.color,
                                                        background: status.bg,
                                                        border: `1px solid ${status.color}30`,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {/* [UPDATE] Changed icon logic slightly to match context if needed, but keeping original */}
                                                        {item.form_type ? '✓' : '⏱'} {status.text}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* --- ENHANCED PAGINATION CONTROLS --- */}
                        {totalPages > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '30px',
                                padding: '20px',
                                background: darkMode ? '#2a2a2a' : '#f8f9fa',
                                borderRadius: '10px'
                            }}>
                                <div style={{ fontSize: '14px', color: darkMode ? '#999' : '#6c757d', fontWeight: 500 }}>
                                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} requests
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
                                                e.target.style.backgroundColor = '#395998';
                                                e.target.style.transform = 'translateY(0)';
                                            }
                                        }}
                                    >
                                        ← Previous
                                    </button>

                                    <div style={{
                                        padding: '10px 20px',
                                        background: darkMode ? '#1a1a1a' : 'white',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        color: darkMode ? '#395998' : '#0055b8',
                                        border: darkMode ? '2px solid #395998' : '2px solid #0055b8',
                                        textAlign: 'center',
                                        width: '140px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center'
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
                                                e.target.style.backgroundColor = '#395998';
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

export default SerialHistoryPage;