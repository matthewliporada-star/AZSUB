import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://localhost:3000/api';

export const useMPData = () => {
    // 1. Define State
    const [mpStats, setMpStats] = useState({
        totalALs: 0, totalAPs: 0, activeAPs: 0,
        totalANP: 0, monthlyANP: 0,
        totalCases: 0, monthlyCases: 0,
        policyDistribution: [], monthlyTrend: []
    });
    const [alPerformance, setAlPerformance] = useState([]);
    const [apPerformance, setApPerformance] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Define Data Fetching Logic
    const refreshData = useCallback(async (month, year) => {
        setLoading(true);
        setError(null);
        
        // --- FIX: Handle "0" (January) correctly ---
        // If month is 0, 'month || ...' is false. We must check for undefined.
        const qMonth = (month !== undefined && month !== null) ? month : new Date().getMonth();
        const qYear = year || new Date().getFullYear();

        try {
            // Build Query String
            const params = new URLSearchParams();
            params.append('month', qMonth);
            params.append('year', qYear);
            const queryString = params.toString();

            // Fetch everything in parallel
            const [statsRes, alRes, apRes] = await Promise.all([
                fetch(`${API_URL}/mp/dashboard-stats?${queryString}`),
                fetch(`${API_URL}/mp/al-performance?${queryString}`),
                fetch(`${API_URL}/mp/ap-performance?${queryString}`)
            ]);

            const statsData = await statsRes.json();
            const alData = await alRes.json();
            const apData = await apRes.json();

            // Update State safely
            if (statsData.success) setMpStats(statsData.data);
            if (alData.success) setAlPerformance(alData.data);
            if (apData.success) setApPerformance(apData.data);

        } catch (err) {
            console.error("Data Load Error:", err);
            setError(err.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, []);

    // 3. Helper for Filtering
    const getAPsByAL = (alName) => {
        if (!apPerformance) return [];
        return apPerformance.filter(ap => ap.alName === alName);
    };

    // 4. Initial Load
    useEffect(() => {
        const now = new Date();
        refreshData(now.getMonth(), now.getFullYear());
    }, [refreshData]);

    // 5. Return Data (No JSX here, so .js extension is fine)
    return {
        mpStats,
        alPerformance,
        apPerformance,
        loading,
        error,
        refreshData,
        getAPsByAL
    };
};