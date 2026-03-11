// MDData.jsx - Complete version with mock data for development
import { createContext, useContext, useState, useEffect } from 'react';

const MDDataContext = createContext();

export const useMDData = () => {
    const context = useContext(MDDataContext);
    if (!context) {
        throw new Error('useMDData must be used within MDDataProvider');
    }
    return context;
};

// Mock data generators
const generateMockMPs = () => {
    const mpNames = [
        { name: 'Juan Dela Cruz', region: 'NCR' },
        { name: 'Maria Santos', region: 'Region 3' },
        { name: 'Jose Rizal', region: 'Region 4A' },
        { name: 'Ana Lopez', region: 'Region 7' },
        { name: 'Pedro Reyes', region: 'Region 11' },
        { name: 'Sofia Garcia', region: 'NCR' },
        { name: 'Miguel Fernandez', region: 'Region 3' },
        { name: 'Carmen Villanueva', region: 'Region 4A' }
    ];
    
    return mpNames.map((mp, index) => ({
        id: index + 1,
        name: mp.name,
        region: mp.region,
        status: ['ACTIVE', 'PERFORMING', 'AVERAGE'][Math.floor(Math.random() * 3)],
        totalANP: Math.floor(Math.random() * 8000000) + 2000000,
        monthlyANP: Math.floor(Math.random() * 800000) + 200000,
        totalCases: Math.floor(Math.random() * 300) + 100,
        monthlyCases: Math.floor(Math.random() * 40) + 10,
        activityRatio: Math.floor(Math.random() * 25) + 65,
        alCount: Math.floor(Math.random() * 12) + 8,
        apCount: Math.floor(Math.random() * 40) + 20
    }));
};

const generateMockALs = () => {
    const alNames = [
        { name: 'Alice Cruz', city: 'Manila' },
        { name: 'Ben Torres', city: 'Quezon City' },
        { name: 'Carla Gomez', city: 'Cebu' },
        { name: 'David Lim', city: 'Davao' },
        { name: 'Elena Santos', city: 'Makati' },
        { name: 'Franklin Diaz', city: 'Pasig' },
        { name: 'Gina Reyes', city: 'Taguig' },
        { name: 'Henry Sy', city: 'Manila' },
        { name: 'Isabel Cojuangco', city: 'Quezon City' },
        { name: 'Jose Abad', city: 'Cebu' }
    ];
    
    const mpNames = ['Juan Dela Cruz', 'Maria Santos', 'Jose Rizal', 'Ana Lopez', 'Pedro Reyes'];
    
    return alNames.map((al, index) => {
        const mpId = Math.floor(Math.random() * 5) + 1;
        return {
            id: index + 1,
            name: al.name,
            mpId: mpId,
            mpName: mpNames[mpId - 1],
            city: al.city,
            status: ['PERFORMING', 'AVERAGE', 'NEEDS IMPROVEMENT'][Math.floor(Math.random() * 3)],
            totalANP: Math.floor(Math.random() * 3000000) + 500000,
            monthlyANP: Math.floor(Math.random() * 300000) + 50000,
            totalCases: Math.floor(Math.random() * 150) + 30,
            monthlyCases: Math.floor(Math.random() * 20) + 3,
            activityRatio: Math.floor(Math.random() * 30) + 55,
            apCount: Math.floor(Math.random() * 20) + 8
        };
    });
};

const generateMockAPs = () => {
    const apNames = [
        { name: 'Anna Reyes', city: 'Makati' },
        { name: 'Benito Cruz', city: 'Pasig' },
        { name: 'Carla Gomez', city: 'Taguig' },
        { name: 'Dennis Tan', city: 'Manila' },
        { name: 'Elena Rodriguez', city: 'Quezon City' },
        { name: 'Fernando Marcos', city: 'Cebu' },
        { name: 'Grace Poe', city: 'Davao' },
        { name: 'Henry Lim', city: 'Makati' },
        { name: 'Ivy Santos', city: 'Pasig' },
        { name: 'James Yap', city: 'Taguig' },
        { name: 'Kris Aquino', city: 'Manila' },
        { name: 'Luis Manzano', city: 'Quezon City' }
    ];
    
    const alNames = ['Alice Cruz', 'Ben Torres', 'Carla Gomez', 'David Lim', 'Elena Santos'];
    const mpNames = ['Juan Dela Cruz', 'Maria Santos', 'Jose Rizal'];
    
    return apNames.map((ap, index) => {
        const alId = Math.floor(Math.random() * 5) + 1;
        const mpId = Math.floor(Math.random() * 3) + 1;
        const monthlyCases = Math.floor(Math.random() * 10) + 1;
        
        return {
            id: index + 1,
            name: ap.name,
            alId: alId,
            alName: alNames[alId - 1],
            mpId: mpId,
            mpName: mpNames[mpId - 1],
            city: ap.city,
            licenseNumber: `LIC-${2024000 + index}`,
            totalANP: Math.floor(Math.random() * 1500000) + 100000,
            monthlyANP: Math.floor(Math.random() * 150000) + 10000,
            totalCases: Math.floor(Math.random() * 80) + 10,
            monthlyCases: monthlyCases,
            monthlyDeclined: Math.floor(Math.random() * 3),
            lastActivity: ['2026-03-10', '2026-03-09', '2026-03-08', '2026-03-07', '2026-03-06'][Math.floor(Math.random() * 5)]
        };
    });
};

const generateMockStats = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyTrend = months.map((month, i) => ({
        month: month,
        issued: Math.floor(Math.random() * 45) + 20,
        declined: Math.floor(Math.random() * 8) + 1,
        anp: Math.floor(Math.random() * 300000) + 100000
    }));

    return {
        totalMPs: 8,
        activeMPs: 7,
        totalANP: 18500000,
        monthlyANP: 2450000,
        totalCases: 1850,
        monthlyCases: 245,
        monthlyDeclined: 32,
        activityRatio: 74,
        policyDistribution: [
            { policy_name: 'Life Insurance', count: 78, percentage: 32 },
            { policy_name: 'Health Insurance', count: 65, percentage: 27 },
            { policy_name: 'Vehicle Insurance', count: 52, percentage: 21 },
            { policy_name: 'Property Insurance', count: 32, percentage: 13 },
            { policy_name: 'Travel Insurance', count: 18, percentage: 7 }
        ],
        monthlyTrend: monthlyTrend
    };
};

const generateMockHistoryData = (statType, year, month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const titles = {
        totalMPs: 'Total Management Partners',
        activeMPs: 'Active Management Partners',
        totalMPANP: 'Total MP ANP',
        totalMPPolicies: 'Total MP Policies',
        avgActivityRatio: 'Average Activity Ratio',
        totalMPAPs: 'Total APs under MPs'
    };
    
    const monthlyData = months.map((m, i) => {
        let value;
        if (statType.includes('ANP')) {
            value = Math.floor(Math.random() * 3000000) + 1000000;
        } else if (statType.includes('Ratio')) {
            value = Math.floor(Math.random() * 20) + 60;
        } else if (statType.includes('Policies') || statType.includes('Cases')) {
            value = Math.floor(Math.random() * 300) + 100;
        } else {
            value = Math.floor(Math.random() * 10) + 5;
        }
        
        return {
            month: m,
            value: value,
            trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable'
        };
    });
    
    const currentValue = monthlyData[month || 2]?.value || monthlyData[0].value;
    const yearlyChange = (Math.random() * 30) - 10; // -10 to +20
    
    return {
        title: titles[statType] || 'Statistic History',
        description: `Historical trend for ${titles[statType] || statType}`,
        currentValue: currentValue,
        yearlyChange: yearlyChange,
        trend: yearlyChange > 5 ? 'up' : yearlyChange < -5 ? 'down' : 'stable',
        monthlyData: monthlyData,
        prefix: statType.includes('ANP') ? '₱ ' : '',
        unit: statType.includes('Ratio') ? '%' : ''
    };
};

export const MDDataProvider = ({ children }) => {
    const [mpPerformance, setMpPerformance] = useState([]);
    const [alPerformance, setAlPerformance] = useState([]);
    const [apPerformance, setApPerformance] = useState([]);
    const [mdStats, setMdStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [queryCache, setQueryCache] = useState({});

    // Helper to generate cache key
    const getCacheKey = (month, year) => `${year}-${month}`;

    // Simulated fetch with mock data
    const fetchDataWithCache = async (month, year) => {
        const queryYear = year || new Date().getFullYear();
        const queryMonth = month !== undefined ? month : new Date().getMonth();
        const cacheKey = getCacheKey(queryMonth, queryYear);

        // Check cache first
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
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const newMpPerformance = generateMockMPs();
            const newAlPerformance = generateMockALs();
            const newApPerformance = generateMockAPs();
            const newMdStats = generateMockStats();

            // Batch updates
            setMpPerformance(newMpPerformance);
            setAlPerformance(newAlPerformance);
            setApPerformance(newApPerformance);
            setMdStats(newMdStats);

            // Update cache
            setQueryCache(prev => ({
                ...prev,
                [cacheKey]: {
                    mpPerformance: newMpPerformance,
                    alPerformance: newAlPerformance,
                    apPerformance: newApPerformance,
                    mdStats: newMdStats
                }
            }));
        } catch (err) {
            console.error('Error generating mock data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        const now = new Date();
        fetchDataWithCache(now.getMonth(), now.getFullYear());
    }, []);

    // Get ALs by MP ID
    const getALsByMP = (mpId) => {
        return alPerformance.filter(al => al.mpId === mpId);
    };

    // Get APs by MP ID
    const getAPsByMP = (mpId) => {
        return apPerformance.filter(ap => ap.mpId === mpId);
    };

    // Get APs by AL name
    const getAPsByAL = (alName) => {
        return apPerformance.filter(ap => ap.alName === alName);
    };

    // Fetch monthly history data
    const fetchMonthlyHistory = async (statType, year, month) => {
        const cacheKey = `${statType}_${year}_${month}`;
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return generateMockHistoryData(statType, year, month);
    };

    // Fetch policy details for a specific MP/AL/AP
    const fetchPolicyDetails = async (id, year) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        return {
            totalCases: Math.floor(Math.random() * 200) + 50,
            issuedCount: Math.floor(Math.random() * 150) + 40,
            declinedCount: Math.floor(Math.random() * 30) + 5,
            totalANP: Math.floor(Math.random() * 5000000) + 1000000,
            policyDistribution: [
                { policy_name: 'Life Insurance', count: 28, percentage: 35, totalANP: 980000 },
                { policy_name: 'Health Insurance', count: 22, percentage: 28, totalANP: 660000 },
                { policy_name: 'Vehicle Insurance', count: 18, percentage: 22, totalANP: 540000 },
                { policy_name: 'Property Insurance', count: 12, percentage: 15, totalANP: 360000 }
            ],
            monthlyTrend: months.map((month, i) => ({
                month: month,
                policiesIssued: Math.floor(Math.random() * 15) + 5,
                policiesDeclined: Math.floor(Math.random() * 3)
            }))
        };
    };

    const value = {
        mpPerformance,
        alPerformance,
        apPerformance,
        mdStats,
        loading,
        error,
        getALsByMP,
        getAPsByMP,
        getAPsByAL,
        fetchMonthlyHistory,
        fetchPolicyDetails,
        refreshData: (month, year) => fetchDataWithCache(month, year)
    };

    return (
        <MDDataContext.Provider value={value}>
            {children}
        </MDDataContext.Provider>
    );
};

export default { useMDData, MDDataProvider };