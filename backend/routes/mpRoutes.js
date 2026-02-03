const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Helper to calculate Monthly ANP (Premium / 12)
const calculateMonthlyANP = (premium) => (parseFloat(premium) || 0) / 12;

// ==========================================
// 1. AL (Agent Leader) PERFORMANCE
// ==========================================
router.get('/mp/al-performance', async (req, res) => {
    try {
        const { month, year, status, sortBy } = req.query;
        const now = new Date();
        const queryYear = year ? parseInt(year) : now.getFullYear();
        
        // FIX: Handle '0' (January) correctly
        const queryMonth = (month !== undefined && month !== null) ? parseInt(month) : now.getMonth();

        // A. Fetch pre-calculated data from SQL View (Instant)
        const { data: alData, error: alError } = await supabase
            .from('mp_al_performance_view')
            .select('*');

        if (alError) throw alError;

        // B. Fetch Monthly Stats for ALL ALs in ONE query (Bulk Fetch)
        const startDate = new Date(queryYear, queryMonth, 1).toISOString();
        // FIX: Set to VERY END of the month (23:59:59.999)
        const endDate = new Date(queryYear, queryMonth + 1, 0, 23, 59, 59, 999).toISOString();

        const { data: monthlySubmissions, error: statsError } = await supabase
            .from('az_submissions')
            .select('profile_id, premium_paid, status')
            .eq('status', 'Issued')
            .gte('issued_at', startDate)
            .lte('issued_at', endDate);

        if (statsError) throw statsError;

        // C. Fetch Hierarchy Map to link APs to ALs
        const { data: hierarchy } = await supabase
            .from('user_hierarchy')
            .select('user_id, report_to_id')
            .eq('is_active', true);

        const teamMap = {};
        (hierarchy || []).forEach(h => {
            if (!teamMap[h.report_to_id]) teamMap[h.report_to_id] = [];
            teamMap[h.report_to_id].push(h.user_id);
        });

        // D. Combine Data
        const alPerformance = alData.map(al => {
            const teamIds = new Set([al.al_id, ...(teamMap[al.al_id] || [])]);
            
            const teamSubs = monthlySubmissions.filter(s => teamIds.has(s.profile_id));
            
            const monthlyCases = teamSubs.length;
            const monthlyANP = teamSubs.reduce((sum, s) => sum + calculateMonthlyANP(s.premium_paid), 0);
            
            let alStatus = 'NEEDS IMPROVEMENT';
            if (monthlyCases >= 7) alStatus = 'PERFORMING';
            else if (monthlyCases >= 4) alStatus = 'AVERAGE';

            // Calculate Activity Ratio (Active Team Members / Total Team Members)
            const activeAPsInMonth = new Set(teamSubs.map(s => s.profile_id)).size;
            const activityRatio = al.ap_count > 0 ? Math.round((activeAPsInMonth / al.ap_count) * 100) : 0;

            return {
                id: al.al_id,
                name: al.name,
                city: al.city,
                apCount: al.ap_count,
                activeAPs: activeAPsInMonth,
                activityRatio: Math.min(activityRatio, 100),
                totalANP: Math.round(al.total_anp),
                monthlyANP: Math.round(monthlyANP),
                totalCases: al.total_cases,
                monthlyCases,
                status: alStatus
            };
        });

        // E. Sort & Filter
        const validSortFields = ['monthlyANP', 'totalANP', 'activityRatio', 'monthlyCases', 'totalCases'];
        if (sortBy && validSortFields.includes(sortBy)) {
            alPerformance.sort((a, b) => b[sortBy] - a[sortBy]);
        } else {
            alPerformance.sort((a, b) => b.monthlyANP - a.monthlyANP);
        }

        const finalData = status && status !== 'All' 
            ? alPerformance.filter(p => p.status === status) 
            : alPerformance;

        res.json({ success: true, data: finalData });
    } catch (e) {
        console.error('AL Performance Error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==========================================
// 2. AP (Agent Partner) PERFORMANCE
// ==========================================
router.get('/mp/ap-performance', async (req, res) => {
    try {
        const { month, year, alId, minCases, maxCases } = req.query;
        const now = new Date();
        const queryYear = year ? parseInt(year) : now.getFullYear();
        // FIX: Handle '0' (January) correctly
        const queryMonth = (month !== undefined && month !== null) ? parseInt(month) : now.getMonth();

        // 1. Fetch AP Profiles + Hierarchy
        let apQuery = supabase
            .from('profiles')
            .select(`
                id, first_name, last_name, email, created_at, last_submission_at, "Address",
                user_roles!inner(role_code),
                user_hierarchy!user_hierarchy_user_id_fkey(
                    report_to_id, 
                    leader:profiles!user_hierarchy_report_to_id_fkey(first_name, last_name)
                )
            `)
            .eq('user_roles.role_code', 'AP')
            .eq('user_hierarchy.is_active', true);

        if (alId) {
            apQuery = apQuery.eq('user_hierarchy.report_to_id', alId);
        }

        const { data: apUsers, error: apError } = await apQuery;
        if (apError) throw apError;

        if (!apUsers || apUsers.length === 0) return res.json({ success: true, data: [] });

        // 2. Bulk Fetch Submissions
        const apIds = apUsers.map(ap => ap.id);
        const { data: allSubmissions } = await supabase
            .from('az_submissions')
            .select('*')
            .in('profile_id', apIds)
            .eq('status', 'Issued');

        // FIX: Javascript Dates for accurate filtering
        const startDate = new Date(queryYear, queryMonth, 1);
        const endDate = new Date(queryYear, queryMonth + 1, 0, 23, 59, 59, 999);

        // 3. Process Metrics
        const apPerformance = apUsers.map(ap => {
            const subs = allSubmissions.filter(s => s.profile_id === ap.id);
            
            const monthlySubs = subs.filter(s => {
                const d = new Date(s.issued_at);
                return d >= startDate && d <= endDate;
            });

            const totalANP = subs.reduce((sum, s) => sum + (parseFloat(s.premium_paid) || 0), 0);
            const monthlyANP = monthlySubs.reduce((sum, s) => sum + calculateMonthlyANP(s.premium_paid), 0);

            const leader = ap.user_hierarchy?.[0]?.leader;
            const lastActiveDate = ap.last_submission_at ? new Date(ap.last_submission_at).toLocaleDateString() : 'No activity';

            return {
                id: ap.id,
                name: `${ap.first_name} ${ap.last_name}`,
                alName: leader ? `${leader.first_name} ${leader.last_name}` : 'Unassigned',
                city: ap.Address || 'Manila',
                licenseNumber: `LIC-${ap.id.substring(0, 8)}`,
                joinDate: new Date(ap.created_at).toLocaleDateString(),
                lastActivity: lastActiveDate,
                totalANP: Math.round(totalANP),
                monthlyANP: Math.round(monthlyANP),
                totalCases: subs.length,
                monthlyCases: monthlySubs.length
            };
        });

        // 4. Filter by Case Range
        const filteredData = apPerformance.filter(ap => {
            const meetsMin = !minCases || ap.monthlyCases >= parseInt(minCases);
            const meetsMax = !maxCases || ap.monthlyCases <= parseInt(maxCases);
            return meetsMin && meetsMax;
        });

        res.json({ success: true, data: filteredData });
    } catch (e) {
        console.error('AP Performance Error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==========================================
// 3. DASHBOARD STATS
// ==========================================
router.get('/mp/dashboard-stats', async (req, res) => {
    try {
        const { year, month } = req.query;
        const selectedYear = year ? parseInt(year) : new Date().getFullYear();
        // FIX: Handle '0' (January) correctly
        const selectedMonth = (month !== undefined && month !== null) ? parseInt(month) : new Date().getMonth();

        const { data: summary } = await supabase.from('mp_al_performance_view').select('*');
        
        const totalALs = summary.length;
        const totalANP = summary.reduce((sum, al) => sum + al.total_anp, 0);
        const totalCases = summary.reduce((sum, al) => sum + al.total_cases, 0);
        
        const { count: totalAPs } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('role_id', 3); // Adjust ID for AP role if needed

        // Fetch submissions for Charts
        const startOfYear = new Date(selectedYear, 0, 1).toISOString();
        const endOfYear = new Date(selectedYear, 11, 31, 23, 59, 59, 999).toISOString();

        const { data: yearSubmissions } = await supabase
            .from('az_submissions')
            .select('issued_at, premium_paid, status, profile_id, policy:policy_id(policy_name)')
            .eq('status', 'Issued')
            .gte('issued_at', startOfYear)
            .lte('issued_at', endOfYear);

        const monthlyTrend = Array(12).fill(0).map((_, i) => ({
            month: new Date(0, i).toLocaleString('default', { month: 'long' }),
            issued: 0,
            anp: 0
        }));

        const policyDistributionMap = {};
        let monthlyANP = 0;
        let monthlyCases = 0;

        (yearSubmissions || []).forEach(sub => {
            const date = new Date(sub.issued_at);
            const mIndex = date.getMonth();
            const anp = calculateMonthlyANP(sub.premium_paid);

            monthlyTrend[mIndex].issued++;
            monthlyTrend[mIndex].anp += anp;

            const pName = sub.policy?.policy_name || 'Unknown';
            policyDistributionMap[pName] = (policyDistributionMap[pName] || 0) + 1;

            if (mIndex === selectedMonth) {
                monthlyANP += anp;
                monthlyCases++;
            }
        });

        const policyDistribution = Object.entries(policyDistributionMap)
            .map(([name, count]) => ({ policy_name: name, count }))
            .sort((a, b) => b.count - a.count);

        const activeAPIds = new Set(
            yearSubmissions
                .filter(s => new Date(s.issued_at).getMonth() === selectedMonth)
                .map(s => s.profile_id)
        );

        res.json({
            success: true,
            data: {
                totalALs,
                totalAPs: totalAPs || 0,
                activeAPs: activeAPIds.size,
                totalANP: Math.round(totalANP),
                monthlyANP: Math.round(monthlyANP),
                totalCases,
                monthlyCases,
                policyDistribution,
                monthlyTrend
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==========================================
// 4. MONTHLY HISTORY
// ==========================================
router.get('/mp/monthly-history', async (req, res) => {
    try {
        const { year, month, statType } = req.query;
        const now = new Date();
        const selectedYear = year ? parseInt(year) : now.getFullYear();
        const selectedMonth = (month !== undefined && month !== null) ? parseInt(month) : now.getMonth();
        const prevYear = selectedYear - 1;

        // Fetch 2 years of data for trend comparison
        const { data: rawHistory } = await supabase
            .from('az_submissions')
            .select('issued_at, premium_paid, profile_id')
            .eq('status', 'Issued')
            .gte('issued_at', `${prevYear}-01-01`)
            .lte('issued_at', `${selectedYear}-12-31`);

        const monthlyData = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        let currentValue = 0;
        let prevYearValue = 0;

        for (let i = 0; i < 12; i++) {
            const currMonthSubs = rawHistory.filter(s => {
                const d = new Date(s.issued_at);
                return d.getFullYear() === selectedYear && d.getMonth() === i;
            });
            
            const prevMonthSubs = rawHistory.filter(s => {
                const d = new Date(s.issued_at);
                if (i === 0) return d.getFullYear() === prevYear && d.getMonth() === 11;
                return d.getFullYear() === selectedYear && d.getMonth() === i - 1;
            });

            let val = 0;
            if (statType === 'totalANP' || statType === 'monthlyANP') {
                val = currMonthSubs.reduce((sum, s) => sum + calculateMonthlyANP(s.premium_paid), 0);
            } else if (statType === 'totalCases') {
                val = currMonthSubs.length;
            } else if (statType === 'activityRatio') {
                val = new Set(currMonthSubs.map(s => s.profile_id)).size;
            }

            // Determine Trend (Up/Down) based on previous month
            let prevVal = 0;
             if (statType === 'totalANP' || statType === 'monthlyANP') {
                prevVal = prevMonthSubs.reduce((sum, s) => sum + calculateMonthlyANP(s.premium_paid), 0);
            } else if (statType === 'totalCases') {
                prevVal = prevMonthSubs.length;
            } else if (statType === 'activityRatio') {
                prevVal = new Set(prevMonthSubs.map(s => s.profile_id)).size;
            }

            let trend = val > prevVal ? 'up' : val < prevVal ? 'down' : 'stable';

            // Capture Selected Month values
            if (i === selectedMonth) {
                currentValue = Math.round(val);
                
                // For Yearly Change calculation
                const prevYearSubs = rawHistory.filter(s => {
                    const d = new Date(s.issued_at);
                    return d.getFullYear() === prevYear && d.getMonth() === i;
                });
                
                if (statType.includes('ANP')) {
                    prevYearValue = prevYearSubs.reduce((sum, s) => sum + calculateMonthlyANP(s.premium_paid), 0);
                } else {
                    prevYearValue = prevYearSubs.length;
                }
            }

            if (i <= (selectedMonth || 11)) {
                monthlyData.push({ month: monthNames[i], value: Math.round(val), trend });
            }
        }

        const yearlyChange = prevYearValue > 0 ? ((currentValue - prevYearValue) / prevYearValue) * 100 : 0;

        res.json({
            success: true,
            data: {
                title: statType === 'totalANP' ? 'Total ANP' : statType === 'activityRatio' ? 'Active APs' : 'Total Cases',
                currentValue,
                yearlyChange: parseFloat(yearlyChange.toFixed(1)),
                trend: yearlyChange >= 0 ? 'up' : 'down',
                monthlyData
            }
        });

    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==========================================
// 5. POLICY DETAILS (Drill Down)
// ==========================================
router.get('/mp/policy-details/:alId', async (req, res) => {
    try {
        const { alId } = req.params;
        const { year } = req.query;
        const selectedYear = year ? parseInt(year) : new Date().getFullYear();

        const { data: team } = await supabase
            .from('user_hierarchy')
            .select('user_id')
            .eq('report_to_id', alId)
            .eq('is_active', true);

        const teamIds = [alId, ...(team || []).map(t => t.user_id)];

        const startDate = new Date(selectedYear, 0, 1).toISOString();
        const endDate = new Date(selectedYear, 11, 31, 23, 59, 59).toISOString();

        const { data: submissions } = await supabase
            .from('az_submissions')
            .select('issued_at, premium_paid, policy:policy_id(policy_name)')
            .in('profile_id', teamIds)
            .eq('status', 'Issued')
            .gte('issued_at', startDate)
            .lte('issued_at', endDate);

        const policyCounts = {};
        const monthlyTrend = Array(12).fill(0).map((_, i) => ({
            month: new Date(0, i).toLocaleString('default', { month: 'short' }),
            policiesIssued: 0
        }));

        (submissions || []).forEach(sub => {
            const name = sub.policy?.policy_name || 'Other';
            policyCounts[name] = (policyCounts[name] || 0) + 1;

            const monthIdx = new Date(sub.issued_at).getMonth();
            monthlyTrend[monthIdx].policiesIssued++;
        });

        const policyDistribution = Object.entries(policyCounts)
            .map(([name, count]) => ({ 
                policy_name: name, 
                count,
                percentage: Math.round((count / submissions.length) * 100)
            }))
            .sort((a, b) => b.count - a.count);

        res.json({
            success: true,
            data: {
                totalCases: submissions.length,
                policyDistribution,
                monthlyTrend
            }
        });

    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;