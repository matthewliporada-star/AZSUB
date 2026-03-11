// MPPerformance.jsx - Management Partners performance page for MD
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { MPPageSkeleton } from './MDSkeletons';
import { useMDData } from './MDData';
import MDLayout from './MDLayout';
import './MD_Styles.css';

const MPPerformance = () => {
    const { darkMode } = useApp();
    const { mpPerformance, alPerformance, apPerformance, getALsByMP, loading, refreshData } = useMDData();
    const navigate = useNavigate();

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [appliedFilters, setAppliedFilters] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        status: 'All',
        search: ''
    });

    // State for modals
    const [showALsModal, setShowALsModal] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [selectedMP, setSelectedMP] = useState(null);

    // State for policy details data
    const [policyDetailsData, setPolicyDetailsData] = useState(null);
    const [loadingPolicyDetails, setLoadingPolicyDetails] = useState(false);

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
            search: searchTerm
        });
        refreshData(selectedMonth, selectedYear);
    };

    // Clear filters
    const clearFilters = () => {
        setSelectedMonth(new Date().getMonth());
        setSelectedYear(currentYear);
        setStatusFilter('All');
        setSearchTerm('');
        setAppliedFilters({
            month: new Date().getMonth(),
            year: currentYear,
            status: 'All',
            search: ''
        });
    };

    // Handle View ALs Modal
    const handleViewALsModal = (mp) => {
        setSelectedMP(mp);
        setShowALsModal(true);
    };

    // Handle View Policy Details Modal
    const handleViewPolicyDetails = async (mp) => {
        setSelectedMP(mp);
        setShowPolicyModal(true);

        // Fetch policy details data
        setLoadingPolicyDetails(true);
        try {
            const response = await fetch(`http://localhost:3000/api/md/policy-details/${mp.id}?year=${appliedFilters.year}`);
            const result = await response.json();
            if (result.success) {
                setPolicyDetailsData(result.data);
            }
        } catch (error) {
            console.error('Error fetching policy details:', error);
        } finally {
            setLoadingPolicyDetails(false);
        }
    };

    // Filter MPs based on applied filters
    const filteredMPs = (mpPerformance || []).filter(mp => {
        // Status filter
        if (appliedFilters.status !== 'All' && mp.status !== appliedFilters.status) {
            return false;
        }

        // Search filter
        if (appliedFilters.search &&
            !(mp.name || '').toLowerCase().includes(appliedFilters.search.toLowerCase()) &&
            !(mp.region || '').toLowerCase().includes(appliedFilters.search.toLowerCase())) {
            return false;
        }

        return true;
    });

    // Calculate statistics
    const totalMPs = filteredMPs.length;
    const activeMPs = filteredMPs.filter(mp => mp.status === 'ACTIVE' || mp.status === 'PERFORMING').length;
    const totalANP = filteredMPs.reduce((sum, mp) => sum + mp.totalANP, 0);
    const totalCases = filteredMPs.reduce((sum, mp) => sum + mp.totalCases, 0);

    // Get unique statuses for filter
    const uniqueStatuses = ['All', 'ACTIVE', 'PERFORMING', 'AVERAGE', 'INACTIVE'];

    // Get AL summary for a specific MP
    const getALSummaryForMP = (mpId) => {
        const als = getALsByMP(mpId);
        const total = als.length;
        const performing = als.filter(al => al.status === 'PERFORMING').length;
        const average = als.filter(al => al.status === 'AVERAGE').length;
        const needsImprovement = als.filter(al => al.status === 'NEEDS IMPROVEMENT').length;
        
        return { total, performing, average, needsImprovement };
    };

    if (loading) {
        return <MPPageSkeleton />;
    }

    return (
        <MDLayout title="Management Partners Performance">
            {/* Header with Filters */}
            <div className="md-filters">
                <div className="filter-group">
                    <label>Search MP</label>
                    <input
                        type="text"
                        placeholder="Search by name or region..."
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
                    <div className="stat-label">Total Management Partners</div>
                    <div className="stat-value">{totalMPs}</div>
                    <div className="stat-subtext">{activeMPs} Active</div>
                </div>

                <div className="stat-card hover-card" style={{ borderLeft: '4px solid #28a745' }}>
                    <div className="stat-label">Active MPs</div>
                    <div className="stat-value">{activeMPs}</div>
                    <div className="stat-subtext">{totalMPs > 0 ? ((activeMPs / totalMPs) * 100).toFixed(1) : 0}% of total</div>
                </div>

                <div className="stat-card hover-card" style={{ borderLeft: '4px solid #0055b8' }}>
                    <div className="stat-label">Total ANP</div>
                    <div className="stat-value">₱ {(totalANP / 1000000).toFixed(1)}M</div>
                    <div className="stat-subtext">Cumulative from MPs</div>
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
                    <h2>Management Partners Detailed View - {months[appliedFilters.month]} {appliedFilters.year}</h2>
                    <div className="card-header-stats">
                        <span className="stat-badge">Showing: {filteredMPs.length} of {mpPerformance.length}</span>
                    </div>
                </div>
                <div className="container-body">
                    <table className="md-mp-table">
                        <thead>
                            <tr>
                                <th>MP Name</th>
                                <th>Region</th>
                                <th>AL Count</th>
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
                            {filteredMPs.map(mp => {
                                const alSummary = getALSummaryForMP(mp.id);

                                return (
                                    <tr key={mp.id}>
                                        <td>
                                            <div className="agent-info">
                                                <div className="agent-name">{mp.name}</div>
                                                <div className="agent-detail">ID: MP-{mp.id.toString().padStart(4, '0')}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{mp.region || 'N/A'}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{alSummary.total}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                {alSummary.performing} Performing
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{mp.apCount || 0}</div>
                                        </td>
                                        <td>
                                            <div className="activity-ratio" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="ratio-bar" style={{ flex: 1, height: '6px', background: '#e9ecef', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div
                                                        className="ratio-fill"
                                                        style={{ width: `${mp.activityRatio || 0}%`, height: '100%', background: 'linear-gradient(90deg, #28a745, #20c997)' }}
                                                    ></div>
                                                </div>
                                                <span className="ratio-value" style={{ fontWeight: '600', minWidth: '40px', textAlign: 'right' }}>{mp.activityRatio || 0}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600', color: '#28a745' }}>
                                                ₱ {(mp.monthlyANP || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>
                                                {mp.monthlyCases || 0}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>
                                                ₱ {(mp.totalANP || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${(mp.status || 'active').toLowerCase().replace(' ', '-')}`}>
                                                {mp.status || 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleViewALsModal(mp)}
                                                    className="view-button"
                                                >
                                                    View ALs ({alSummary.total})
                                                </button>
                                                <button
                                                    onClick={() => handleViewPolicyDetails(mp)}
                                                    className="details-button"
                                                >
                                                    Policy Details
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

            {/* ALs Modal */}
            {showALsModal && selectedMP && (
                <div className="md-modal">
                    <div className="md-modal-content" style={{ maxWidth: '1000px', maxHeight: '90vh' }}>
                        <div className="md-modal-header">
                            <div>
                                <h2>{selectedMP.name} - Agency Leaders</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    ALs under this Management Partner
                                </p>
                            </div>
                            <button
                                className="md-modal-close"
                                onClick={() => setShowALsModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="md-modal-body">
                            <div className="md-modal-summary-card">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                    <div>
                                        <div className="summary-metric-label">Total ALs</div>
                                        <div className="summary-metric-value text-dark">
                                            {getALsByMP(selectedMP.id).length}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">Performing ALs</div>
                                        <div className="summary-metric-value text-success">
                                            {getALsByMP(selectedMP.id).filter(al => al.status === 'PERFORMING').length}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">Monthly ANP</div>
                                        <div className="summary-metric-value text-primary">
                                            ₱ {selectedMP.monthlyANP.toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">Monthly Cases</div>
                                        <div className="summary-metric-value text-warning">
                                            {selectedMP.monthlyCases}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h4 className="md-modal-section-title">Agency Leaders List</h4>
                            <div className="modal-table-responsive">
                                <table className="performance-table">
                                    <thead>
                                        <tr>
                                            <th>AL Name</th>
                                            <th>Status</th>
                                            <th>Monthly ANP</th>
                                            <th>Monthly Cases</th>
                                            <th>Activity Ratio</th>
                                            <th>AP Count</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getALsByMP(selectedMP.id).map(al => (
                                            <tr key={al.id}>
                                                <td>
                                                    <div className="agent-info">
                                                        <div className="agent-name">{al.name}</div>
                                                        <div className="agent-detail">ID: AL-{al.id.toString().padStart(4, '0')}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${al.status?.toLowerCase().replace(' ', '-') || 'active'}`}>
                                                        {al.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: '600', color: '#28a745' }}>
                                                        ₱ {al.monthlyANP.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: '600' }}>{al.monthlyCases}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: '600' }}>{al.activityRatio || 0}%</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: '600' }}>{al.apCount || 0}</div>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => {
                                                            setShowALsModal(false);
                                                            navigate(`/md/al-performance?al=${al.id}`);
                                                        }}
                                                        className="details-button"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="md-modal-footer">
                                <button
                                    onClick={() => setShowALsModal(false)}
                                    className="clear-filter-btn"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Policy Details Modal */}
            {showPolicyModal && selectedMP && (
                <div className="md-modal">
                    <div className="md-modal-content" style={{ maxWidth: '1000px', maxHeight: '90vh' }}>
                        <div className="md-modal-header">
                            <div>
                                <h2>{selectedMP.name} - Policy Details</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    Policy distribution for {months[selectedMonth]} {selectedYear}
                                </p>
                            </div>
                            <button
                                className="md-modal-close"
                                onClick={() => setShowPolicyModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="md-modal-body">
                            {loadingPolicyDetails ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <div style={{ fontSize: '16px', color: '#64748b' }}>Loading policy details...</div>
                                </div>
                            ) : policyDetailsData ? (
                                <>
                                    <div className="md-modal-summary-card">
                                        <h4 className="md-modal-section-title">Policy Statistics</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                            <div>
                                                <div className="summary-metric-label">Total Policies</div>
                                                <div className="summary-metric-value text-dark">
                                                    {policyDetailsData.totalCases || 0}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="summary-metric-label">Issued</div>
                                                <div className="summary-metric-value text-success">
                                                    {policyDetailsData.issuedCount || 0}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="summary-metric-label">Declined</div>
                                                <div className="summary-metric-value text-danger">
                                                    {policyDetailsData.declinedCount || 0}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="summary-metric-label">Total ANP</div>
                                                <div className="summary-metric-value text-primary">
                                                    ₱ {(policyDetailsData.totalANP || 0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <h4 className="md-modal-section-title">Policy Breakdown</h4>
                                    <table className="policy-table">
                                        <thead>
                                            <tr>
                                                <th>Policy Name</th>
                                                <th>Category</th>
                                                <th>Count</th>
                                                <th>Percentage</th>
                                                <th>ANP Generated</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {policyDetailsData.policyDistribution && policyDetailsData.policyDistribution.length > 0 ? (
                                                policyDetailsData.policyDistribution.map((policy) => (
                                                    <tr key={policy.policy_name}>
                                                        <td><div style={{ fontWeight: '600' }}>{policy.policy_name}</div></td>
                                                        <td><span className="category-badge system">System</span></td>
                                                        <td style={{ fontWeight: '600', textAlign: 'center' }}>{policy.count}</td>
                                                        <td>
                                                            <div className="percentage-bar">
                                                                <div className="percentage-fill" style={{ width: `${policy.percentage}%` }}></div>
                                                                <span className="percentage-value">{policy.percentage}%</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontWeight: '600', color: '#28a745' }}>
                                                            ₱ {(policy.totalANP || 0).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No policy data available</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <div style={{ fontSize: '16px', color: '#64748b' }}>No policy data available</div>
                                </div>
                            )}

                            <div className="md-modal-footer">
                                <button
                                    onClick={() => setShowPolicyModal(false)}
                                    className="clear-filter-btn"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPolicyModal(false);
                                        setShowALsModal(true);
                                    }}
                                    className="apply-filter-btn"
                                >
                                    View ALs Under This MP
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MDLayout>
    );
};

export default MPPerformance;