// ALPerformance.jsx - Agency Leaders performance page for MD
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ALPageSkeleton } from './MDSkeletons';
import { useMDData } from './MDData';
import MDLayout from './MDLayout';
import './MD_Styles.css';

const ALPerformance = () => {
    const { darkMode } = useApp();
    const { alPerformance, apPerformance, getAPsByAL, loading, refreshData } = useMDData();
    const navigate = useNavigate();

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [mpFilter, setMpFilter] = useState('All');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [appliedFilters, setAppliedFilters] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        status: 'All',
        mp: 'All',
        search: ''
    });

    // State for modals
    const [showAPsModal, setShowAPsModal] = useState(false);
    const [selectedAL, setSelectedAL] = useState(null);

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
        setSearchTerm('');
        setAppliedFilters({
            month: new Date().getMonth(),
            year: currentYear,
            status: 'All',
            mp: 'All',
            search: ''
        });
        refreshData(new Date().getMonth(), currentYear);
    };

    // Get AP performance status
    const getAPPerformanceStatus = (monthlyCases) => {
        if (monthlyCases >= 7) return 'PERFORMING';
        if (monthlyCases >= 4) return 'AVERAGE';
        return 'NEEDS IMPROVEMENT';
    };

    // Handle View APs Modal
    const handleViewAPsModal = (al) => {
        setSelectedAL(al);
        setShowAPsModal(true);
    };

    // Get unique MPs for filter
    const uniqueMPs = ['All', ...new Set(alPerformance.map(al => al.mpName).filter(Boolean))];

    // Filter ALs based on applied filters
    const filteredALs = (alPerformance || []).filter(al => {
        // Status filter
        if (appliedFilters.status !== 'All' && al.status !== appliedFilters.status) {
            return false;
        }

        // MP filter
        if (appliedFilters.mp !== 'All' && al.mpName !== appliedFilters.mp) {
            return false;
        }

        // Search filter
        if (appliedFilters.search &&
            !(al.name || '').toLowerCase().includes(appliedFilters.search.toLowerCase()) &&
            !(al.city || '').toLowerCase().includes(appliedFilters.search.toLowerCase())) {
            return false;
        }

        return true;
    });

    // Calculate statistics
    const totalALs = filteredALs.length;
    const performingALs = filteredALs.filter(al => al.status === 'PERFORMING').length;
    const averageALs = filteredALs.filter(al => al.status === 'AVERAGE').length;
    const needsImprovementALs = filteredALs.filter(al => al.status === 'NEEDS IMPROVEMENT').length;
    const totalANP = filteredALs.reduce((sum, al) => sum + (al.totalANP || 0), 0);
    const totalCases = filteredALs.reduce((sum, al) => sum + (al.totalCases || 0), 0);

    // Get unique statuses for filter
    const uniqueStatuses = ['All', 'PERFORMING', 'AVERAGE', 'NEEDS IMPROVEMENT'];

    // Get AP summary for a specific AL
    const getAPSummaryForAL = (alName) => {
        const aps = getAPsByAL(alName);
        const total = aps.length;
        const performing = aps.filter(ap => getAPPerformanceStatus(ap.monthlyCases) === 'PERFORMING').length;
        const average = aps.filter(ap => getAPPerformanceStatus(ap.monthlyCases) === 'AVERAGE').length;
        const needsImprovement = aps.filter(ap => getAPPerformanceStatus(ap.monthlyCases) === 'NEEDS IMPROVEMENT' && ap.monthlyCases > 0).length;
        const inactive = aps.filter(ap => ap.monthlyCases === 0).length;

        return { total, performing, average, needsImprovement, inactive };
    };

    if (loading) {
        return <ALPageSkeleton />;
    }

    return (
        <MDLayout title="Agency Leaders Performance">
            {/* Header with Filters */}
            <div className="md-filters">
                <div className="filter-group">
                    <label>Search AL</label>
                    <input
                        type="text"
                        placeholder="Search by name or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="md-search-input"
                        style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', minWidth: '200px' }}
                    />
                </div>

                <div className="filter-group">
                    <label>Status</label>
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
                    <div className="stat-label">Total Agency Leaders</div>
                    <div className="stat-value">{totalALs.toLocaleString()}</div>
                    <div className="stat-subtext">Across all MPs</div>
                </div>

                <div className="stat-card hover-card" style={{ borderLeft: '4px solid #28a745' }}>
                    <div className="stat-label">Performing ALs</div>
                    <div className="stat-value">{performingALs.toLocaleString()}</div>
                    <div className="stat-subtext">{totalALs > 0 ? ((performingALs / totalALs) * 100).toFixed(1) : 0}% of total</div>
                </div>

                <div className="stat-card hover-card" style={{ borderLeft: '4px solid #0055b8' }}>
                    <div className="stat-label">Total ANP</div>
                    <div className="stat-value">₱ {totalANP.toLocaleString()}</div>
                    <div className="stat-subtext">Cumulative from ALs</div>
                </div>

                <div className="stat-card hover-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="stat-label">Total Cases</div>
                    <div className="stat-value">{totalCases.toLocaleString()}</div>
                    <div className="stat-subtext">All-time policies</div>
                </div>
            </div>

            {/* Main Table */}
            <div className="content-container">
                <div className="container-header">
                    <h2>Agency Leaders Detailed View - {months[appliedFilters.month]} {appliedFilters.year}</h2>
                    <div className="card-header-stats">
                        <span className="stat-badge">Showing: {filteredALs.length.toLocaleString()} of {alPerformance.length.toLocaleString()}</span>
                        <span className="stat-badge status-performing">Performing: {performingALs.toLocaleString()}</span>
                    </div>
                </div>
                <div className="container-body">
                    <table className="md-mp-table">
                        <thead>
                            <tr>
                                <th>AL Name</th>
                                <th>Management Partner</th>
                                <th>City</th>
                                <th>AP Count</th>
                                <th>Activity Ratio</th>
                                <th>Monthly ANP</th>
                                <th>Monthly Cases</th>
                                <th>Total ANP</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredALs.map(al => {
                                const apSummary = getAPSummaryForAL(al.name);

                                return (
                                    <tr key={al.id}>
                                        <td>
                                            <div className="agent-info">
                                                <div className="agent-name">{al.name}</div>
                                                <div className="agent-detail">ID: {al.id?.substring(0, 8) || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{al.mpName || 'N/A'}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{al.city || 'N/A'}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{apSummary.total.toLocaleString()}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                {apSummary.performing.toLocaleString()} Performing
                                            </div>
                                        </td>
                                        <td>
                                            <div className="activity-ratio" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="ratio-bar" style={{ flex: 1, height: '6px', background: '#e9ecef', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div
                                                        className="ratio-fill"
                                                        style={{ width: `${al.activityRatio || 0}%`, height: '100%', background: 'linear-gradient(90deg, #28a745, #20c997)' }}
                                                    ></div>
                                                </div>
                                                <span className="ratio-value" style={{ fontWeight: '600', minWidth: '40px', textAlign: 'right' }}>{al.activityRatio || 0}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600', color: '#28a745' }}>
                                                ₱ {(al.monthlyANP || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>
                                                {(al.monthlyCases || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>
                                                ₱ {(al.totalANP || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${(al.status || 'active').toLowerCase().replace(' ', '-')}`}>
                                                {al.status || 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleViewAPsModal(al)}
                                                    className="view-button"
                                                >
                                                    View APs ({apSummary.total.toLocaleString()})
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/md/ap-performance?al=${al.id}`)}
                                                    className="details-button"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredALs.length === 0 && (
                                <tr>
                                    <td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>
                                        No Agency Leaders found matching the filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* APs Modal */}
            {showAPsModal && selectedAL && (
                <div className="md-modal">
                    <div className="md-modal-content" style={{ maxWidth: '1000px', maxHeight: '90vh' }}>
                        <div className="md-modal-header">
                            <div>
                                <h2>{selectedAL.name} - Agency Partners</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    APs under this Agency Leader
                                </p>
                            </div>
                            <button
                                className="md-modal-close"
                                onClick={() => setShowAPsModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="md-modal-body">
                            <div className="md-modal-summary-card">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                    <div>
                                        <div className="summary-metric-label">Total APs</div>
                                        <div className="summary-metric-value text-dark">
                                            {getAPSummaryForAL(selectedAL.name).total.toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">Performing</div>
                                        <div className="summary-metric-value text-success">
                                            {getAPSummaryForAL(selectedAL.name).performing.toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">Monthly ANP</div>
                                        <div className="summary-metric-value text-primary">
                                            ₱ {(selectedAL.monthlyANP || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">Monthly Cases</div>
                                        <div className="summary-metric-value text-warning">
                                            {(selectedAL.monthlyCases || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h4 className="md-modal-section-title">Agency Partners List</h4>
                            <div className="modal-table-responsive">
                                <table className="performance-table">
                                    <thead>
                                        <tr>
                                            <th>AP Name</th>
                                            <th>Status</th>
                                            <th>Monthly ANP</th>
                                            <th>Monthly Cases</th>
                                            <th>Total ANP</th>
                                            <th>Last Activity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getAPsByAL(selectedAL.name).map(ap => {
                                            const performanceStatus = getAPPerformanceStatus(ap.monthlyCases);
                                            return (
                                                <tr key={ap.id}>
                                                    <td>
                                                        <div className="agent-info">
                                                            <div className="agent-name">{ap.name}</div>
                                                            <div className="agent-detail">ID: {ap.licenseNumber}</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge status-${performanceStatus.toLowerCase().replace(' ', '-')}`}>
                                                            {performanceStatus}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: '600', color: '#28a745' }}>
                                                            ₱ {(ap.monthlyANP || 0).toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: '600' }}>{(ap.monthlyCases || 0).toLocaleString()}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: '600' }}>
                                                            ₱ {(ap.totalANP || 0).toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: '600' }}>{ap.lastActivity || 'N/A'}</div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {getAPsByAL(selectedAL.name).length === 0 && (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                                    No Agency Partners found under this Agency Leader
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="md-modal-footer">
                                <button
                                    onClick={() => setShowAPsModal(false)}
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

export default ALPerformance;