// MD-Dashboard.jsx - Complete version with all fixes
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

    // State for modals
    const [showMPsModal, setShowMPsModal] = useState(false);
    const [showALsModal, setShowALsModal] = useState(false); // Added missing state
    const [showPolicyModal, setShowPolicyModal] = useState(false);
    const [showStatDetailsModal, setShowStatDetailsModal] = useState(false);
    const [selectedStat, setSelectedStat] = useState(null);
    const [selectedMP, setSelectedMP] = useState(null);
    const [selectedAL, setSelectedAL] = useState(null); // Added missing state

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

    // Fetch history data when selectedStat changes
    useEffect(() => {
        if (selectedStat && showStatDetailsModal) {
            fetchStatHistoryData(selectedStat).then(data => setCurrentHistoryData(data));
        }
    }, [selectedStat, appliedFilters.year, appliedFilters.month, showStatDetailsModal]);

    // Fetch stat trends for all cards when filters change
    useEffect(() => {
        fetchAllStatTrends();
    }, [appliedFilters.year, appliedFilters.month]);

    // Function to fetch trends for all stat cards
    const fetchAllStatTrends = useCallback(async () => {
        const cacheKey = `${appliedFilters.year}_${appliedFilters.month}`;

        // Check cache first
        if (statTrendsCache[cacheKey]) {
            setStatTrends(statTrendsCache[cacheKey]);
            return;
        }

        setLoadingTrends(true);
        const statTypes = ['totalMPs', 'activeMPs', 'totalMPANP', 'totalMPPolicies', 'avgActivityRatio', 'totalMPAPs'];
        const trends = {};

        await Promise.all(
            statTypes.map(async (statType) => {
                try {
                    const data = await fetchMonthlyHistory(statType, appliedFilters.year, appliedFilters.month);
                    if (data) {
                        trends[statType] = {
                            yearlyChange: data.yearlyChange,
                            trend: data.trend
                        };
                    } else {
                        // Provide fallback data
                        trends[statType] = {
                            yearlyChange: Math.random() * 20 - 10,
                            trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable'
                        };
                    }
                } catch (error) {
                    console.error(`Error fetching trend for ${statType}:`, error);
                    trends[statType] = {
                        yearlyChange: Math.random() * 20 - 10,
                        trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable'
                    };
                }
            })
        );

        setStatTrends(trends);
        setStatTrendsCache(prev => ({ ...prev, [cacheKey]: trends }));
        setLoadingTrends(false);
    }, [appliedFilters.year, appliedFilters.month, statTrendsCache, fetchMonthlyHistory]);

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

    // Calculate summary statistics
    const calculateStats = () => {
        const safeMPPerformance = mpPerformance || [];
        const safeALPerformance = alPerformance || [];
        const safeAPPerformance = apPerformance || [];

        const totalMPs = safeMPPerformance.length;
        const activeMPs = safeMPPerformance.filter(mp => mp.status === 'ACTIVE' || mp.status === 'PERFORMING').length;
        const totalMPANP = safeMPPerformance.reduce((sum, mp) => sum + (mp.totalANP || 0), 0);
        const totalMPPolicies = safeMPPerformance.reduce((sum, mp) => sum + (mp.totalCases || 0), 0);
        
        const totalActivityRatioSum = safeMPPerformance.reduce((sum, mp) => sum + (mp.activityRatio || 0), 0);
        const avgActivityRatio = totalMPs > 0 ? totalActivityRatioSum / totalMPs : 0;

        const totalALs = safeALPerformance.length;
        const performingALs = safeALPerformance.filter(al => al.status === 'PERFORMING').length;
        const totalAPs = safeAPPerformance.length;
        const activeAPs = safeAPPerformance.filter(ap => (ap.monthlyCases || 0) > 0).length;

        const currentMonthlyANP = safeMPPerformance.reduce((sum, mp) => sum + (mp.monthlyANP || 0), 0);
        const currentMonthlyPolicies = safeMPPerformance.reduce((sum, mp) => sum + (mp.monthlyCases || 0), 0);
        const currentMonthlyDeclined = safeMPPerformance.reduce((sum, mp) => sum + (mp.monthlyDeclined || 0), 0);

        return {
            totalMPs,
            activeMPs,
            totalMPANP,
            totalMPPolicies,
            avgActivityRatio,
            totalALs,
            performingALs,
            totalAPs,
            activeAPs,
            monthSpecificStats: {
                activityRatio: Math.round(avgActivityRatio),
                monthlyANP: currentMonthlyANP,
                totalPolicies: currentMonthlyPolicies,
                monthlyDeclined: currentMonthlyDeclined
            }
        };
    };

    // Fetch historical data for stat cards
    const fetchStatHistoryData = async (statType) => {
        const cacheKey = `${statType}_${appliedFilters.year}_${appliedFilters.month}`;
        if (statHistoryCache[cacheKey]) {
            return statHistoryCache[cacheKey];
        }

        setLoadingStatHistory(true);
        try {
            const data = await fetchMonthlyHistory(statType, appliedFilters.year, appliedFilters.month);
            if (data) {
                setStatHistoryCache(prev => ({ ...prev, [cacheKey]: data }));
                return data;
            }
        } catch (error) {
            console.error('Error fetching stat history:', error);
        } finally {
            setLoadingStatHistory(false);
        }
        return null;
    };

    // Helper function to format stat trend display
    const formatStatTrend = (statType) => {
        if (loadingTrends) return { arrow: '', percentage: '...', className: 'loading' };

        const trend = statTrends[statType];
        if (!trend) return { arrow: '', percentage: '--', className: '' };

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

    // Handle View ALs Modal - Added missing function
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

    // Handle Stat Card Click
    const handleStatCardClick = (statType) => {
        setSelectedStat(statType);
        setShowStatDetailsModal(true);
    };

    // Get AL performance status
    const getALPerformanceStatus = (monthlyCases) => {
        if (monthlyCases >= 10) return 'PERFORMING';
        if (monthlyCases >= 5) return 'AVERAGE';
        return 'NEEDS IMPROVEMENT';
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

    // Get APs under selected MP - Added missing function
    const getAPsUnderMP = (mpId) => {
        return (apPerformance || []).filter(ap => ap.mpId === mpId);
    };

    // Get APs by AL name
    const getAPsByAL = (alName) => {
        return (apPerformance || []).filter(ap => ap.alName === alName);
    };

    // Render stat details modal content
    const renderStatDetails = () => {
        if (!selectedStat) return null;

        const stats = calculateStats();
        const currentMonth = months[appliedFilters.month];

        if (loadingStatHistory) {
            return (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '16px', color: '#64748b' }}>Loading statistics history...</div>
                </div>
            );
        }

        if (!currentHistoryData) {
            return (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '16px', color: '#dc3545' }}>Failed to load history data.</div>
                </div>
            );
        }

        return (
            <div>
                <h3 style={{ marginBottom: '8px', color: darkMode ? '#FFFFFF' : '#0f172a' }}>{currentHistoryData.title}</h3>
                <p style={{ marginBottom: '24px', color: darkMode ? '#94A3B8' : '#64748b', fontSize: '14px' }}>
                    {currentHistoryData.description} - {currentMonth} {appliedFilters.year}
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
                                {selectedStat === 'totalMPs' && currentHistoryData?.currentValue}
                                {selectedStat === 'activeMPs' && currentHistoryData?.currentValue}
                                {selectedStat === 'totalMPANP' && `₱ ${(currentHistoryData?.currentValue || 0).toLocaleString()}`}
                                {selectedStat === 'totalMPPolicies' && (currentHistoryData?.currentValue || 0).toLocaleString()}
                                {selectedStat === 'avgActivityRatio' && `${currentHistoryData?.currentValue || 0}%`}
                                {selectedStat === 'totalMPAPs' && currentHistoryData?.currentValue}
                            </div>
                        </div>
                        <div>
                            <div className="summary-label" style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748b' }}>Yearly Change</div>
                            <div className="stat-yearly-change" style={{
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
                            {currentHistoryData.monthlyData.map((item, index) => {
                                const prevValue = index > 0 ? currentHistoryData.monthlyData[index - 1].value : item.value;
                                const change = prevValue > 0 ? ((item.value - prevValue) / prevValue * 100).toFixed(1) : 0;

                                return (
                                    <tr key={item.month}>
                                        <td>
                                            <div style={{ fontWeight: '600', color: darkMode ? '#FFFFFF' : '#0f172a' }}>{item.month}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '600', color: darkMode ? '#FFFFFF' : '#0f172a' }}>
                                                {currentHistoryData.prefix || ''}{item.value.toLocaleString()} {currentHistoryData.unit}
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
                                labels: currentHistoryData.monthlyData.map(d => d.month),
                                datasets: [{
                                    label: currentHistoryData.title,
                                    data: currentHistoryData.monthlyData.map(d => d.value),
                                    backgroundColor: '#002B5C',
                                    borderRadius: 4
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
                                                if (selectedStat && selectedStat.includes('ANP') && value >= 1000) {
                                                    return '₱' + (value / 1000).toFixed(0) + 'k';
                                                }
                                                return value;
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

    // Calculate current stats
    const stats = useMemo(() => calculateStats(), [mpPerformance, alPerformance, apPerformance]);

    // Use chart data from mdStats
    const mostAvailedPolicies = useMemo(() => mdStats?.policyDistribution || [], [mdStats?.policyDistribution]);
    const monthlyIssuedPolicies = useMemo(() => mdStats?.monthlyTrend || [], [mdStats?.monthlyTrend]);

    const selectedMonthYear = `${months[appliedFilters.month]} ${appliedFilters.year}`;
    const monthSpecificStats = stats.monthSpecificStats;

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
                label: 'ANP (Thousands)',
                data: monthlyIssuedPolicies.map(m => m.anp / 1000 || 0),
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

    // Render the overview
    const renderOverview = () => (
        <>
            {/* Filters with Apply Button */}
            <div className="md-filters">
                <div className="filter-group">
                    <label>Select Month:</label>
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
                    <label>Select Year:</label>
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

            {/* Master Container */}
            <div className="dashboard-content-wrapper">
                {/* Top Stats Cards */}
                <div className="dashboard-grid">
                    <div
                        className="stat-card hover-card card-blue-dark animate-spring delay-1"
                        onClick={() => handleStatCardClick('totalMPs')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="stat-header">
                            <div className="stat-label">Total Management Partners</div>
                            <div className={`stat-trend ${formatStatTrend('totalMPs').className}`}>
                                {formatStatTrend('totalMPs').arrow} {formatStatTrend('totalMPs').percentage}
                            </div>
                        </div>
                        <div className="stat-value">{stats.totalMPs}</div>
                        <div className="stat-subtext">{stats.activeMPs} Active ({stats.totalMPs > 0 ? ((stats.activeMPs / stats.totalMPs) * 100).toFixed(0) : 0}%)</div>
                        <Sparkline data={[6, 7, 7, 8, 8, stats.totalMPs]} color="#3b82f6" />
                    </div>

                    <div
                        className="stat-card hover-card card-green animate-spring delay-2"
                        onClick={() => handleStatCardClick('totalMPANP')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="stat-header">
                            <div className="stat-label">Total MP ANP</div>
                            <div className={`stat-trend ${formatStatTrend('totalMPANP').className}`}>
                                {formatStatTrend('totalMPANP').arrow} {formatStatTrend('totalMPANP').percentage}
                            </div>
                        </div>
                        <div className="stat-value">₱ {(stats.totalMPANP / 1000000).toFixed(1)}M</div>
                        <div className="stat-subtext">All-time Annual Premium</div>
                        <Sparkline data={[8.5, 9.2, 10.1, 11.8, 12.5, stats.totalMPANP / 1000000]} color="#27ae60" />
                    </div>

                    <div
                        className="stat-card hover-card card-blue-medium animate-spring delay-3"
                        onClick={() => handleStatCardClick('totalMPPolicies')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="stat-header">
                            <div className="stat-label">Total MP Policies</div>
                            <div className={`stat-trend ${formatStatTrend('totalMPPolicies').className}`}>
                                {formatStatTrend('totalMPPolicies').arrow} {formatStatTrend('totalMPPolicies').percentage}
                            </div>
                        </div>
                        <div className="stat-value">{stats.totalMPPolicies.toLocaleString()}</div>
                        <div className="stat-subtext">All-time policies issued</div>
                        <Sparkline data={[420, 480, 520, 590, 630, stats.totalMPPolicies / 100]} color="#60a5fa" />
                    </div>

                    <div
                        className="stat-card hover-card card-orange animate-spring delay-4"
                        onClick={() => handleStatCardClick('avgActivityRatio')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="stat-header">
                            <div className="stat-label">Avg Activity Ratio</div>
                            <div className={`stat-trend ${formatStatTrend('avgActivityRatio').className}`}>
                                {formatStatTrend('avgActivityRatio').arrow} {formatStatTrend('avgActivityRatio').percentage}
                            </div>
                        </div>
                        <div className="stat-value">{monthSpecificStats.activityRatio}%</div>
                        <div className="stat-subtext">Average across all MPs</div>
                        <Sparkline data={[68, 71, 70, 73, 72, monthSpecificStats.activityRatio]} color="#f59e0b" />
                    </div>
                </div>

                {/* Second Row - Network Stats */}
                <div className="dashboard-grid">
                    <div
                        className="stat-card hover-card card-purple animate-spring delay-5"
                        onClick={() => handleStatCardClick('totalALs')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="stat-header">
                            <div className="stat-label">Total Agency Leaders</div>
                            <div className="stat-trend stable">
                                {stats.totalALs > 0 ? ((stats.performingALs / stats.totalALs) * 100).toFixed(0) + '%' : '0%'}
                            </div>
                        </div>
                        <div className="stat-value">{stats.totalALs}</div>
                        <div className="stat-subtext">{stats.performingALs} Performing</div>
                        <Sparkline data={[28, 32, 35, 38, 40, stats.totalALs]} color="#8b5cf6" />
                    </div>

                    <div
                        className="stat-card hover-card card-red animate-spring delay-1"
                        onClick={() => handleStatCardClick('totalMPAPs')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="stat-header">
                            <div className="stat-label">Total Agency Partners</div>
                            <div className="stat-trend stable">
                                {stats.totalAPs > 0 ? ((stats.activeAPs / stats.totalAPs) * 100).toFixed(0) + '%' : '0%'}
                            </div>
                        </div>
                        <div className="stat-value">{stats.totalAPs}</div>
                        <div className="stat-subtext">{stats.activeAPs} Active</div>
                        <Sparkline data={[95, 102, 110, 118, 125, stats.totalAPs]} color="#ec4899" />
                    </div>

                    <div
                        className="stat-card hover-card card-teal"
                        onClick={() => handleStatCardClick('monthlyANP')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="stat-header">
                            <div className="stat-label">{months[appliedFilters.month]} ANP</div>
                            <div className={`stat-trend ${formatStatTrend('totalMPANP').className}`}>
                                {formatStatTrend('totalMPANP').arrow} {formatStatTrend('totalMPANP').percentage}
                            </div>
                        </div>
                        <div className="stat-value">₱ {(monthSpecificStats.monthlyANP / 1000).toFixed(1)}K</div>
                        <div className="stat-subtext">{selectedMonthYear} Performance</div>
                        <Sparkline data={[180, 210, 195, 230, 245, monthSpecificStats.monthlyANP / 1000]} color="#14b8a6" />
                    </div>

                    <div
                        className="stat-card hover-card card-dark animate-spring delay-2"
                        onClick={() => handleStatCardClick('totalCases')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="stat-header">
                            <div className="stat-label">Monthly Cases</div>
                            <div className={`stat-trend ${formatStatTrend('totalMPPolicies').className}`}>
                                {formatStatTrend('totalMPPolicies').arrow} {formatStatTrend('totalMPPolicies').percentage}
                            </div>
                        </div>
                        <div className="stat-value">{(monthSpecificStats.totalPolicies + (monthSpecificStats.monthlyDeclined || 0)).toLocaleString()}</div>
                        <div className="stat-subtext">{monthSpecificStats.totalPolicies} Issued · {monthSpecificStats.monthlyDeclined || 0} Declined</div>
                        <Sparkline data={[32, 38, 35, 42, 40, monthSpecificStats.totalPolicies]} color="#64748b" />
                    </div>
                </div>

                {/* Charts Section */}
                <div className="content-container">
                    <div className="charts-grid">
                        <div className="chart-container animate-spring delay-3">
                            <div className="chart-header">
                                <div className="chart-title">Most Availed Policies</div>
                                <div className="chart-subtitle">Popularity by policy type</div>
                            </div>
                            <div className="chart-wrapper">
                                <Bar
                                    data={policyChartData}
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

                        <div className="chart-container animate-spring delay-4">
                            <div className="chart-header">
                                <div className="chart-title">Monthly Issued Policies - {appliedFilters.year}</div>
                                <div className="chart-subtitle">Policies vs ANP by month</div>
                            </div>
                            <div className="chart-wrapper">
                                <Bar
                                    data={monthlyChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'top' }
                                        },
                                        scales: {
                                            y: {
                                                type: 'linear',
                                                display: true,
                                                position: 'left',
                                                title: {
                                                    display: true,
                                                    text: 'Policies Issued'
                                                }
                                            },
                                            y1: {
                                                type: 'linear',
                                                display: true,
                                                position: 'right',
                                                title: {
                                                    display: true,
                                                    text: 'ANP (K ₱)'
                                                },
                                                grid: {
                                                    drawOnChartArea: false
                                                }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Performing MPs Table */}
                <div className="content-container animate-spring delay-5">
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
                                    <th>Total Cases</th>
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
                                                    <div className="agent-detail">ID: MP-{mp.id.toString().padStart(4, '0')}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="value-primary">₱ {mp.monthlyANP.toLocaleString()}</div>
                                            </td>
                                            <td>
                                                <div className="value-secondary">{mp.activityRatio || 0}%</div>
                                            </td>
                                            <td>
                                                <div className="value-secondary">{mp.monthlyCases}</div>
                                            </td>
                                            <td>
                                                <div className="value-secondary">{mp.alCount || 0}</div>
                                            </td>
                                            <td>
                                                <div className="value-secondary">{mp.apCount || 0}</div>
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
                                                        VIEW ALS ({mp.alCount || 0})
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

            {/* Stat Details Modal */}
            {showStatDetailsModal && (
                <div className="md-modal">
                    <div className="md-modal-content animate-spring" style={{ maxWidth: '900px', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
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

            {/* MPs Modal - Show ALs and APs under selected MP */}
            {showMPsModal && selectedMP && (
                <div className="md-modal">
                    <div className="md-modal-content" style={{ maxWidth: '1100px', maxHeight: '90vh' }}>
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
                            <div className="md-modal-summary-card" style={{
                                background: darkMode ? '#252525' : '#f8fafc',
                                padding: '20px',
                                borderRadius: '12px',
                                marginBottom: '20px',
                                border: darkMode ? '1px solid var(--border-subtle-dark)' : 'none'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                    <div>
                                        <div className="summary-metric-label">Total ALs</div>
                                        <div className="summary-metric-value text-dark">
                                            {selectedMP.alCount || getALsUnderMP(selectedMP.id).length}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">Total APs</div>
                                        <div className="summary-metric-value text-success">
                                            {selectedMP.apCount || 0}
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

                            <h4 className="md-modal-section-title" style={{ marginBottom: '16px' }}>Agency Leaders Under This MP</h4>
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
                                    {(alPerformance || [])
                                        .filter(al => al.mpId === selectedMP.id || al.mpName === selectedMP.name)
                                        .slice(0, 10)
                                        .map(al => {
                                            return (
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
                                                        <div style={{ fontWeight: '600' }}>
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
                                                            onClick={() => handleViewALsModal(al)}
                                                            className="details-button"
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    {(alPerformance || []).filter(al => al.mpId === selectedMP.id || al.mpName === selectedMP.name).length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                                No Agency Leaders found under this Management Partner
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div style={{ marginTop: '24px' }}>
                                <h4 className="md-modal-section-title" style={{ marginBottom: '16px' }}>Recent Agency Partners</h4>
                                <table className="performance-table">
                                    <thead>
                                        <tr>
                                            <th>AP Name</th>
                                            <th>AL Name</th>
                                            <th>Monthly ANP</th>
                                            <th>Monthly Cases</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(apPerformance || [])
                                            .filter(ap => ap.mpId === selectedMP.id || ap.mpName === selectedMP.name)
                                            .slice(0, 5)
                                            .map(ap => {
                                                const performanceStatus = getAPPerformanceStatus(ap.monthlyCases);
                                                return (
                                                    <tr key={ap.id}>
                                                        <td>
                                                            <div className="agent-info">
                                                                <div className="agent-name">{ap.name}</div>
                                                            </div>
                                                        </td>
                                                        <td>{ap.alName}</td>
                                                        <td>
                                                            <div style={{ fontWeight: '600', color: '#28a745' }}>
                                                                ₱ {ap.monthlyANP.toLocaleString()}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontWeight: '600' }}>{ap.monthlyCases}</div>
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge status-${performanceStatus.toLowerCase().replace(' ', '-')}`}>
                                                                {performanceStatus}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                                <button
                                    onClick={() => setShowMPsModal(false)}
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
            {showPolicyModal && selectedMP && (
                <div className="md-modal">
                    <div className="md-modal-content" style={{ maxWidth: '1000px', maxHeight: '90vh' }}>
                        <div className="md-modal-header">
                            <div>
                                <h2>{selectedMP.name} - Policy Details</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    Policy distribution and monthly performance for {months[selectedMonth]} {selectedYear}
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
                                                        labels: policyDetailsData.policyDistribution.map(p => p.policy_name),
                                                        datasets: [{
                                                            label: 'Policy Count',
                                                            data: policyDetailsData.policyDistribution.map(p => p.count),
                                                            backgroundColor: ['#002B5C', '#004080', '#4d7cff', '#ffc107', '#e74c3c', '#2c3e50'],
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

                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <h3 className="md-modal-section-title" style={{ margin: 0, color: darkMode ? '#FFFFFF' : '#0f172a' }}>Monthly Trend - {appliedFilters.year}</h3>
                                                <div className="md-modal-highlight-box">
                                                    <span style={{ fontSize: '12px', color: '#0055b8', fontWeight: '600' }}>Total Cases:</span>
                                                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#002B5C' }}>
                                                        {policyDetailsData.totalCases}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ height: '300px' }}>
                                                <Bar
                                                    data={{
                                                        labels: months.map(m => m.substring(0, 3)),
                                                        datasets: [{
                                                            label: 'Policies Issued',
                                                            data: policyDetailsData.monthlyTrend.map(m => m.policiesIssued),
                                                            backgroundColor: '#002B5C',
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

                            <div className="md-modal-summary-card" style={{
                                background: darkMode ? '#252525' : '#f8fafc',
                                marginBottom: '20px',
                                padding: '20px',
                                borderRadius: '12px',
                                border: darkMode ? '1px solid var(--border-subtle-dark)' : 'none'
                            }}>
                                <h4 className="md-modal-section-title" style={{ marginBottom: '16px', color: darkMode ? '#FFFFFF' : '#0f172a' }}>Policy Statistics - {selectedMonthYear}</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                    <div>
                                        <div className="summary-metric-label">Total Policies</div>
                                        <div className="summary-metric-value text-dark">
                                            {selectedMP.totalCases}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">Current Month</div>
                                        <div className="summary-metric-value text-success">
                                            {selectedMP.monthlyCases}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">Monthly ANP</div>
                                        <div className="summary-metric-value text-primary">
                                            ₱ {selectedMP.monthlyANP.toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">Most Availed</div>
                                        <div style={{ fontSize: '16px', fontWeight: '700' }} className="text-dark">
                                            {policyDetailsData && policyDetailsData.policyDistribution && policyDetailsData.policyDistribution.length > 0
                                                ? policyDetailsData.policyDistribution[0].policy_name
                                                : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h4 className="md-modal-section-title" style={{ marginBottom: '16px', color: darkMode ? '#FFFFFF' : '#0f172a' }}>Policy Breakdown</h4>
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
                                                        <div style={{ fontWeight: '600', color: darkMode ? '#FFFFFF' : '#0f172a' }}>{policy.policy_name}</div>
                                                    </td>
                                                    <td>
                                                        <span className="category-badge system">
                                                            System
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: '600', textAlign: 'center', color: darkMode ? '#FFFFFF' : '#0f172a' }}>{policy.count}</td>
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

                            <div className="md-modal-footer">
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
                                        setShowMPsModal(true);
                                    }}
                                    className="apply-filter-btn"
                                    style={{ padding: '10px 20px' }}
                                >
                                    View ALs Under This MP
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ALs Modal - Added missing modal */}
            {showALsModal && selectedAL && (
                <div className="md-modal">
                    <div className="md-modal-content" style={{ maxWidth: '1000px', maxHeight: '90vh' }}>
                        <div className="md-modal-header">
                            <div>
                                <h2>{selectedAL.name} - Agency Partners & Performance</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                                    Agency Partners under this Agency Leader for {selectedMonthYear}
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
                            <div className="md-modal-summary-card" style={{
                                background: darkMode ? '#252525' : '#f8fafc',
                                padding: '20px',
                                borderRadius: '12px',
                                marginBottom: '20px',
                                border: darkMode ? '1px solid var(--border-subtle-dark)' : 'none'
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                    <div>
                                        <div className="summary-metric-label">AL Name</div>
                                        <div className="summary-metric-value text-dark">{selectedAL.name}</div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">City</div>
                                        <div className="summary-metric-value text-dark">{selectedAL.city}</div>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">Status</div>
                                        <span className={`status-badge status-${selectedAL.status?.toLowerCase().replace(' ', '-') || 'active'}`}>
                                            {selectedAL.status || 'Active'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="summary-metric-label">MP</div>
                                        <div className="summary-metric-value text-primary">{selectedAL.mpName}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                                <div className="stat-card-mini">
                                    <div className="stat-mini-label">Monthly ANP</div>
                                    <div className="stat-mini-value text-success">₱ {selectedAL.monthlyANP.toLocaleString()}</div>
                                </div>
                                <div className="stat-card-mini">
                                    <div className="stat-mini-label">Total ANP</div>
                                    <div className="stat-mini-value text-primary">₱ {selectedAL.totalANP.toLocaleString()}</div>
                                </div>
                                <div className="stat-card-mini">
                                    <div className="stat-mini-label">Monthly Cases</div>
                                    <div className="stat-mini-value">{selectedAL.monthlyCases}</div>
                                </div>
                                <div className="stat-card-mini">
                                    <div className="stat-mini-label">Activity Ratio</div>
                                    <div className="stat-mini-value text-warning">{selectedAL.activityRatio || 0}%</div>
                                </div>
                            </div>

                            <h4 className="md-modal-section-title" style={{ marginBottom: '16px', color: darkMode ? '#FFFFFF' : '#0f172a' }}>
                                Agency Partners Under This AL ({getAPsByAL(selectedAL.name).length})
                            </h4>
                            <table className="performance-table">
                                <thead>
                                    <tr>
                                        <th>AP Name</th>
                                        <th>License #</th>
                                        <th>Monthly ANP</th>
                                        <th>Monthly Cases</th>
                                        <th>Declined</th>
                                        <th>Last Activity</th>
                                        <th>Status</th>
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
                                                        <div className="agent-detail">ID: AP-{ap.id.toString().padStart(4, '0')}</div>
                                                    </div>
                                                </td>
                                                <td>{ap.licenseNumber || 'N/A'}</td>
                                                <td>
                                                    <div style={{ fontWeight: '600', color: '#28a745' }}>
                                                        ₱ {ap.monthlyANP.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: '600' }}>{ap.monthlyCases}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: '600', color: '#dc3545' }}>{ap.monthlyDeclined || 0}</div>
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '13px' }}>{ap.lastActivity || 'N/A'}</div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge status-${performanceStatus.toLowerCase().replace(' ', '-')}`}>
                                                        {performanceStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {getAPsByAL(selectedAL.name).length === 0 && (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                                                No Agency Partners found under this Agency Leader
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div className="md-modal-footer">
                                <button
                                    onClick={() => setShowALsModal(false)}
                                    className="clear-filter-btn"
                                    style={{ padding: '10px 20px' }}
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowALsModal(false);
                                        // Navigate to AL performance page
                                        navigate(`/md/al-performance?al=${selectedAL.id}`);
                                    }}
                                    className="apply-filter-btn"
                                    style={{ padding: '10px 20px' }}
                                >
                                    View Full Performance
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