// ALPerformance.jsx - FINAL UPDATED VERSION
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ALPageSkeleton } from './MPSkeletons';
import { useMPData } from './MPData';
import MPLayout from './MPLayout';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './MP_Styles.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const ALPerformance = () => {
    const { darkMode } = useApp();
    const { alPerformance, apPerformance, getAPsByAL, loading, refreshData } = useMPData();
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
    const [showAPsModal, setShowAPsModal] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [showStatDetailsModal, setShowStatDetailsModal] = useState(false);
    const [selectedStat, setSelectedStat] = useState(null);
    const [selectedAL, setSelectedAL] = useState(null);

    // State for policy details data
    const [policyDetailsData, setPolicyDetailsData] = useState(null);
    const [loadingPolicyDetails, setLoadingPolicyDetails] = useState(false);

    // State for Stat History (Dashboard-like details)
    const [statHistoryCache, setStatHistoryCache] = useState({});
    const [loadingStatHistory, setLoadingStatHistory] = useState(false);
    const [currentHistoryData, setCurrentHistoryData] = useState(null);

    // Month names
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];

    // Apply filters
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

    // Calculate AP performance status
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

    // Handle View Policy Details Modal
    const handleViewPolicyDetails = async (al) => {
        setSelectedAL(al);
        setShowPolicyModal(true);

        // Fetch policy details data
        setLoadingPolicyDetails(true);
        try {
            const response = await fetch(`http://localhost:3000/api/mp/policy-details/${al.id}?year=${appliedFilters.year}`);
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

    // Handle View AP Details - Now shows AP details modal instead of navigating
    const handleViewAPDetails = (ap) => {
        navigate('/mp/ap-performance', {
            state: {
                selectedAP: ap,
                selectedMonth: appliedFilters.month,
                selectedYear: appliedFilters.year
            }
        });
    };

    // Handle Stat Card Click
    const handleStatCardClick = (statType) => {
        setSelectedStat(statType);
        setShowStatDetailsModal(true);
    };

    // Filter ALs based on applied filters
    const filteredALs = (alPerformance || []).filter(al => {
        // Status filter
        if (appliedFilters.status !== 'All' && al.status !== appliedFilters.status) {
            return false;
        }

        // Search filter
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
    const averageActivityRatio = filteredALs.length > 0 ?
        filteredALs.reduce((sum, al) => sum + al.activityRatio, 0) / filteredALs.length : 0;
    const totalANP = filteredALs.reduce((sum, al) => sum + al.totalANP, 0);
    const totalCases = filteredALs.reduce((sum, al) => sum + al.totalCases, 0);

    // Get unique statuses for filter
    const uniqueStatuses = ['All', 'PERFORMING', 'AVERAGE', 'NEEDS IMPROVEMENT'];

    // Get AP performance summary for a specific AL
    const getAPPerformanceSummaryForAL = (alName) => {
        const aps = getAPsByAL(alName);
        const total = aps.length;
        const active = aps.filter(ap => ap.monthlyCases > 0).length; // Active if issued at least 1 policy
        const performing = aps.filter(ap => getAPPerformanceStatus(ap.monthlyCases) === 'PERFORMING').length;
        const average = aps.filter(ap => getAPPerformanceStatus(ap.monthlyCases) === 'AVERAGE').length;
        const needsImprovement = aps.filter(ap => getAPPerformanceStatus(ap.monthlyCases) === 'NEEDS IMPROVEMENT').length;
        const inactive = aps.filter(ap => ap.monthlyCases === 0).length;

        return { total, active, performing, average, needsImprovement, inactive };
    };

    // Get monthly performance adjusted for selected month/year
    const getAdjustedMonthlyPerformance = (al) => {
        const basePerformance = {
            policiesIssued: al.monthlyCases,
            anp: al.monthlyANP,
            newClients: Math.floor(al.monthlyCases * 0.6),
            conversionRate: 80 + Math.floor(Math.random() * 15)
        };

        // Adjust based on selected month/year
        const monthMultiplier = appliedFilters.month === 11 ? 1.3 : appliedFilters.month === 0 ? 0.8 : 1.0;
        const yearMultiplier = appliedFilters.year === 2026 ? 1.2 : appliedFilters.year === 2025 ? 1.1 : 1.0;
        const totalMultiplier = monthMultiplier * yearMultiplier;

        return {
            policiesIssued: Math.round(basePerformance.policiesIssued * totalMultiplier),
            anp: Math.round(basePerformance.anp * totalMultiplier),
            newClients: Math.round(basePerformance.newClients * totalMultiplier),
            conversionRate: basePerformance.conversionRate
        };
    };

    // Fetch historical data for stat details
    useEffect(() => {
        if (showStatDetailsModal && selectedStat) {
            // Map selectedStat to backend supported types if needed
            // Backend supports: totalANP, monthlyANP, totalCases, declined, activityRatio
            // AL Cards: totalALs (unsupported), performingALs (unsupported), totalANP (supported), totalCases (monthly -> 'totalCases')
            let backendStatType = selectedStat;
            if (selectedStat === 'totalCases') backendStatType = 'totalCases'; // Monthly Cases

            if (['totalANP', 'totalCases'].includes(backendStatType)) {
                fetchStatHistoryData(backendStatType).then(data => setCurrentHistoryData(data));
            } else {
                setCurrentHistoryData(null); // Not supported for history yet
            }
        }
    }, [showStatDetailsModal, selectedStat, appliedFilters.year, appliedFilters.month]);

    const fetchStatHistoryData = async (statType) => {
        const cacheKey = `${statType}_${appliedFilters.year}_${appliedFilters.month}`;
        if (statHistoryCache[cacheKey]) return statHistoryCache[cacheKey];

        setLoadingStatHistory(true);
        try {
            const response = await fetch(
                `http://localhost:3000/api/mp/monthly-history?year=${appliedFilters.year}&month=${appliedFilters.month}&statType=${statType}&view=al`
            );
            const result = await response.json();
            if (result.success && result.data) {
                setStatHistoryCache(prev => ({ ...prev, [cacheKey]: result.data }));
                return result.data;
            }
        } catch (error) {
            console.error('Error fetching stat history:', error);
        } finally {
            setLoadingStatHistory(false);
        }
        return null;
    };

    // Render stat details based on selected stat - UPDATED to match Dashboard
    const renderStatDetails = () => {
        const currentMonth = months[appliedFilters.month];

        // For unsupported stats, fallback to static info
        if (!['totalANP', 'totalCases'].includes(selectedStat)) {
            // Render original static content for AL specific stats
            switch (selectedStat) {
                case 'totalALs':
                    return (
                        <div>
                            <h3>Total Agency Leaders Details</h3>
                            <p>Showing detailed information about all Agency Leaders in the network.</p>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Total ALs:</span>
                                    <span className="info-value">{totalALs}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Performing ALs:</span>
                                    <span className="info-value">{performingALs}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Average ALs:</span>
                                    <span className="info-value">{filteredALs.filter(al => al.status === 'AVERAGE').length}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Needs Improvement:</span>
                                    <span className="info-value">{filteredALs.filter(al => al.status === 'NEEDS IMPROVEMENT').length}</span>
                                </div>
                            </div>
                        </div>
                    );
                case 'performingALs':
                    return (
                        <div>
                            <h3>Performing Agency Leaders Details</h3>
                            <p>Agency Leaders with monthly cases ≥ 7 policies.</p>
                            <table className="performance-table">
                                <thead>
                                    <tr>
                                        <th>AL Name</th>
                                        <th>Monthly Cases</th>
                                        <th>Activity Ratio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredALs.filter(al => al.status === 'PERFORMING').map(al => (
                                        <tr key={al.id}>
                                            <td>{al.name}</td>
                                            <td>{al.monthlyCases}</td>
                                            <td>{al.activityRatio}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                default:
                    return null;
            }
        }

        // Logic for Chart-supported stats (Total ANP, Total Cases)
        if (loadingStatHistory) {
            return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading statistics history...</div>;
        }

        if (!currentHistoryData) {
            return <div style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>Failed to load history data.</div>;
        }

        const monthlyIssuedSum = filteredALs.reduce((sum, al) => sum + al.monthlyCases, 0);
        const monthlyDeclinedSum = filteredALs.reduce((sum, al) => sum + (al.monthlyDeclined || 0), 0);

        return (
            <div>
                <h3 style={{ marginBottom: '8px', color: darkMode ? '#FFFFFF' : '#0f172a' }}>{currentHistoryData.title}</h3>
                <p style={{ marginBottom: '24px', color: darkMode ? '#94A3B8' : '#64748b', fontSize: '14px' }}>
                    {selectedStat === 'totalCases'
                        ? `Total Policies (Issued + Declined) - ${currentMonth} ${appliedFilters.year}`
                        : selectedStat === 'totalANP'
                            ? `Year-to-Date Cumulative - ${appliedFilters.year}`
                            : `Historical Data - ${currentMonth} ${appliedFilters.year}`
                    }
                </p>

                <div style={{
                    background: darkMode ? '#161B22' : '#f8fafc',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    border: darkMode ? '1px solid var(--border-subtle-dark)' : 'none'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        <div>
                            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>
                                {selectedStat === 'totalANP' ? 'Total Cumulative ANP' : 'Current Value'}
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#0f172a' }}>
                                {selectedStat === 'totalCases' ? (
                                    <>
                                        {(monthlyIssuedSum + monthlyDeclinedSum).toLocaleString()}
                                        <div style={{ fontSize: '13px', color: darkMode ? '#94A3B8' : '#64748b', fontWeight: '500', marginTop: '4px' }}>
                                            {monthlyIssuedSum.toLocaleString()} Issued · {monthlyDeclinedSum.toLocaleString()} Declined
                                        </div>
                                    </>
                                ) : (
                                    `₱ ${(currentHistoryData?.currentValue || 0).toLocaleString()}`
                                )}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Yearly Change</div>
                            <div style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: currentHistoryData.trend === 'up' ? '#28a745' :
                                    currentHistoryData.trend === 'down' ? '#dc3545' : '#6c757d'
                            }}>
                                {currentHistoryData.trend === 'up' && '+'}{currentHistoryData.yearlyChange.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                </div>

                <h4 style={{ marginBottom: '16px', color: '#0f172a' }}>Monthly History</h4>
                <div className="modal-table-responsive">
                    <table className="performance-table">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Value</th>
                                <th>Trend</th>
                                <th>Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentHistoryData.monthlyData.map((item, index) => {
                                const prevValue = index > 0 ? currentHistoryData.monthlyData[index - 1].value : item.value;
                                const change = prevValue > 0 ? ((item.value - prevValue) / prevValue * 100).toFixed(1) : 0;

                                return (
                                    <tr key={item.month}>
                                        <td><div style={{ fontWeight: '600' }}>{item.month}</div></td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>
                                                {selectedStat === 'totalANP' && '₱ '}{item.value.toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`stat-trend ${item.trend}`}>
                                                {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{
                                                fontWeight: '600',
                                                color: item.trend === 'up' ? '#28a745' :
                                                    item.trend === 'down' ? '#dc3545' : '#6c757d'
                                            }}>
                                                {item.trend === 'up' ? '+' : item.trend === 'down' ? '-' : ''}{index > 0 ? `${change}%` : 'N/A'}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '24px' }}>
                    <h4 style={{ marginBottom: '16px', color: '#0f172a' }}>Trend Visualization</h4>
                    <div style={{ height: '200px' }}>
                        <Bar
                            data={{
                                labels: currentHistoryData.monthlyData.map(d => d.month),
                                datasets: [{
                                    label: currentHistoryData.title,
                                    data: currentHistoryData.monthlyData.map(d => d.value),
                                    backgroundColor: '#003781',
                                    borderRadius: 4
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: {
                                            callback: function (value) {
                                                return selectedStat === 'totalANP' ? `₱ ${value}` : value;
                                            }
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return <ALPageSkeleton />;
    }

    return (
        <MPLayout title="Agency Leaders Performance">
            {/* Header with Filters - Matching MPDashboard style */}

            <div className="mp-filters">
                <div className="filter-group">
                    <label>Search AL</label>
                    <input
                        type="text"
                        placeholder="Search by name or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mp-search-input"
                    />
                </div>

                <div className="filter-group">
                    <label>Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="mp-filter-select"
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
                        className="mp-filter-select"
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
                        className="mp-filter-select"
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


            {/* Clickable Stat Cards with Hover Effect */}
            <div className="dashboard-grid">
                <div
                    className="stat-card hover-card animate-spring delay-1"
                    style={{ borderLeft: '4px solid #003781', cursor: 'pointer' }}
                    onClick={() => handleStatCardClick('totalALs')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div className="stat-label">Total Agency Leaders</div>
                    <div className="stat-value">{totalALs}</div>
                    <div className="stat-subtext">Managing the network</div>
                </div>

                <div
                    className="stat-card hover-card animate-spring delay-2"
                    style={{ borderLeft: '4px solid #28a745', cursor: 'pointer' }}
                    onClick={() => handleStatCardClick('performingALs')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div className="stat-label">Performing ALs</div>
                    <div className="stat-value">{performingALs}</div>
                    <div className="stat-subtext">{(totalALs > 0 ? (performingALs / totalALs * 100).toFixed(1) : 0)}% of total</div>
                </div>

                <div
                    className="stat-card hover-card animate-spring delay-3"
                    style={{ borderLeft: '4px solid #0055b8', cursor: 'pointer' }}
                    onClick={() => handleStatCardClick('totalANP')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div className="stat-label">Total ANP</div>
                    <div className="stat-value">₱ {totalANP.toLocaleString()}</div>
                    <div className="stat-subtext">Cumulative from ALs</div>
                </div>

                <div
                    className="stat-card hover-card animate-spring delay-4"
                    style={{ borderLeft: '4px solid #3b82f6', cursor: 'pointer' }}
                    onClick={() => handleStatCardClick('totalCases')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div className="stat-label">Monthly Cases</div>
                    <div className="stat-value">{(filteredALs.reduce((sum, al) => sum + al.monthlyCases, 0) + filteredALs.reduce((sum, al) => sum + (al.monthlyDeclined || 0), 0)).toLocaleString()}</div>
                    <div className="stat-subtext" style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                        {filteredALs.reduce((sum, al) => sum + al.monthlyCases, 0).toLocaleString()} Issued · {filteredALs.reduce((sum, al) => sum + (al.monthlyDeclined || 0), 0).toLocaleString()} Declined
                    </div>
                </div>
            </div>

            {/* Main Table - Container Style */}
            <div className="content-container">
                <div className="container-header">
                    <h2>Agency Leaders Detailed View - {months[appliedFilters.month]} {appliedFilters.year}</h2>
                    <div className="card-header-stats">
                        <span className="stat-badge">Showing: {filteredALs.length} of {alPerformance.length}</span>
                        <span className="stat-badge status-performing">Performing: {performingALs}</span>
                    </div>
                </div>
                <div className="container-body">
                    <table className="mp-al-table">
                        <thead>
                            <tr>
                                <th>AL Name</th>
                                <th>City</th>
                                <th>AP Count</th>
                                <th>Activity Ratio</th>
                                <th>Total ANP</th>
                                <th>Monthly ANP</th>
                                <th>Total Cases</th>
                                <th>Monthly Cases</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredALs.map(al => {
                                const apSummary = getAPPerformanceSummaryForAL(al.name);
                                const monthlyPerformance = getAdjustedMonthlyPerformance(al);

                                return (
                                    <tr key={al.id}>
                                        <td>
                                            <div className="agent-info">
                                                <div className="agent-name">{al.name}</div>
                                                <div className="agent-detail">
                                                    {al.city}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{al.city}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{apSummary.total}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                {apSummary.active} active ({apSummary.active > 0 ? Math.round((apSummary.active / apSummary.total) * 100) : 0}%)
                                            </div>
                                        </td>
                                        <td>
                                            <div className="activity-ratio">
                                                <div className="ratio-bar">
                                                    <div
                                                        className="ratio-fill"
                                                        style={{ width: `${al.activityRatio}%` }}
                                                    ></div>
                                                </div>
                                                <span className="ratio-value">{al.activityRatio}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>
                                                ₱ {al.totalANP.toLocaleString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600', color: '#28a745' }}>
                                                ₱ {monthlyPerformance.anp.toLocaleString()}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                {monthlyPerformance.policiesIssued} policies
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{al.totalCases}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>
                                                {monthlyPerformance.policiesIssued + (al.monthlyDeclined || 0)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${al.status.toLowerCase().replace(' ', '-')}`}>
                                                {al.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleViewAPsModal(al)}
                                                    className="view-button"
                                                >
                                                    View APs ({apSummary.total})
                                                </button>
                                                <button
                                                    onClick={() => handleViewPolicyDetails(al)}
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

            {/* APs Modal */}
            {showAPsModal && selectedAL && (
                <div className="mp-modal">
                    <div className="mp-modal-content" style={{ maxWidth: '1000px', maxHeight: '90vh' }}>
                        <div className="mp-modal-header">
                            <div>
                                <h2>{selectedAL.name} - Agency Partners</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    APs under this Agency Leader and their performance
                                </p>
                            </div>
                            <button
                                className="mp-modal-close"
                                onClick={() => setShowAPsModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="mp-modal-body">
                            <div className="mp-modal-summary-card" style={{
                                background: darkMode ? '#252525' : '#f8fafc',
                                padding: '20px',
                                borderRadius: '12px',
                                marginBottom: '20px',
                                border: darkMode ? '1px solid var(--border-subtle-dark)' : 'none'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Total APs</div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#0f172a' }}>
                                            {getAPPerformanceSummaryForAL(selectedAL.name).total}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Active APs</div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#28a745' }}>
                                            {getAPPerformanceSummaryForAL(selectedAL.name).active}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Performing APs</div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#0055b8' }}>
                                            {getAPPerformanceSummaryForAL(selectedAL.name).performing}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Avg. Monthly Cases</div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6' }}>
                                            {Math.floor(getAPsByAL(selectedAL.name).reduce((sum, ap) => sum + (ap.monthlyCases || 0), 0) / getAPsByAL(selectedAL.name).length)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h4 style={{ marginBottom: '16px', color: '#0f172a' }}>Agency Partners List</h4>
                            <div className="modal-table-responsive">
                                <table className="performance-table">
                                    <thead>
                                        <tr>
                                            <th>AP Name</th>
                                            <th>Activity Status</th>
                                            <th>Total ANP</th>
                                            <th>Monthly ANP</th>
                                            <th>Total Cases</th>
                                            <th>Monthly Cases</th>
                                            <th>Performance Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getAPsByAL(selectedAL.name).map(ap => {
                                            const performanceStatus = getAPPerformanceStatus(ap.monthlyCases);
                                            const isActive = ap.monthlyCases > 0;

                                            return (
                                                <tr key={ap.id}>
                                                    <td>
                                                        <div className="agent-info">
                                                            <div className="agent-name">{ap.name}</div>
                                                            <div className="agent-detail">ID: {ap.licenseNumber}</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="activity-status-cell">
                                                            <span className={`activity-dot ${isActive ? 'active' : 'inactive'}`}></span>
                                                            <span>{isActive ? 'Active' : 'Inactive'}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: '600' }}>
                                                            ₱ {ap.totalANP.toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: '600', color: '#28a745' }}>
                                                            ₱ {ap.monthlyANP.toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: '600' }}>{ap.totalCases}</div>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: '600' }}>{ap.monthlyCases}</div>
                                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                            {performanceStatus === 'PERFORMING' ? '🎯 Performing' :
                                                                performanceStatus === 'AVERAGE' ? '📊 Average' :
                                                                    ap.monthlyCases === 0 ? '⚫ No policies issued' : '⚠️ Needs Improvement'}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge status-${performanceStatus.toLowerCase().replace(' ', '-')}`}>
                                                            {performanceStatus}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleViewAPDetails(ap)}
                                                            className="view-button"
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                                <button
                                    onClick={() => setShowAPsModal(false)}
                                    className="clear-filter-btn"
                                    style={{ padding: '10px 20px' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Policy Details Modal */}
            {showPolicyModal && selectedAL && (
                <div className="mp-modal">
                    <div className="mp-modal-content" style={{ maxWidth: '1000px', maxHeight: '90vh' }}>
                        <div className="mp-modal-header">
                            <div>
                                <h2>{selectedAL.name} - Policy Details</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    Policy distribution and monthly performance for {months[selectedMonth]} {selectedYear}
                                </p>
                            </div>
                            <button
                                className="mp-modal-close"
                                onClick={() => setShowPolicyModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="mp-modal-body">
                            {loadingPolicyDetails ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <div style={{ fontSize: '16px', color: '#64748b' }}>Loading policy details...</div>
                                </div>
                            ) : policyDetailsData ? (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                        <div>
                                            <h3 style={{ marginBottom: '16px', color: '#0f172a' }}>Policy Distribution</h3>
                                            <div style={{ height: '300px' }}>
                                                <Bar
                                                    data={{
                                                        labels: policyDetailsData.policyDistribution.map(p => p.policy_name),
                                                        datasets: [{
                                                            label: 'Policy Count',
                                                            data: policyDetailsData.policyDistribution.map(p => p.count),
                                                            backgroundColor: ['#003781', '#0055b8', '#4d7cff', '#ffc107', '#e74c3c', '#2c3e50'],
                                                            borderRadius: 6
                                                        }]
                                                    }}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            legend: { display: false }
                                                        },
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true,
                                                                ticks: {
                                                                    stepSize: 10
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <h3 style={{ margin: 0, color: '#0f172a' }}>Monthly Trend - {appliedFilters.year}</h3>
                                                <div style={{
                                                    background: '#e3f2fd',
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <span style={{ fontSize: '12px', color: '#0055b8', fontWeight: '600' }}>Total Cases:</span>
                                                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#003781' }}>
                                                        {policyDetailsData.totalCases + policyDetailsData.monthlyTrend.reduce((sum, m) => sum + (m.declined || 0), 0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ height: '300px' }}>
                                                <Bar
                                                    data={{
                                                        labels: months.map(m => m.substring(0, 3)),
                                                        datasets: [{
                                                            label: 'Total Cases',
                                                            data: policyDetailsData.monthlyTrend.map(m => m.policiesIssued + (m.declined || 0)),
                                                            backgroundColor: '#003781',
                                                            borderRadius: 6
                                                        }]
                                                    }}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            legend: { display: false }
                                                        },
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true,
                                                                ticks: {
                                                                    stepSize: 5
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <div style={{ fontSize: '16px', color: '#64748b' }}>No policy data available</div>
                                </div>
                            )}

                            <div className="mp-modal-summary-card" style={{
                                background: darkMode ? '#252525' : '#f8fafc',
                                padding: '20px',
                                borderRadius: '12px',
                                marginBottom: '20px',
                                border: darkMode ? '1px solid var(--border-subtle-dark)' : 'none'
                            }}>
                                <h4 style={{ marginBottom: '16px', color: darkMode ? '#FFFFFF' : '#0f172a' }}>Policy Statistics</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Total Policies</div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#0f172a' }}>
                                            {selectedAL.totalCases}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Current Month</div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#28a745' }}>
                                            {selectedAL.monthlyCases}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Monthly ANP</div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#0055b8' }}>
                                            ₱ {selectedAL.monthlyANP.toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Most Availed</div>
                                        <div style={{ fontSize: '16px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#0f172a' }}>
                                            {policyDetailsData && policyDetailsData.policyDistribution && policyDetailsData.policyDistribution.length > 0
                                                ? policyDetailsData.policyDistribution[0].policy_name
                                                : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h4 style={{ marginBottom: '16px', color: darkMode ? '#FFFFFF' : '#0f172a' }}>Policy Breakdown</h4>
                            <div className="modal-table-responsive">
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
                                        {policyDetailsData && policyDetailsData.policyDistribution && policyDetailsData.policyDistribution.length > 0 ? (
                                            policyDetailsData.policyDistribution.map((policy, index) => {
                                                return (
                                                    <tr key={policy.policy_name}>
                                                        <td>
                                                            <div style={{ fontWeight: '600' }}>{policy.policy_name}</div>
                                                        </td>
                                                        <td>
                                                            <span className="category-badge system">
                                                                System
                                                            </span>
                                                        </td>
                                                        <td style={{ fontWeight: '600', textAlign: 'center' }}>{policy.count}</td>
                                                        <td>
                                                            <div className="percentage-bar">
                                                                <div
                                                                    className="percentage-fill"
                                                                    style={{ width: `${policy.percentage}%` }}
                                                                ></div>
                                                                <span className="percentage-value">{policy.percentage}%</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontWeight: '600', color: '#28a745' }}>
                                                            ₱ {(policy.totalANP || 0).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                                    No policy data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                                <button
                                    onClick={() => setShowPolicyModal(false)}
                                    className="clear-filter-btn"
                                    style={{ padding: '10px 20px' }}
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPolicyModal(false);
                                        setShowAPsModal(true);
                                    }}
                                    className="apply-filter-btn"
                                    style={{ padding: '10px 20px' }}
                                >
                                    View APs Under This AL
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stat Details Modal */}
            {showStatDetailsModal && (
                <div className="mp-modal">
                    <div className="mp-modal-content" style={{ maxWidth: '800px' }}>
                        <div className="mp-modal-header">
                            <div>
                                <h2>Statistic Details</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    Detailed information for the selected statistic
                                </p>
                            </div>
                            <button
                                className="mp-modal-close"
                                onClick={() => setShowStatDetailsModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="mp-modal-body">
                            {renderStatDetails()}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                                <button
                                    onClick={() => setShowStatDetailsModal(false)}
                                    className="clear-filter-btn"
                                    style={{ padding: '10px 20px' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MPLayout>
    );
};

export default ALPerformance;