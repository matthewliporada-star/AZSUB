// APPerformance.jsx - FINAL UPDATED VERSION
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APPageSkeleton } from './MPSkeletons';
import { useMPData } from './MPData';
import MPLayout from './MPLayout';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import './MP_Styles.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const APPerformance = () => {
    const { apPerformance, loading, refreshData } = useMPData();
    const location = useLocation();
    const navigate = useNavigate();



    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [activityFilter, setActivityFilter] = useState('All');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [appliedFilters, setAppliedFilters] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        status: 'All',
        activity: 'All',
        search: ''
    });

    // State for modals
    const [showAPDetailsModal, setShowAPDetailsModal] = useState(false);
    const [showStatDetailsModal, setShowStatDetailsModal] = useState(false);
    const [selectedStat, setSelectedStat] = useState(null);
    const [selectedAP, setSelectedAP] = useState(null);

    // State for Stat History (Dashboard-like details)
    const [statHistoryCache, setStatHistoryCache] = useState({});
    const [loadingStatHistory, setLoadingStatHistory] = useState(false);
    const [currentHistoryData, setCurrentHistoryData] = useState(null);

    // State for monthly ANP trend data
    const [monthlyANPData, setMonthlyANPData] = useState(Array(12).fill(0));
    const [monthlyANPCache, setMonthlyANPCache] = useState({});
    const [loadingChart, setLoadingChart] = useState(false);

    // Month names
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];

    // Fetch monthly ANP trend when year changes
    useEffect(() => {
        fetchMonthlyANPTrend();
    }, [appliedFilters.year]);

    // Function to fetch monthly ANP trend data - OPTIMIZED with caching
    const fetchMonthlyANPTrend = useCallback(async () => {
        const cacheKey = appliedFilters.year.toString();

        // Check cache first - prevents redundant API calls
        if (monthlyANPCache[cacheKey]) {
            setMonthlyANPData(monthlyANPCache[cacheKey]);
            return;
        }

        setLoadingChart(true);
        try {
            const response = await fetch(
                `http://localhost:3000/api/mp/dashboard-stats?year=${appliedFilters.year}&month=${appliedFilters.month}`
            );
            const result = await response.json();
            if (result.success && result.data.monthlyTrend) {
                // Extract ANP values from monthlyTrend (convert to thousands)
                const anpData = result.data.monthlyTrend.map(m => Math.round(m.anp / 1000));
                setMonthlyANPData(anpData);
                // Cache the result for future use
                setMonthlyANPCache(prev => ({ ...prev, [cacheKey]: anpData }));
            }
        } catch (error) {
            console.error('Error fetching monthly ANP trend:', error);
        } finally {
            setLoadingChart(false);
        }
    }, [appliedFilters.year, appliedFilters.month, monthlyANPCache]);

    // Check for AP details from navigation
    useEffect(() => {
        if (location.state?.selectedAP) {
            setSelectedAP(location.state.selectedAP);
            setSelectedMonth(location.state.selectedMonth || new Date().getMonth());
            setSelectedYear(location.state.selectedYear || currentYear);
            setShowAPDetailsModal(true);
        }
    }, [location.state]);

    // Apply filters
    const applyFilters = () => {
        setAppliedFilters({
            month: selectedMonth,
            year: selectedYear,
            status: statusFilter,
            activity: activityFilter,
            search: searchTerm
        });
        refreshData(selectedMonth, selectedYear);
    };

    // Clear filters
    const clearFilters = () => {
        setSelectedMonth(new Date().getMonth());
        setSelectedYear(currentYear);
        setStatusFilter('All');
        setActivityFilter('All');
        setSearchTerm('');
        setAppliedFilters({
            month: new Date().getMonth(),
            year: currentYear,
            status: 'All',
            activity: 'All',
            search: ''
        });
    };

    // Get AP performance status based on policies issued
    const getAPPerformanceStatus = (monthlyCases) => {
        if (monthlyCases >= 7) return 'PERFORMING';
        if (monthlyCases >= 4) return 'AVERAGE';
        return 'NEEDS IMPROVEMENT';
    };

    // Get AP activity status (Active if issued at least 1 policy)
    const getAPActivityStatus = (monthlyCases) => {
        return monthlyCases > 0 ? 'Active' : 'Inactive';
    };

    // Handle View AP Details
    const handleViewAPDetails = (ap) => {
        setSelectedAP(ap);
        setShowAPDetailsModal(true);
    };

    // Handle Stat Card Click
    const handleStatCardClick = (statType) => {
        setSelectedStat(statType);
        setShowStatDetailsModal(true);
    };

    // Filter APs based on applied filters - MEMOIZED
    const filteredAPs = useMemo(() => {
        return apPerformance.filter(ap => {
            // Status filter
            if (appliedFilters.status !== 'All') {
                const performanceStatus = getAPPerformanceStatus(ap.monthlyCases);
                if (performanceStatus !== appliedFilters.status) {
                    return false;
                }
            }

            // Activity filter
            if (appliedFilters.activity !== 'All') {
                const activityStatus = getAPActivityStatus(ap.monthlyCases);
                if (activityStatus !== appliedFilters.activity) {
                    return false;
                }
            }

            // Search filter
            if (appliedFilters.search &&
                !ap.name.toLowerCase().includes(appliedFilters.search.toLowerCase()) &&
                !ap.alName.toLowerCase().includes(appliedFilters.search.toLowerCase()) &&
                !ap.city.toLowerCase().includes(appliedFilters.search.toLowerCase())) {
                return false;
            }

            return true;
        });
    }, [apPerformance, appliedFilters]);

    // Calculate statistics based on filtered data
    const totalAPs = filteredAPs.length;
    const activeAPs = filteredAPs.filter(ap => ap.monthlyCases > 0).length;
    const performingAPs = filteredAPs.filter(ap => getAPPerformanceStatus(ap.monthlyCases) === 'PERFORMING').length;
    const totalANP = filteredAPs.reduce((sum, ap) => sum + ap.totalANP, 0);
    const monthlyANP = filteredAPs.reduce((sum, ap) => sum + ap.monthlyANP, 0);
    const avgMonthlyCases = totalAPs > 0 ? filteredAPs.reduce((sum, ap) => sum + ap.monthlyCases, 0) / totalAPs : 0;

    // Fetch historical data for stat details
    useEffect(() => {
        if (showStatDetailsModal && selectedStat) {
            // Map selectedStat to backend supported types
            let backendStatType = selectedStat;
            if (selectedStat === 'avgMonthlyCases') backendStatType = 'totalCases'; // Map 'avgMonthlyCases' (Monthly Cases Card) to 'totalCases' history

            if (['totalANP', 'totalCases'].includes(backendStatType)) {
                fetchStatHistoryData(backendStatType).then(data => setCurrentHistoryData(data));
            } else {
                setCurrentHistoryData(null);
            }
        }
    }, [showStatDetailsModal, selectedStat, appliedFilters.year, appliedFilters.month]);

    const fetchStatHistoryData = async (statType) => {
        const cacheKey = `${statType}_${appliedFilters.year}_${appliedFilters.month}`;
        if (statHistoryCache[cacheKey]) return statHistoryCache[cacheKey];

        setLoadingStatHistory(true);
        try {
            const response = await fetch(
                `http://localhost:3000/api/mp/monthly-history?year=${appliedFilters.year}&month=${appliedFilters.month}&statType=${statType}&view=ap`
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
        if (!['totalANP', 'avgMonthlyCases'].includes(selectedStat)) {
            switch (selectedStat) {
                case 'totalAPs':
                    return (
                        <div>
                            <h3>Total Agency Partners Details</h3>
                            <p>Showing detailed information about all Agency Partners in the network.</p>
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Total APs:</span>
                                    <span className="info-value">{totalAPs}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Active APs:</span>
                                    <span className="info-value">{activeAPs}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Inactive APs:</span>
                                    <span className="info-value">{totalAPs - activeAPs}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Active Rate:</span>
                                    <span className="info-value">{(totalAPs > 0 ? (activeAPs / totalAPs * 100).toFixed(1) : 0)}%</span>
                                </div>
                            </div>
                        </div>
                    );
                case 'activeAPs':
                    return (
                        <div>
                            <h3>Active Agency Partners Details</h3>
                            <p>Agency Partners who have issued at least 1 policy this month.</p>
                            <table className="performance-table">
                                <thead>
                                    <tr>
                                        <th>AP Name</th>
                                        <th>Agency Leader</th>
                                        <th>Monthly Cases</th>
                                        <th>Monthly ANP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAPs.filter(ap => ap.monthlyCases > 0).slice(0, 10).map(ap => (
                                        <tr key={ap.id}>
                                            <td>{ap.name}</td>
                                            <td>{ap.alName}</td>
                                            <td>{ap.monthlyCases}</td>
                                            <td>₱ {ap.monthlyANP.toLocaleString()}</td>
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

        // Logic for Chart-supported stats
        if (loadingStatHistory) {
            return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading statistics history...</div>;
        }

        if (!currentHistoryData) {
            return <div style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>Failed to load history data.</div>;
        }

        const monthlyIssuedSum = filteredAPs.reduce((sum, ap) => sum + ap.monthlyCases, 0);
        const monthlyDeclinedSum = filteredAPs.reduce((sum, ap) => sum + (ap.monthlyDeclined || 0), 0);

        return (
            <div>
                <h3 style={{ marginBottom: '8px', color: '#0f172a' }}>{currentHistoryData.title}</h3>
                <p style={{ marginBottom: '24px', color: '#64748b', fontSize: '14px' }}>
                    {selectedStat === 'avgMonthlyCases'
                        ? `Total Policies (Issued + Declined) - ${currentMonth} ${appliedFilters.year}`
                        : selectedStat === 'totalANP'
                            ? `Year-to-Date Cumulative - ${appliedFilters.year}`
                            : `Historical Data - ${currentMonth} ${appliedFilters.year}`
                    }
                </p>

                <div style={{
                    background: '#f8fafc',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        <div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                {selectedStat === 'totalANP' ? 'Total Cumulative ANP' : 'Current Value'}
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                                {selectedStat === 'avgMonthlyCases' ? (
                                    <>
                                        {(monthlyIssuedSum + monthlyDeclinedSum).toLocaleString()}
                                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>
                                            {monthlyIssuedSum.toLocaleString()} Issued · {monthlyDeclinedSum.toLocaleString()} Declined
                                        </div>
                                    </>
                                ) : (
                                    `₱ ${(currentHistoryData?.currentValue || 0).toLocaleString()}`
                                )}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Yearly Change</div>
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
        return <APPageSkeleton />;
    }

    return (
        <MPLayout title="Agent Partners Performance">
            {/* Header with Filters - Matching MPDashboard style */}

            <div className="mp-filters">
                <div className="filter-group">
                    <label>Search AP/AL</label>
                    <input
                        type="text"
                        placeholder="Search by name, AL, or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mp-search-input"
                    />
                </div>

                <div className="filter-group">
                    <label>Performance</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="mp-filter-select"
                    >
                        <option value="All">All Performance</option>
                        <option value="PERFORMING">Performing</option>
                        <option value="AVERAGE">Average</option>
                        <option value="NEEDS IMPROVEMENT">Needs Improvement</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Activity</label>
                    <select
                        value={activityFilter}
                        onChange={(e) => setActivityFilter(e.target.value)}
                        className="mp-filter-select"
                    >
                        <option value="All">All Activity</option>
                        <option value="Active">Active Only</option>
                        <option value="Inactive">Inactive Only</option>
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
                    className="stat-card hover-card"
                    style={{ borderLeft: '4px solid #003781', cursor: 'pointer' }}
                    onClick={() => handleStatCardClick('totalAPs')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div className="stat-label">Total Agency Partners</div>
                    <div className="stat-value">{totalAPs}</div>
                    <div className="stat-subtext">In network</div>
                </div>

                <div
                    className="stat-card hover-card"
                    style={{ borderLeft: '4px solid #28a745', cursor: 'pointer' }}
                    onClick={() => handleStatCardClick('activeAPs')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div className="stat-label">Active APs</div>
                    <div className="stat-value">{activeAPs}</div>
                    <div className="stat-subtext">{(totalAPs > 0 ? (activeAPs / totalAPs * 100).toFixed(1) : 0)}% Active Rate</div>
                </div>

                <div
                    className="stat-card hover-card"
                    style={{ borderLeft: '4px solid #0055b8', cursor: 'pointer' }}
                    onClick={() => handleStatCardClick('totalANP')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div className="stat-label">Total ANP</div>
                    <div className="stat-value">₱ {totalANP.toLocaleString()}</div>
                    <div className="stat-subtext">Cumulative from APs</div>
                </div>

                <div
                    className="stat-card hover-card"
                    style={{ borderLeft: '4px solid #f39c12', cursor: 'pointer' }}
                    onClick={() => handleStatCardClick('avgMonthlyCases')}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div className="stat-label">Monthly Cases</div>
                    <div className="stat-value">{(filteredAPs.reduce((sum, ap) => sum + ap.monthlyCases, 0) + filteredAPs.reduce((sum, ap) => sum + (ap.monthlyDeclined || 0), 0)).toLocaleString()}</div>
                    <div className="stat-subtext" style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                        {filteredAPs.reduce((sum, ap) => sum + ap.monthlyCases, 0).toLocaleString()} Issued · {filteredAPs.reduce((sum, ap) => sum + (ap.monthlyDeclined || 0), 0).toLocaleString()} Declined
                    </div>
                </div>
            </div>

            {/* Charts Section - Container Style */}
            <div className="content-container">
                <div className="charts-grid">
                    <div className="chart-container">
                        <div className="chart-header">
                            <div className="chart-title">AP Performance Distribution</div>
                            <div className="chart-subtitle">Performance levels across all APs</div>
                        </div>
                        <div className="chart-wrapper">
                            <Doughnut
                                data={{
                                    labels: ['PERFORMING', 'AVERAGE', 'NEEDS IMPROVEMENT', 'INACTIVE'],
                                    datasets: [{
                                        data: [
                                            filteredAPs.filter(ap => getAPPerformanceStatus(ap.monthlyCases) === 'PERFORMING').length,
                                            filteredAPs.filter(ap => getAPPerformanceStatus(ap.monthlyCases) === 'AVERAGE').length,
                                            filteredAPs.filter(ap => getAPPerformanceStatus(ap.monthlyCases) === 'NEEDS IMPROVEMENT' && ap.monthlyCases > 0).length,
                                            filteredAPs.filter(ap => ap.monthlyCases === 0).length
                                        ],
                                        backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d']
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'bottom' }
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="chart-container">
                        <div className="chart-header">
                            <div className="chart-title">Monthly ANP Trend - {appliedFilters.year}</div>
                            <div className="chart-subtitle">ANP generated by month</div>
                        </div>
                        <div className="chart-wrapper">
                            <Bar
                                data={{
                                    labels: months.map(m => m.substring(0, 3)),
                                    datasets: [{
                                        label: 'ANP (Thousands)',
                                        data: monthlyANPData,
                                        backgroundColor: '#0055b8',
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
                                                callback: function (value) {
                                                    return '₱ ' + value;
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table - Container Style */}
            <div className="content-container">
                <div className="container-header">
                    <h2>Agency Partners Detailed View - {months[appliedFilters.month]} {appliedFilters.year}</h2>
                    <div className="card-header-stats">
                        <span className="stat-badge">Showing: {filteredAPs.length} of {apPerformance.length}</span>
                        <span className="stat-badge status-active">Active: {activeAPs}</span>
                        <span className="stat-badge status-performing">Performing: {performingAPs}</span>
                    </div>
                </div>
                <div className="container-body">
                    <table className="mp-al-table">
                        <thead>
                            <tr>
                                <th>AP Name</th>
                                <th>Agency Leader</th>
                                <th>City</th>
                                <th>Activity Status</th>
                                <th>Last Activity</th>
                                <th>Total ANP</th>
                                <th>Monthly ANP</th>
                                <th>Total Cases</th>
                                <th>Monthly Cases</th>
                                <th>Performance Status</th>
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
                                                <div className="agent-detail">{ap.city}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{ap.alName}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{ap.city}</div>
                                        </td>
                                        <td>
                                            <div className="activity-status-cell">
                                                <span className={`activity-dot ${activityStatus.toLowerCase()}`}></span>
                                                <span>{activityStatus}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{ap.lastActivity}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                {activityStatus === 'Active' ? 'Recently active' : 'No recent activity'}
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
                                            <div style={{ fontWeight: '600' }}>
                                                {ap.monthlyCases + (ap.monthlyDeclined || 0)}
                                            </div>
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
                <div className="mp-modal">
                    <div className="mp-modal-content" style={{ maxWidth: '800px' }}>
                        <div className="mp-modal-header">
                            <div>
                                <h2>AP Details - {selectedAP.name}</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    Complete information and performance metrics
                                </p>
                            </div>
                            <button
                                className="mp-modal-close"
                                onClick={() => setShowAPDetailsModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="mp-modal-body">
                            <div style={{
                                background: '#f8fafc',
                                padding: '20px',
                                borderRadius: '12px',
                                marginBottom: '20px'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>AP Name</div>
                                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                                            {selectedAP.name}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>Agency Leader</div>
                                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                                            {selectedAP.alName}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>License Number</div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                                            {selectedAP.licenseNumber}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>Contact Number</div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
                                            {selectedAP.contactNumber}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h4 style={{ marginBottom: '16px', color: '#0f172a' }}>Performance Metrics</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                <div style={{
                                    background: '#e3f2fd',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#0055b8' }}>Monthly Cases</div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                                        {selectedAP.monthlyCases + (selectedAP.monthlyDeclined || 0)}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        {getAPPerformanceStatus(selectedAP.monthlyCases)} Status
                                    </div>
                                </div>

                                <div style={{
                                    background: '#d4edda',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#155724' }}>Monthly ANP</div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                                        ₱ {selectedAP.monthlyANP.toLocaleString()}
                                    </div>

                                </div>

                                <div style={{
                                    background: '#fff3cd',
                                    padding: '16px',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '12px', color: '#856404' }}>Total Cases</div>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
                                        {selectedAP.totalCases}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        All-time
                                    </div>
                                </div>
                            </div>

                            <h4 style={{ marginBottom: '16px', color: '#0f172a' }}>Additional Information</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>City</div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                        {selectedAP.city}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Join Date</div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                        {selectedAP.joinDate}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Last Activity</div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                        {selectedAP.lastActivity}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Activity Status</div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                        <span className={`status-badge ${getAPActivityStatus(selectedAP.monthlyCases) === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                            {getAPActivityStatus(selectedAP.monthlyCases)}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Performance Status</div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                                        <span className={`status-badge status-${getAPPerformanceStatus(selectedAP.monthlyCases).toLowerCase().replace(' ', '-')}`}>
                                            {getAPPerformanceStatus(selectedAP.monthlyCases)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                                <button
                                    onClick={() => setShowAPDetailsModal(false)}
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

export default APPerformance;