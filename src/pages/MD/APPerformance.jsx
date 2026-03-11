// APPerformance.jsx - Agency Partners performance page for MD
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { APPageSkeleton } from './MDSkeletons';
import { useMDData } from './MDData';
import MDLayout from './MDLayout';
import './MD_Styles.css';

const APPerformance = () => {
    const { darkMode } = useApp();
    const { apPerformance, loading, refreshData } = useMDData();
    const navigate = useNavigate();

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [mpFilter, setMpFilter] = useState('All');
    const [alFilter, setAlFilter] = useState('All');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [appliedFilters, setAppliedFilters] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        status: 'All',
        mp: 'All',
        al: 'All',
        search: ''
    });

    // State for modals
    const [showAPDetailsModal, setShowAPDetailsModal] = useState(false);
    const [selectedAP, setSelectedAP] = useState(null);

    // Month names
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];

    // Apply filters
    const applyFilters = () => {
        setAppliedFilters({
            month: selectedMonth,
            year: selectedYear,
            status: statusFilter,
            mp: mpFilter,
            al: alFilter,
            search: searchTerm
        });
        refreshData(selectedMonth, selectedYear);
    };

    // Clear filters
    const clearFilters = () => {
        setSelectedMonth(new Date().getMonth());
        setSelectedYear(currentYear);
        setStatusFilter('All');
        setMpFilter('All');
        setAlFilter('All');
        setSearchTerm('');
        setAppliedFilters({
            month: new Date().getMonth(),
            year: currentYear,
            status: 'All',
            mp: 'All',
            al: 'All',
            search: ''
        });
    };

    // Get AP performance status
    const getAPPerformanceStatus = (monthlyCases) => {
        if (monthlyCases >= 7) return 'PERFORMING';
        if (monthlyCases >= 4) return 'AVERAGE';
        return 'NEEDS IMPROVEMENT';
    };

    // Get AP activity status
    const getAPActivityStatus = (monthlyCases) => {
        return monthlyCases > 0 ? 'Active' : 'Inactive';
    };

    // Handle View AP Details
    const handleViewAPDetails = (ap) => {
        setSelectedAP(ap);
        setShowAPDetailsModal(true);
    };

    // Get unique MPs for filter
    const uniqueMPs = ['All', ...new Set(apPerformance.map(ap => ap.mpName).filter(Boolean))];
    
    // Get unique ALs for filter
    const uniqueALs = ['All', ...new Set(apPerformance.map(ap => ap.alName).filter(Boolean))];

    // Filter APs based on applied filters
    const filteredAPs = (apPerformance || []).filter(ap => {
        const performanceStatus = getAPPerformanceStatus(ap.monthlyCases);
        
        // Status filter
        if (appliedFilters.status !== 'All' && performanceStatus !== appliedFilters.status) {
            return false;
        }

        // MP filter
        if (appliedFilters.mp !== 'All' && ap.mpName !== appliedFilters.mp) {
            return false;
        }

        // AL filter
        if (appliedFilters.al !== 'All' && ap.alName !== appliedFilters.al) {
            return false;
        }

        // Search filter
        if (appliedFilters.search &&
            !(ap.name || '').toLowerCase().includes(appliedFilters.search.toLowerCase()) &&
            !(ap.alName || '').toLowerCase().includes(appliedFilters.search.toLowerCase()) &&
            !(ap.city || '').toLowerCase().includes(appliedFilters.search.toLowerCase())) {
            return false;
        }

        return true;
    });

    // Calculate statistics
    const totalAPs = filteredAPs.length;
    const activeAPs = filteredAPs.filter(ap => ap.monthlyCases > 0).length;
    const performingAPs = filteredAPs.filter(ap => getAPPerformanceStatus(ap.monthlyCases) === 'PERFORMING').length;
    const totalANP = filteredAPs.reduce((sum, ap) => sum + ap.totalANP, 0);
    const monthlyANP = filteredAPs.reduce((sum, ap) => sum + ap.monthlyANP, 0);
    const totalCases = filteredAPs.reduce((sum, ap) => sum + ap.totalCases, 0);
    const monthlyCases = filteredAPs.reduce((sum, ap) => sum + ap.monthlyCases, 0);

    // Get unique statuses for filter
    const uniqueStatuses = ['All', 'PERFORMING', 'AVERAGE', 'NEEDS IMPROVEMENT'];

    if (loading) {
        return <APPageSkeleton />;
    }

    return (
        <MDLayout title="Agency Partners Performance">
            {/* Header with Filters */}
            <div className="md-filters">
                <div className="filter-group">
                    <label>Search AP/AL</label>
                    <input
                        type="text"
                        placeholder="Search by name, AL, or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="md-search-input"
                        style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', minWidth: '200px' }}
                    />
                </div>

                <div className="filter-group">
                    <label>Performance</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="md-filter-select"
                    >
                        {uniqueStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Management Partner</label>
                    <select
                        value={mpFilter}
                        onChange={(e) => setMpFilter(e.target.value)}
                        className="md-filter-select"
                    >
                        {uniqueMPs.map(mp => (
                            <option key={mp} value={mp}>{mp}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Agency Leader</label>
                    <select
                        value={alFilter}
                        onChange={(e) => setAlFilter(e.target.value)}
                        className="md-filter-select"
                    >
                        {uniqueALs.map(al => (
                            <option key={al} value={al}>{al}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Month</label>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="md-filter-select"
                    >
                        {months.map((month, index) => (
                            <option key={month} value={index}>{month}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Year</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="md-filter-select"
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>&nbsp;</label>
                    <div className="filter-buttons">
                        <button onClick={applyFilters} className="apply-filter-btn">
                            Apply Filters
                        </button>
                        <button onClick={clearFilters} className="clear-filter-btn">
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="dashboard-grid">
                <div className="stat-card hover-card" style={{ borderLeft: '4px solid #002B5C' }}>
                    <div className="stat-label">Total Agency Partners</div>
                    <div className="stat-value">{totalAPs}</div>
                    <div className="stat-subtext">In network</div>
                </div>

                <div className="stat-card hover-card" style={{ borderLeft: '4px solid #28a745' }}>
                    <div className="stat-label">Active APs</div>
                    <div className="stat-value">{activeAPs}</div>
                    <div className="stat-subtext">{totalAPs > 0 ? ((activeAPs / totalAPs) * 100).toFixed(1) : 0}% Active Rate</div>
                </div>

                <div className="stat-card hover-card" style={{ borderLeft: '4px solid #0055b8' }}>
                    <div className="stat-label">Total ANP</div>
                    <div className="stat-value">₱ {(totalANP / 1000000).toFixed(1)}M</div>
                    <div className="stat-subtext">Cumulative from APs</div>
                </div>

                <div className="stat-card hover-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="stat-label">Monthly Cases</div>
                    <div className="stat-value">{monthlyCases.toLocaleString()}</div>
                    <div className="stat-subtext">{months[selectedMonth]} {selectedYear}</div>
                </div>
            </div>

            {/* Main Table */}
            <div className="content-container">
                <div className="container-header">
                    <h2>Agency Partners Detailed View - {months[appliedFilters.month]} {appliedFilters.year}</h2>
                    <div className="card-header-stats">
                        <span className="stat-badge">Showing: {filteredAPs.length} of {apPerformance.length}</span>
                        <span className="stat-badge status-active">Active: {activeAPs}</span>
                    </div>
                </div>
                <div className="container-body">
                    <table className="md-mp-table">
                        <thead>
                            <tr>
                                <th>AP Name</th>
                                <th>Management Partner</th>
                                <th>Agency Leader</th>
                                <th>City</th>
                                <th>Activity</th>
                                <th>Monthly ANP</th>
                                <th>Monthly Cases</th>
                                <th>Total ANP</th>
                                <th>Performance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAPs.map(ap => {
                                const performanceStatus = getAPPerformanceStatus(ap.monthlyCases);
                                const activityStatus = getAPActivityStatus(ap.monthlyCases);

                                return (
                                    <tr key={ap.id}>
                                        <td>
                                            <div className="agent-info">
                                                <div className="agent-name">{ap.name}</div>
                                                <div className="agent-detail">ID: {ap.licenseNumber}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{ap.mpName || 'N/A'}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{ap.alName || 'N/A'}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{ap.city || 'N/A'}</div>
                                        </td>
                                        <td>
                                            <div className="activity-status-cell" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className={`activity-dot ${activityStatus.toLowerCase()}`} style={{ width: '8px', height: '8px', borderRadius: '50%', background: activityStatus === 'Active' ? '#28a745' : '#dc3545' }}></span>
                                                <span>{activityStatus}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600', color: '#28a745' }}>
                                                ₱ {(ap.monthlyANP || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>
                                                {ap.monthlyCases || 0}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>
                                                ₱ {(ap.totalANP || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${performanceStatus.toLowerCase().replace(' ', '-')}`}>
                                                {performanceStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleViewAPDetails(ap)}
                                                    className="view-button"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* AP Details Modal */}
            {showAPDetailsModal && selectedAP && (
                <div className="md-modal">
                    <div className="md-modal-content" style={{ maxWidth: '800px' }}>
                        <div className="md-modal-header">
                            <div>
                                <h2>AP Details - {selectedAP.name}</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    Complete information and performance metrics
                                </p>
                            </div>
                            <button
                                className="md-modal-close"
                                onClick={() => setShowAPDetailsModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="md-modal-body">
                            <div className="md-modal-summary-card">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                    <div>
                                        <div className="summary-metric-label">Management Partner</div>
                                        <div className="summary-metric-value text-dark" style={{ fontSize: '18px' }}>
                                            {selectedAP.mpName || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">Agency Leader</div>
                                        <div className="summary-metric-value text-dark" style={{ fontSize: '18px' }}>
                                            {selectedAP.alName || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">License Number</div>
                                        <div className="summary-metric-value text-dark" style={{ fontSize: '18px' }}>
                                            {selectedAP.licenseNumber || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ background: darkMode ? '#252525' : '#f8fafc', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>Total ANP</div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#0055b8' }}>₱ {(selectedAP.totalANP || 0).toLocaleString()}</div>
                                </div>
                                <div style={{ background: darkMode ? '#252525' : '#f8fafc', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>Monthly ANP</div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#28a745' }}>₱ {(selectedAP.monthlyANP || 0).toLocaleString()}</div>
                                </div>
                                <div style={{ background: darkMode ? '#252525' : '#f8fafc', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>Total Cases</div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>{selectedAP.totalCases || 0}</div>
                                </div>
                                <div style={{ background: darkMode ? '#252525' : '#f8fafc', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#64748b' }}>Monthly Cases</div>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#f39c12' }}>{selectedAP.monthlyCases || 0}</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <h4 style={{ marginBottom: '12px', color: darkMode ? '#ffffff' : '#0f172a' }}>Additional Information</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                    <div><strong>City:</strong> {selectedAP.city || 'N/A'}</div>
                                    <div><strong>Last Activity:</strong> {selectedAP.lastActivity || 'N/A'}</div>
                                    <div><strong>Performance Status:</strong> 
                                        <span className={`status-badge status-${getAPPerformanceStatus(selectedAP.monthlyCases).toLowerCase().replace(' ', '-')}`} style={{ marginLeft: '8px' }}>
                                            {getAPPerformanceStatus(selectedAP.monthlyCases)}
                                        </span>
                                    </div>
                                    <div><strong>Activity Status:</strong> 
                                        <span style={{ marginLeft: '8px', color: selectedAP.monthlyCases > 0 ? '#28a745' : '#dc3545' }}>
                                            {selectedAP.monthlyCases > 0 ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="md-modal-footer">
                                <button
                                    onClick={() => setShowAPDetailsModal(false)}
                                    className="clear-filter-btn"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MDLayout>
    );
};

export default APPerformance;