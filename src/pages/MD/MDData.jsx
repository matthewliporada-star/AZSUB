// MDData.jsx - Complete version with real API integration
import { createContext, useContext, useState, useEffect } from 'react';

const MDDataContext = createContext();

export const useMDData = () => {
    const context = useContext(MDDataContext);
    if (!context) throw new Error('useMDData must be used within MDDataProvider');
    return context;
};

const API_BASE_URL = 'http://localhost:3000/api';

export const MDDataProvider = ({ children }) => {
    const [mpPerformance, setMpPerformance] = useState([]);
    const [alPerformance, setAlPerformance] = useState([]);
    const [apPerformance, setApPerformance] = useState([]);
    const [mdStats, setMdStats] = useState({
        policyDistribution: [],
        monthlyTrend: [],
        totalMPs: 0,
        activeMPs: 0,
        totalMPANP: 0,
        totalMPPolicies: 0,
        avgActivityRatio: 0,
        totalALs: 0,
        performingALs: 0,
        totalAPs: 0,
        activeAPs: 0,
        monthSpecificStats: { activityRatio: 0, monthlyANP: 0, totalPolicies: 0, monthlyDeclined: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [queryCache, setQueryCache] = useState({});

    const getCacheKey = (month, year) => `${year}-${month}`;

    const fetchDataWithCache = async (month, year) => {
        const queryYear = year || new Date().getFullYear();
        const queryMonth = month !== undefined ? month : new Date().getMonth();
        const cacheKey = getCacheKey(queryMonth, queryYear);

        if (queryCache[cacheKey]) {
            const cached = queryCache[cacheKey];
            setMpPerformance(cached.mpPerformance);
            setAlPerformance(cached.alPerformance);
            setApPerformance(cached.apPerformance);
            setMdStats(cached.mdStats);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log(`Fetching MD data for month=${queryMonth}, year=${queryYear}`);
            
            const [mpResponse, alResponse, apResponse, statsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/md/mp-performance?month=${queryMonth}&year=${queryYear}`),
                fetch(`${API_BASE_URL}/md/al-performance?month=${queryMonth}&year=${queryYear}`),
                fetch(`${API_BASE_URL}/md/ap-performance?month=${queryMonth}&year=${queryYear}`),
                fetch(`${API_BASE_URL}/md/dashboard-stats?month=${queryMonth}&year=${queryYear}`)
            ]);

            if (!mpResponse.ok) throw new Error(`MP API error: ${mpResponse.status}`);
            if (!alResponse.ok) throw new Error(`AL API error: ${alResponse.status}`);
            if (!apResponse.ok) throw new Error(`AP API error: ${apResponse.status}`);
            if (!statsResponse.ok) throw new Error(`Stats API error: ${statsResponse.status}`);

            const mpData = await mpResponse.json();
            const alData = await alResponse.json();
            const apData = await apResponse.json();
            const statsData = await statsResponse.json();

            const newMpPerformance = mpData.success ? mpData.data : [];
            const newAlPerformance = alData.success ? alData.data : [];
            const newApPerformance = apData.success ? apData.data : [];
            
            // Use stats from API directly - it now calculates totals correctly
            const newMdStats = statsData.success ? statsData.data : {
                policyDistribution: [],
                monthlyTrend: [],
                totalMPs: newMpPerformance.length,
                activeMPs: newMpPerformance.filter(mp => mp.status === 'ACTIVE' || mp.status === 'PERFORMING').length,
                totalMPANP: newMpPerformance.reduce((sum, mp) => sum + (mp.totalANP || 0), 0),
                totalMPPolicies: newMpPerformance.reduce((sum, mp) => sum + (mp.totalCases || 0), 0),
                avgActivityRatio: newMpPerformance.length > 0 ? Math.round(newMpPerformance.reduce((sum, mp) => sum + (mp.activityRatio || 0), 0) / newMpPerformance.length) : 0,
                totalALs: newAlPerformance.length,
                performingALs: newAlPerformance.filter(al => al.status === 'PERFORMING').length,
                totalAPs: newApPerformance.length,
                activeAPs: newApPerformance.filter(ap => (ap.monthlyCases || 0) > 0).length,
                monthSpecificStats: {
                    activityRatio: newMpPerformance.length > 0 ? Math.round(newMpPerformance.reduce((sum, mp) => sum + (mp.activityRatio || 0), 0) / newMpPerformance.length) : 0,
                    monthlyANP: newMpPerformance.reduce((sum, mp) => sum + (mp.monthlyANP || 0), 0),
                    totalPolicies: newMpPerformance.reduce((sum, mp) => sum + (mp.monthlyCases || 0), 0),
                    monthlyDeclined: newMpPerformance.reduce((sum, mp) => sum + (mp.monthlyDeclined || 0), 0)
                }
            };

            console.log('Data loaded successfully:', {
                mps: newMpPerformance.length,
                totalANP: newMdStats.totalMPANP,
                totalCases: newMdStats.totalMPPolicies,
                monthlyANP: newMdStats.monthSpecificStats?.monthlyANP
            });

            setMpPerformance(newMpPerformance);
            setAlPerformance(newAlPerformance);
            setApPerformance(newApPerformance);
            setMdStats(newMdStats);

            setQueryCache(prev => ({ ...prev, [cacheKey]: { mpPerformance: newMpPerformance, alPerformance: newAlPerformance, apPerformance: newApPerformance, mdStats: newMdStats } }));
        } catch (err) {
            console.error('Error fetching MD data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const now = new Date();
        fetchDataWithCache(now.getMonth(), now.getFullYear());
    }, []);

    const getALsByMP = (mpId) => alPerformance.filter(al => al.mpId === mpId);
    const getAPsByAL = (alName) => apPerformance.filter(ap => ap.alName === alName);

    const fetchMonthlyHistory = async (statType, year, month) => {
        try {
            const response = await fetch(`${API_BASE_URL}/md/monthly-history?statType=${statType}&year=${year}&month=${month}`);
            if (!response.ok) throw new Error(`History API error: ${response.status}`);
            const result = await response.json();
            return result.success ? result.data : null;
        } catch (error) {
            console.error('Error fetching monthly history:', error);
            return null;
        }
    };

    const fetchPolicyDetails = async (mpId, year) => {
        try {
            const response = await fetch(`${API_BASE_URL}/md/policy-details/${mpId}?year=${year}`);
            if (!response.ok) throw new Error(`Policy details API error: ${response.status}`);
            const result = await response.json();
            return result.success ? result.data : null;
        } catch (error) {
            console.error('Error fetching policy details:', error);
            return null;
        }
    };

    const value = { 
        mpPerformance, 
        alPerformance, 
        apPerformance, 
        mdStats, 
        loading, 
        error, 
        getALsByMP, 
        getAPsByAL, 
        fetchMonthlyHistory, 
        fetchPolicyDetails, 
        refreshData: (month, year) => fetchDataWithCache(month, year) 
    };

    return <MDDataContext.Provider value={value}>{children}</MDDataContext.Provider>;
};

export default { useMDData, MDDataProvider };