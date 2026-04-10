// MD-Dashboard.jsx - Complete version matching MP dashboard structure
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import MDLayout from './MDLayout';
import { DashboardSkeleton } from './MDSkeletons';
import { useMDData } from './MDData';
import './MD_Styles.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, PointElement, LineElement, Filler);

const Sparkline = ({ data, color = '#3b82f6' }) => {
    const chartData = {
        labels: data.map((_, i) => i),
        datasets: [{
            data: data,
            borderColor: color,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 40);
                gradient.addColorStop(0, `${color}33`);
                gradient.addColorStop(1, `${color}00`);
                return gradient;
            },
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } }
    };

    return (
        <div className="sparkline-container">
            <Line data={chartData} options={options} />
        </div>
    );
};

const MDDashboard = () => {
    const { darkMode } = useApp();
    const { mpPerformance, alPerformance, apPerformance, mdStats, refreshData, fetchMonthlyHistory, fetchPolicyDetails, loading, error } = useMDData();
    const navigate = useNavigate();
    
    const [viewMode, setViewMode] = useState('overview');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [appliedFilters, setAppliedFilters] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear()
    });

    // State for modals (same structure as MP dashboard)
    const [showMPsModal, setShowMPsModal] = useState(false);
    const [showALsModal, setShowALsModal] = useState(false);
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [showStatDetailsModal, setShowStatDetailsModal] = useState(false);
    const [selectedStat, setSelectedStat] = useState(null);
    const [selectedMP, setSelectedMP] = useState(null);
    const [selectedAL, setSelectedAL] = useState(null);

    // State for policy details data
    const [policyDetailsData, setPolicyDetailsData] = useState(null);
    const [loadingPolicyDetails, setLoadingPolicyDetails] = useState(false);

    // State for statistics history data
    const [statHistoryCache, setStatHistoryCache] = useState({});
    const [loadingStatHistory, setLoadingStatHistory] = useState(false);
    const [currentHistoryData, setCurrentHistoryData] = useState(null);

    // State for stat card trends (percentage changes)
    const [statTrends, setStatTrends] = useState({});
    const [statTrendsCache, setStatTrendsCache] = useState({});
    const [loadingTrends, setLoadingTrends] = useState(false);

    // Fetch history data when selectedStat changes (same as MP)
    useEffect(() => {
        if (selectedStat && showStatDetailsModal) {
            fetchStatHistoryData(selectedStat).then(data => setCurrentHistoryData(data));
        }
    }, [selectedStat, appliedFilters.year, appliedFilters.month, showStatDetailsModal]);

    // Fetch stat trends for all cards when filters change
    useEffect(() => {
        fetchAllStatTrends();
    }, [appliedFilters.year, appliedFilters.month]);

    // Function to fetch trends for all stat cards (same as MP)
    const fetchAllStatTrends = useCallback(async () => {
        const cacheKey = `${appliedFilters.year}_${appliedFilters.month}`;

        if (statTrendsCache[cacheKey]) {
            setStatTrends(statTrendsCache[cacheKey]);
            return;
        }

        setLoadingTrends(true);
        const statTypes = ['totalMPs', 'totalMPANP', 'totalMPPolicies', 'avgActivityRatio', 'monthlyMPANP'];
        const trends = {};

        await Promise.all(
            statTypes.map(async (statType) => {
                try {
                    const response = await fetch(
                        `http://localhost:3000/api/md/monthly-history?statType=${statType}&year=${appliedFilters.year}&month=${appliedFilters.month}`
                    );
                    const result = await response.json();
                    if (result.success && result.data) {
                        trends[statType] = {
                            yearlyChange: result.data.yearlyChange || 0,
                            trend: result.data.trend || 'stable'
                        };
                    }
                } catch (error) {
                    console.error(`Error fetching trend for ${statType}:`, error);
                }
            })
        );

        setStatTrends(trends);
        setStatTrendsCache(prev => ({ ...prev, [cacheKey]: trends }));
        setLoadingTrends(false);
    }, [appliedFilters.year, appliedFilters.month, statTrendsCache]);

    // Month names for filter
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Generate years for filter
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];

    // Apply filters
    const applyFilters = () => {
        setAppliedFilters({
            month: selectedMonth,
            year: selectedYear
        });
        refreshData(selectedMonth, selectedYear);
    };

    // Clear filters
    const clearFilters = () => {
        setSelectedMonth(new Date().getMonth());
        setSelectedYear(currentYear);
        setAppliedFilters({
            month: new Date().getMonth(),
            year: currentYear
        });
        refreshData(new Date().getMonth(), currentYear);
    };

    // Fetch historical data for stat cards (same as MP)
    const fetchStatHistoryData = async (statType) => {
        const cacheKey = `${statType}_${appliedFilters.year}_${appliedFilters.month}`;
        if (statHistoryCache[cacheKey]) {
            return statHistoryCache[cacheKey];
        }

        setLoadingStatHistory(true);
        try {
            const response = await fetch(
                `http://localhost:3000/api/md/monthly-history?statType=${statType}&year=${appliedFilters.year}&month=${appliedFilters.month}`
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

    // Helper function to format stat trend display (same as MP)
    const formatStatTrend = (statType) => {
        if (loadingTrends) return { arrow: '', percentage: '...', className: 'loading' };

        const trend = statTrends[statType];
        if (!trend) return { arrow: '', percentage: '0.0%', className: 'stable' };

        const arrow = trend.trend === 'up' ? '↑' : trend.trend === 'down' ? '↓' : '→';
        const percentage = `${Math.abs(trend.yearlyChange).toFixed(1)}%`;
        const className = trend.trend === 'up' ? 'up' : trend.trend === 'down' ? 'down' : 'stable';

        return { arrow, percentage, className };
    };

    // Get top performing MPs
    const topPerformers = useMemo(() => {
        return [...(mpPerformance || [])]
            .sort((a, b) => (b.monthlyANP || 0) - (a.monthlyANP || 0))
            .slice(0, 5);
    }, [mpPerformance]);

    // Handle View MPs Modal
    const handleViewMPsModal = (mp) => {
        setSelectedMP(mp);
        setShowMPsModal(true);
    };

    // Handle View ALs Modal
    const handleViewALsModal = (al) => {
        setSelectedAL(al);
        setShowALsModal(true);
    };

    // Handle View Policy Details Modal
    const handleViewPolicyDetails = async (mp) => {
        setSelectedMP(mp);
        setShowPolicyModal(true);

        setLoadingPolicyDetails(true);
        try {
            const data = await fetchPolicyDetails(mp.id, appliedFilters.year);
            setPolicyDetailsData(data);
        } catch (error) {
            console.error('Error fetching policy details:', error);
        } finally {
            setLoadingPolicyDetails(false);
        }
    };

    // Handle Stat Card Click (same as MP)
    const handleStatCardClick = (statType) => {
        setSelectedStat(statType);
        setShowStatDetailsModal(true);
    };

    // Get AP performance status
    const getAPPerformanceStatus = (monthlyCases) => {
        if (monthlyCases >= 7) return 'PERFORMING';
        if (monthlyCases >= 4) return 'AVERAGE';
        return 'NEEDS IMPROVEMENT';
    };

    // Get ALs under selected MP
    const getALsUnderMP = (mpId) => {
        return (alPerformance || []).filter(al => al.mpId === mpId);
    };

    // Get APs by AL name
    const getAPsByAL = (alName) => {
        return (apPerformance || []).filter(ap => ap.alName === alName);
    };

    // Get data from mdStats (same structure as MP)
    const totalMPs = mdStats?.totalMPs || 0;
    const totalANP = mdStats?.totalMPANP || 0;
    const totalCases = mdStats?.totalMPPolicies || 0;
    const avgActivityRatio = mdStats?.avgActivityRatio || 0;
    const monthlyANP = mdStats?.monthSpecificStats?.monthlyANP || 0;
    const monthlyPolicies = mdStats?.monthSpecificStats?.totalPolicies || 0;
    const monthlyDeclined = mdStats?.monthSpecificStats?.monthlyDeclined || 0;
    const totalALs = mdStats?.totalALs || 0;
    const performingALs = mdStats?.performingALs || 0;
    const totalAPs = mdStats?.totalAPs || 0;
    const activeAPs = mdStats?.activeAPs || 0;

    // Calculate AP averages (same as MP)
    const apAvgActivity = totalAPs > 0 ? (activeAPs / totalAPs) * 100 : 0;
    const apAvgANP = activeAPs > 0 ? monthlyANP / activeAPs : 0;

    // Use chart data from mdStats
    const mostAvailedPolicies = useMemo(() => mdStats?.policyDistribution || [], [mdStats?.policyDistribution]);
    const monthlyIssuedPolicies = useMemo(() => mdStats?.monthlyTrend || [], [mdStats?.monthlyTrend]);

    const selectedMonthYear = `${months[appliedFilters.month]} ${appliedFilters.year}`;
    const monthSpecificStats = {
        monthlyANP: monthlyANP,
        totalPolicies: monthlyPolicies,
        monthlyDeclined: monthlyDeclined,
        activityRatio: avgActivityRatio
    };

    // Chart data for most availed policies
    const policyChartData = useMemo(() => ({
        labels: mostAvailedPolicies.map(p => p.policy_name),
        datasets: [{
            label: 'Number of Policies',
            data: mostAvailedPolicies.map(p => p.count),
            backgroundColor: ['#002B5C', '#004080', '#4d7cff', '#7ba0ff', '#a3c1ff', '#d1e0ff'],
            borderRadius: 6
        }]
    }), [mostAvailedPolicies]);

    // Monthly issued chart data
    const monthlyChartData = useMemo(() => ({
        labels: monthlyIssuedPolicies.map(m => m.month),
        datasets: [
            {
                label: 'Total Cases',
                data: monthlyIssuedPolicies.map(m => (m.issued || 0) + (m.declined || 0)),
                backgroundColor: '#002B5C',
                borderRadius: 6,
                yAxisID: 'y'
            },
            {
                label: 'ANP',
                data: monthlyIssuedPolicies.map(m => (m.anp || 0)),
                backgroundColor: '#28a745',
                borderRadius: 6,
                yAxisID: 'y1'
            }
        ]
    }), [monthlyIssuedPolicies]);

    // Loading and Error states
    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <MDLayout title="Dashboard Overview">
                <div style={{ padding: '24px', color: 'red' }}>Error loading data: {error}</div>
            </MDLayout>
        );
    }

    // Render stat details modal content (same structure as MP)
    const renderStatDetails = () => {
        if (!selectedStat) return null;

        const currentMonth = months[appliedFilters.month];

        if (loadingStatHistory) {
            return (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '16px', color: '#64748b' }}>Loading statistics history...</div>
                </div>
            );
        }

        if (!currentHistoryData && selectedStat !== 'apAvgActivity' && selectedStat !== 'apAvgANP') {
            return (
                <div>
                    <h3 style={{ marginBottom: '8px', color: darkMode ? '#FFFFFF' : '#0f172a' }}>
                        {selectedStat === 'totalANP' ? 'Total ANP' : 
                         selectedStat === 'totalCases' ? 'Total Cases' : 
                         selectedStat === 'avgActivityRatio' ? 'Avg Activity Ratio' :
                         selectedStat === 'totalMPs' ? 'Total Management Partners' :
                         selectedStat === 'monthlyANP' ? `${months[appliedFilters.month]} ANP` : 
                         selectedStat === 'monthlyCases' ? 'Monthly Cases' : 'Statistics'}
                    </h3>
                    <p style={{ marginBottom: '24px', color: darkMode ? '#94A3B8' : '#64748b', fontSize: '14px' }}>
                        Current value for {currentMonth} {appliedFilters.year}
                    </p>
                    <div className="stats-summary-card" style={{
                        background: darkMode ? '#161B22' : '#f8fafc',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        border: darkMode ? '1px solid var(--border-subtle-dark)' : 'none'
                    }}>
                        <div className="summary-label" style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Current Value</div>
                        <div className="stat-current-value" style={{ fontSize: '32px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#0f172a' }}>
                            {selectedStat === 'totalANP' && `₱ ${totalANP.toLocaleString()}`}
                            {selectedStat === 'totalCases' && totalCases.toLocaleString()}
                            {selectedStat === 'avgActivityRatio' && `${avgActivityRatio}%`}
                            {selectedStat === 'totalMPs' && totalMPs.toLocaleString()}
                            {selectedStat === 'monthlyANP' && `₱ ${monthlyANP.toLocaleString()}`}
                            {selectedStat === 'monthlyCases' && `${(monthlyPolicies + monthlyDeclined).toLocaleString()}`}
                        </div>
                    </div>
                </div>
            );
        }

        // For AP Avg Activity and AP Avg ANP
        if (selectedStat === 'apAvgActivity') {
            return (
                <div>
                    <h3 style={{ marginBottom: '8px', color: darkMode ? '#FFFFFF' : '#0f172a' }}>AP Average Activity</h3>
                    <p style={{ marginBottom: '24px', color: darkMode ? '#94A3B8' : '#64748b', fontSize: '14px' }}>
                        Average activity percentage across all Agency Partners - {currentMonth} {appliedFilters.year}
                    </p>
                    <div className="stats-summary-card" style={{
                        background: darkMode ? '#161B22' : '#f8fafc',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        border: darkMode ? '1px solid var(--border-subtle-dark)' : 'none'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                            <div>
                                <div className="summary-label" style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Current Value</div>
                                <div className="stat-current-value" style={{ fontSize: '24px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#0f172a' }}>
                                    {apAvgActivity.toFixed(1)}%
                                </div>
                            </div>
                            <div>
                                <div className="summary-label" style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Total APs</div>
                                <div className="stat-current-value" style={{ fontSize: '24px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#0f172a' }}>
                                    {totalAPs.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (selectedStat === 'apAvgANP') {
            return (
                <div>
                    <h3 style={{ marginBottom: '8px', color: darkMode ? '#FFFFFF' : '#0f172a' }}>AP Average ANP</h3>
                    <p style={{ marginBottom: '24px', color: darkMode ? '#94A3B8' : '#64748b', fontSize: '14px' }}>
                        Average monthly ANP per active Agency Partner - {currentMonth} {appliedFilters.year}
                    </p>
                    <div className="stats-summary-card" style={{
                        background: darkMode ? '#161B22' : '#f8fafc',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        border: darkMode ? '1px solid var(--border-subtle-dark)' : 'none'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                            <div>
                                <div className="summary-label" style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Current Value</div>
                                <div className="stat-current-value" style={{ fontSize: '24px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#0f172a' }}>
                                    ₱ {apAvgANP.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                            <div>
                                <div className="summary-label" style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Active APs</div>
                                <div className="stat-current-value" style={{ fontSize: '24px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#0f172a' }}>
                                    {activeAPs.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // For stats with history data
        return (
            <div>
                <h3 style={{ marginBottom: '8px', color: darkMode ? '#FFFFFF' : '#0f172a' }}>{currentHistoryData?.title}</h3>
                <p style={{ marginBottom: '24px', color: darkMode ? '#94A3B8' : '#64748b', fontSize: '14px' }}>
                    {currentHistoryData?.description} - {currentMonth} {appliedFilters.year}
                </p>

                <div className="stats-summary-card" style={{
                    background: darkMode ? '#161B22' : '#f8fafc',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    border: darkMode ? '1px solid var(--border-subtle-dark)' : 'none'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        <div>
                            <div className="summary-label" style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Current Value</div>
                            <div className="stat-current-value" style={{ fontSize: '24px', fontWeight: '700', color: darkMode ? '#FFFFFF' : '#0f172a' }}>
                                {currentHistoryData?.prefix || ''}{currentHistoryData?.currentValue?.toLocaleString() || 0} {currentHistoryData?.unit || ''}
                            </div>
                        </div>
                        <div>
                            <div className="summary-label" style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Yearly Change</div>
                            <div className="stat-yearly-change" style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: currentHistoryData?.trend === 'up' ? '#28a745' :
                                    currentHistoryData?.trend === 'down' ? '#dc3545' : '#6c757d'
                            }}>
                                {currentHistoryData?.trend === 'up' && '+'}{currentHistoryData?.yearlyChange?.toFixed(1) || 0}%
                            </div>
                        </div>
                    </div>
                </div>

                <h4 style={{ marginBottom: '16px', color: darkMode ? '#FFFFFF' : '#0f172a' }}>Monthly History</h4>
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
                            {currentHistoryData?.monthlyData?.map((item, index) => {
                                const prevValue = index > 0 ? currentHistoryData.monthlyData[index - 1].value : item.value;
                                const change = prevValue > 0 ? ((item.value - prevValue) / prevValue * 100).toFixed(1) : 0;
                                return (
                                    <tr key={item.month}>
                                        <td>
                                            <div style={{ fontWeight: '600', color: darkMode ? '#FFFFFF' : '#0f172a' }}>{item.month}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600', color: darkMode ? '#FFFFFF' : '#0f172a' }}>
                                                {currentHistoryData.prefix || ''}{item.value.toLocaleString()} {currentHistoryData.unit || ''}
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
                    <h4 style={{ marginBottom: '16px', color: darkMode ? '#FFFFFF' : '#0f172a' }}>Trend Visualization</h4>
                    <div style={{ height: '200px' }}>
                        <Bar
                            data={{
                                labels: currentHistoryData.monthlyData?.map(d => d.month) || [],
                                datasets: [{
                                    label: currentHistoryData.title,
                                    data: currentHistoryData.monthlyData?.map(d => d.value) || [],
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
                                            callback: function(value) {
                                                return value.toLocaleString();
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

    // Render the overview (same structure as MP)
    const renderOverview = () => (
        <>
            {/* Filters with Apply Button */}
            <div className="md-filters">
                <div className="filter-group">
                    <label>SELECT MONTH:</label>
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
                    <label>SELECT YEAR:</label>
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

            {/* Master Container - Wraps all dashboard content */}
            <div className="dashboard-content-wrapper">
                {/* Row 1 - Main MP Stats */}
                <div className="dashboard-grid">
                    <div
                        className="stat-card hover-card"
                        onClick={() => handleStatCardClick('totalMPs')}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <div className="stat-info">
                            <div className="stat-header">
                                <div className="stat-label">TOTAL MANAGEMENT PARTNERS</div>
                                <div className={`stat-trend ${formatStatTrend('totalMPs').className}`}>
                                    {formatStatTrend('totalMPs').arrow} {formatStatTrend('totalMPs').percentage}
                                </div>
                            </div>
                            <div className="stat-value">{totalMPs.toLocaleString()}</div>
                            <div className="stat-subtext">Active in network</div>
                        </div>
                        <Sparkline data={[6, 7, 7, 8, 8, totalMPs]} color="#3b82f6" />
                    </div>

                    <div
                        className="stat-card hover-card"
                        onClick={() => handleStatCardClick('totalANP')}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <div className="stat-info">
                            <div className="stat-header">
                                <div className="stat-label">TOTAL ANP</div>
                                <div className={`stat-trend ${formatStatTrend('totalMPANP').className}`}>
                                    {formatStatTrend('totalMPANP').arrow} {formatStatTrend('totalMPANP').percentage}
                                </div>
                            </div>
                            <div className="stat-value">₱ {totalANP.toLocaleString()}</div>
                            <div className="stat-subtext">All-time annual premium</div>
                        </div>
                        <Sparkline data={[8500000, 9200000, 10100000, 11800000, 12500000, totalANP]} color="#27ae60" />
                    </div>

                    <div
                        className="stat-card hover-card"
                        onClick={() => handleStatCardClick('totalCases')}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <div className="stat-info">
                            <div className="stat-header">
                                <div className="stat-label">TOTAL CASES</div>
                                <div className={`stat-trend ${formatStatTrend('totalMPPolicies').className}`}>
                                    {formatStatTrend('totalMPPolicies').arrow} {formatStatTrend('totalMPPolicies').percentage}
                                </div>
                            </div>
                            <div className="stat-value">{totalCases.toLocaleString()}</div>
                            <div className="stat-subtext">All-time policies issued</div>
                        </div>
                        <Sparkline data={[420, 480, 520, 590, 630, totalCases]} color="#60a5fa" />
                    </div>

                    <div
                        className="stat-card hover-card"
                        onClick={() => handleStatCardClick('avgActivityRatio')}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <div className="stat-info">
                            <div className="stat-header">
                                <div className="stat-label">AVG ACTIVITY RATIO</div>
                                <div className={`stat-trend ${formatStatTrend('avgActivityRatio').className}`}>
                                    {formatStatTrend('avgActivityRatio').arrow} {formatStatTrend('avgActivityRatio').percentage}
                                </div>
                            </div>
                            <div className="stat-value">{avgActivityRatio}%</div>
                            <div className="stat-subtext">Average across all MPs</div>
                        </div>
                        <Sparkline data={[68, 71, 70, 73, 72, avgActivityRatio]} color="#f59e0b" />
                    </div>
                </div>

                {/* Row 2 - Monthly Stats and AP Stats */}
                <div className="dashboard-grid">
                    <div
                        className="stat-card hover-card"
                        onClick={() => handleStatCardClick('monthlyANP')}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <div className="stat-header">
                            <div className="stat-label">{months[appliedFilters.month]} ANP</div>
                            <div className={`stat-trend ${formatStatTrend('monthlyMPANP').className}`}>
                                {formatStatTrend('monthlyMPANP').arrow} {formatStatTrend('monthlyMPANP').percentage}
                            </div>
                        </div>
                        <div className="stat-value">₱ {monthlyANP.toLocaleString()}</div>
                        <div className="stat-subtext">{selectedMonthYear} Performance</div>
                        <Sparkline data={[180000, 210000, 195000, 230000, 245000, monthlyANP]} color="#14b8a6" />
                    </div>

                    <div
                        className="stat-card hover-card"
                        onClick={() => handleStatCardClick('monthlyCases')}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <div className="stat-header">
                            <div className="stat-label">MONTHLY CASES</div>
                            <div className={`stat-trend ${formatStatTrend('totalMPPolicies').className}`}>
                                {formatStatTrend('totalMPPolicies').arrow} {formatStatTrend('totalMPPolicies').percentage}
                            </div>
                        </div>
                        <div className="stat-value">{(monthlyPolicies + monthlyDeclined).toLocaleString()}</div>
                        <div className="stat-subtext">{monthlyPolicies.toLocaleString()} Issued · {monthlyDeclined.toLocaleString()} Declined</div>
                        <Sparkline data={[32, 38, 35, 42, 40, monthlyPolicies]} color="#64748b" />
                    </div>

                    <div
                        className="stat-card hover-card"
                        onClick={() => handleStatCardClick('apAvgActivity')}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <div className="stat-header">
                            <div className="stat-label">AP AVG ACTIVITY</div>
                            <div className={`stat-trend ${formatStatTrend('avgActivityRatio').className}`}>
                                {formatStatTrend('avgActivityRatio').arrow} {formatStatTrend('avgActivityRatio').percentage}
                            </div>
                        </div>
                        <div className="stat-value">{apAvgActivity.toFixed(1)}%</div>
                        <div className="stat-subtext">Average across all APs</div>
                        <Sparkline data={[12, 14, 13, 15, 14, apAvgActivity]} color="#8b5cf6" />
                    </div>

                    <div
                        className="stat-card hover-card"
                        onClick={() => handleStatCardClick('apAvgANP')}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                        <div className="stat-header">
                            <div className="stat-label">AP AVG. ANP</div>
                            <div className={`stat-trend ${formatStatTrend('totalMPANP').className}`}>
                                {formatStatTrend('totalMPANP').arrow} {formatStatTrend('totalMPANP').percentage}
                            </div>
                        </div>
                        <div className="stat-value">₱ {apAvgANP.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <div className="stat-subtext">Per Active Partner (Selected)</div>
                        <Sparkline data={[5000, 7000, 6000, 8000, 7500, apAvgANP]} color="#ec4899" />
                    </div>
                </div>

                {/* Charts Section */}
                <div className="content-container">
                    <div className="charts-grid">
                        <div className="chart-container">
                            <div className="chart-header">
                                <div className="chart-title">Most Availed Policies</div>
                                <div className="chart-subtitle">Popularity by policy type</div>
                            </div>
                            <div className="chart-wrapper">
                                {mostAvailedPolicies.length > 0 ? (
                                    <Bar
                                        data={policyChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    ticks: {
                                                        stepSize: 10,
                                                        callback: function(value) {
                                                            return value.toLocaleString();
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No policy data available
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="chart-container">
                            <div className="chart-header">
                                <div className="chart-title">Monthly Issued Policies - {appliedFilters.year}</div>
                                <div className="chart-subtitle">Policies vs ANP by month</div>
                            </div>
                            <div className="chart-wrapper">
                                {monthlyIssuedPolicies.length > 0 ? (
                                    <Bar
                                        data={monthlyChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'top' } },
                                            scales: {
                                                y: {
                                                    type: 'linear',
                                                    display: true,
                                                    position: 'left',
                                                    title: { display: true, text: 'Policies Issued' },
                                                    ticks: { callback: (v) => v.toLocaleString() }
                                                },
                                                y1: {
                                                    type: 'linear',
                                                    display: true,
                                                    position: 'right',
                                                    title: { display: true, text: 'ANP (₱)' },
                                                    grid: { drawOnChartArea: false },
                                                    ticks: { callback: (v) => '₱' + v.toLocaleString() }
                                                }
                                            }
                                        }}
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No monthly data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Performing MPs Table */}
                <div className="content-container">
                    <div className="container-header">
                        <h2>Top Performing Management Partners</h2>
                        <div className="header-actions">
                            <button className="export-btn"> Export Report</button>
                        </div>
                    </div>
                    <div className="container-body">
                        <table className="md-mp-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>MP Name</th>
                                    <th>Monthly ANP</th>
                                    <th>Activity Ratio</th>
                                    <th>Monthly Cases</th>
                                    <th>AL Count</th>
                                    <th>AP Count</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topPerformers.map((mp, index) => {
                                    return (
                                        <tr key={mp.id}>
                                            <td>
                                                <div className="rank-badge" style={{
                                                    background: index === 0 ? '#3b82f6' :
                                                        index === 1 ? '#e2e8f0' :
                                                            index === 2 ? '#CD7F32' : '#f8fafc',
                                                    borderColor: index === 0 ? '#FFD700' :
                                                        index === 1 ? '#C0C0C0' :
                                                            index === 2 ? '#CD7F32' : '#e2e8f0',
                                                    color: index < 3 ? '#000' : '#0f172a'
                                                }}>
                                                    {index === 0 ? '🥇 ' :
                                                        index === 1 ? '🥈 ' :
                                                            index === 2 ? '🥉 ' : `#${index + 1}`}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="agent-info">
                                                    <div className="agent-name">{mp.name}</div>
                                                    <div className="agent-detail">ID: {mp.id?.substring(0, 8) || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="value-primary">₱ {mp.monthlyANP?.toLocaleString() || 0}</div>
                                            </td>
                                            <td>
                                                <div className="value-secondary">{mp.activityRatio || 0}%</div>
                                            </td>
                                            <td>
                                                <div className="value-secondary">{mp.monthlyCases?.toLocaleString() || 0}</div>
                                            </td>
                                            <td>
                                                <div className="value-secondary">{mp.alCount?.toLocaleString() || 0}</div>
                                            </td>
                                            <td>
                                                <div className="value-secondary">{mp.apCount?.toLocaleString() || 0}</div>
                                            </td>
                                            <td>
                                                <span className={`status-badge status-${mp.status?.toLowerCase().replace(' ', '-') || 'active'}`}>
                                                    {mp.status || 'Active'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="view-button"
                                                        onClick={() => handleViewMPsModal(mp)}
                                                        title="View ALs & APs"
                                                    >
                                                        VIEW ALS ({mp.alCount?.toLocaleString() || 0})
                                                    </button>
                                                    <button
                                                        className="details-button"
                                                        onClick={() => handleViewPolicyDetails(mp)}
                                                        title="View Details"
                                                    >
                                                        POLICY DETAILS
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {topPerformers.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="no-data-cell">
                                            No performance data available for this month.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <MDLayout title="Dashboard Overview">
            <div className="md-dashboard-content">
                {viewMode === 'overview' && renderOverview()}
            </div>

            {/* Stat Details Modal - Same structure as MP */}
            {showStatDetailsModal && (
                <div className="md-modal">
                    <div
                        className="md-modal-content animate-spring"
                        style={{ maxWidth: '900px', maxHeight: '90vh' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="md-modal-header">
                            <div>
                                <h2>Statistic Details</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    Historical data and detailed information
                                </p>
                            </div>
                            <button
                                className="md-modal-close"
                                onClick={() => setShowStatDetailsModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="md-modal-body">
                            {renderStatDetails()}

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '12px',
                                    paddingTop: '20px',
                                    borderTop: '1px solid #e2e8f0'
                                }}
                            >
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

            {/* MPs Modal - Show ALs and APs under selected MP - Same structure as MP */}
            {showMPsModal && selectedMP && (
                <div className="md-modal">
                    <div
                        className="md-modal-content"
                        style={{ maxWidth: '1100px', maxHeight: '90vh' }}
                    >
                        <div className="md-modal-header">
                            <div>
                                <h2>{selectedMP.name} - Agency Leaders & Partners</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    ALs and APs under this Management Partner
                                </p>
                            </div>
                            <button
                                className="md-modal-close"
                                onClick={() => setShowMPsModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="md-modal-body">
                            <div
                                className="md-modal-summary-card"
                                style={{
                                    background: darkMode ? '#252525' : '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '20px',
                                    border: darkMode ? '1px solid var(--border-subtle-dark)' : 'none'
                                }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                    <div>
                                        <div className="summary-metric-label">Total ALs</div>
                                        <div className="summary-metric-value text-dark">
                                            {getALsUnderMP(selectedMP.id).length.toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">Monthly ANP</div>
                                        <div className="summary-metric-value text-primary">
                                            ₱ {(selectedMP.monthlyANP || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">Monthly Cases</div>
                                        <div className="summary-metric-value text-warning">
                                            {(selectedMP.monthlyCases || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">Status</div>
                                        <span className={`status-badge status-${selectedMP.status?.toLowerCase().replace(' ', '-') || 'active'}`}>
                                            {selectedMP.status || 'Active'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <h4 className="md-modal-section-title">Agency Leaders Under This MP</h4>
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
                                        {getALsUnderMP(selectedMP.id).map(al => (
                                            <tr key={al.id}>
                                                <td>
                                                    <div className="agent-info">
                                                        <div className="agent-name">{al.name}</div>
                                                        <div className="agent-detail">ID: {al.id?.substring(0, 8) || 'N/A'}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${al.status?.toLowerCase().replace(' ', '-') || 'active'}`}>
                                                        {al.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: '600', color: '#28a745' }}>
                                                        ₱ {(al.monthlyANP || 0).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: '600' }}>{(al.monthlyCases || 0).toLocaleString()}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: '600' }}>{al.activityRatio || 0}%</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: '600' }}>{(al.apCount || 0).toLocaleString()}</div>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => handleViewALsModal(al)}
                                                        className="details-button"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {getALsUnderMP(selectedMP.id).length === 0 && (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                                    No Agency Leaders found under this Management Partner
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="md-modal-footer">
                                <button
                                    onClick={() => setShowMPsModal(false)}
                                    className="clear-filter-btn"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ALs Modal - Same structure as MP */}
            {showALsModal && selectedAL && (
                <div className="md-modal">
                    <div
                        className="md-modal-content"
                        style={{ maxWidth: '1000px', maxHeight: '90vh' }}
                    >
                        <div className="md-modal-header">
                            <div>
                                <h2>{selectedAL.name} - Agency Partners</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    APs under this Agency Leader
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
                                        <div className="summary-metric-label">Total APs</div>
                                        <div className="summary-metric-value text-dark">
                                            {getAPsByAL(selectedAL.name).length.toLocaleString()}
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
                                    <div>
                                        <div className="summary-metric-label">Status</div>
                                        <span className={`status-badge status-${selectedAL.status?.toLowerCase().replace(' ', '-') || 'active'}`}>
                                            {selectedAL.status || 'Active'}
                                        </span>
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

            {/* Policy Details Modal - Same structure as MP */}
            {showPolicyModal && selectedMP && (
                <div className="md-modal">
                    <div
                        className="md-modal-content"
                        style={{ maxWidth: '1000px', maxHeight: '90vh' }}
                    >
                        <div className="md-modal-header">
                            <div>
                                <h2>{selectedMP.name} - Policy Details</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    Policy distribution and monthly performance for {selectedMonthYear}
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
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                        <div>
                                            <h3 style={{ marginBottom: '16px', color: darkMode ? '#FFFFFF' : '#0f172a' }}>Policy Distribution</h3>
                                            <div style={{ height: '300px' }}>
                                                <Bar
                                                    data={{
                                                        labels: policyDetailsData.policyDistribution?.map(p => p.policy_name) || [],
                                                        datasets: [{
                                                            label: 'Policy Count',
                                                            data: policyDetailsData.policyDistribution?.map(p => p.count) || [],
                                                            backgroundColor: ['#002B5C', '#004080', '#4d7cff', '#ffc107', '#e74c3c', '#2c3e50'],
                                                            borderRadius: 6
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
                                                                    stepSize: 5,
                                                                    callback: (v) => v.toLocaleString()
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <h3 style={{ margin: 0, color: darkMode ? '#FFFFFF' : '#0f172a' }}>Monthly Trend - {appliedFilters.year}</h3>
                                                <div className="md-modal-highlight-box">
                                                    <span style={{ fontSize: '12px', color: '#0055b8', fontWeight: '600' }}>Total Cases:</span>
                                                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#002B5C' }}>
                                                        {(policyDetailsData.totalCases || 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ height: '300px' }}>
                                                <Bar
                                                    data={{
                                                        labels: months.map(m => m.substring(0, 3)),
                                                        datasets: [{
                                                            label: 'Policies Issued',
                                                            data: policyDetailsData.monthlyTrend?.map(m => m.policiesIssued) || [],
                                                            backgroundColor: '#002B5C',
                                                            borderRadius: 6
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
                                                                    stepSize: 5,
                                                                    callback: (v) => v.toLocaleString()
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className="md-modal-summary-card"
                                        style={{
                                            background: darkMode ? '#252525' : '#f8fafc',
                                            padding: '20px',
                                            borderRadius: '12px',
                                            marginBottom: '20px',
                                            border: darkMode ? '1px solid var(--border-subtle-dark)' : 'none'
                                        }}
                                    >
                                        <h4 style={{ marginBottom: '16px', color: darkMode ? '#FFFFFF' : '#0f172a' }}>Policy Statistics - {selectedMonthYear}</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                            <div>
                                                <div className="summary-metric-label">Total Policies</div>
                                                <div className="summary-metric-value text-dark">
                                                    {(selectedMP.totalCases || 0).toLocaleString()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="summary-metric-label">Current Month</div>
                                                <div className="summary-metric-value text-success">
                                                    {(selectedMP.monthlyCases || 0).toLocaleString()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="summary-metric-label">Monthly ANP</div>
                                                <div className="summary-metric-value text-primary">
                                                    ₱ {(selectedMP.monthlyANP || 0).toLocaleString()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="summary-metric-label">Most Availed</div>
                                                <div style={{ fontSize: '16px', fontWeight: '700' }} className="text-dark">
                                                    {policyDetailsData.policyDistribution?.[0]?.policy_name || 'N/A'}
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
                                                {policyDetailsData.policyDistribution?.map(policy => (
                                                    <tr key={policy.policy_name}>
                                                        <td><div style={{ fontWeight: '600' }}>{policy.policy_name}</div></td>
                                                        <td><span className="category-badge system">System</span></td>
                                                        <td style={{ fontWeight: '600', textAlign: 'center' }}>{policy.count.toLocaleString()}</td>
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
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
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
                                        setShowMPsModal(true);
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

export default MDDashboard;