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

        // B. Fetch Year-to-Date Stats for ALL ALs (Cumulative from Jan to selected month)
        const startDate = new Date(queryYear, 0, 1).toISOString(); // Jan 1 of selected year
        // FIX: Set to VERY END of the selected month (23:59:59.999)
        const endDate = new Date(queryYear, queryMonth + 1, 0, 23, 59, 59, 999).toISOString();

        const { data: monthlySubmissions, error: statsError } = await supabase
            .from('az_submissions')
            .select('profile_id, premium_paid, status')
            .in('status', ['Issued', 'Declined']) // Fetch both Issued and Declined
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

            // Separate Issued vs Declined
            const issuedSubs = teamSubs.filter(s => s.status === 'Issued');
            const declinedSubs = teamSubs.filter(s => s.status === 'Declined');

            const monthlyCases = issuedSubs.length;
            const monthlyDeclined = declinedSubs.length;
            const monthlyANP = issuedSubs.reduce((sum, s) => sum + calculateMonthlyANP(s.premium_paid), 0);

            let alStatus = 'NEEDS IMPROVEMENT';
            if (monthlyCases >= 7) alStatus = 'PERFORMING';
            else if (monthlyCases >= 4) alStatus = 'AVERAGE';

            // Calculate Activity Ratio (Active Team Members / Total Team Members)
            // Activity is usually defined by ISSUED cases, but could include Declined if they were active?
            // Sticking to Issued for "Active AP" definition for now to be conservative.
            const activeAPsInMonth = new Set(issuedSubs.map(s => s.profile_id)).size;
            const activityRatio = al.ap_count > 0 ? Math.round((activeAPsInMonth / al.ap_count) * 100) : 0;

            return {
                id: al.al_id,
                name: al.name,
                city: al.city,
                apCount: al.ap_count,
                activeAPs: activeAPsInMonth,
                activityRatio: Math.min(activityRatio, 100),
                activityRatio: Math.min(activityRatio, 100),
                totalANP: Math.round(monthlyANP), // Placeholder, will fix next line
                totalANP: Math.round(issuedSubs.reduce((sum, s) => sum + (parseFloat(s.premium_paid) || 0), 0)),
                monthlyANP: Math.round(monthlyANP),
                totalCases: al.total_cases, // Note: This comes from View, might only be Issued.
                monthlyCases,
                monthlyDeclined, // NEW FIELD
                status: alStatus
            };
        });

        // E. Sort & Filter
        const validSortFields = ['monthlyANP', 'totalANP', 'activityRatio', 'monthlyCases', 'totalCases', 'monthlyDeclined'];
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
            .in('status', ['Issued', 'Declined']);

        // FIX: Year-to-Date calculation (from Jan 1 to end of selected month)
        const startDate = new Date(queryYear, 0, 1); // Jan 1 of selected year
        const endDate = new Date(queryYear, queryMonth + 1, 0, 23, 59, 59, 999);

        // 3. Process Metrics
        const apPerformance = apUsers.map(ap => {
            // Get all subsmissions for this AP
            const subs = allSubmissions.filter(s => s.profile_id === ap.id);

            // Filter by Year-to-Date (Jan 1 to selected month end)
            const monthlySubs = subs.filter(s => {
                const d = new Date(s.issued_at);
                return d >= startDate && d <= endDate;
            });

            // Separate Issued vs Declined
            const monthlyIssued = monthlySubs.filter(s => s.status === 'Issued');
            const monthlyDeclined = monthlySubs.filter(s => s.status === 'Declined');

            // Global stats (Total across all time)
            const totalIssued = subs.filter(s => s.status === 'Issued');
            // const totalDeclined = subs.filter(s => s.status === 'Declined'); // Not currently displayed but available

            const totalANP = totalIssued.reduce((sum, s) => sum + (parseFloat(s.premium_paid) || 0), 0);
            const monthlyANP = monthlyIssued.reduce((sum, s) => sum + calculateMonthlyANP(s.premium_paid), 0);

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
                totalCases: totalIssued.length,
                monthlyCases: monthlyIssued.length,
                monthlyDeclined: monthlyDeclined.length // NEW FIELD
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
            .in('status', ['Issued', 'Declined']) // Fetch Issued AND Declined
            .gte('issued_at', startOfYear)
            .lte('issued_at', endOfYear);

        const monthlyTrend = Array(12).fill(0).map((_, i) => ({
            month: new Date(0, i).toLocaleString('default', { month: 'long' }),
            issued: 0,
            declined: 0, // NEW
            anp: 0
        }));

        const policyDistributionMap = {};
        let monthlyANP = 0;
        let monthlyCases = 0;
        let monthlyDeclined = 0; // NEW

        (yearSubmissions || []).forEach(sub => {
            const date = new Date(sub.issued_at);
            const mIndex = date.getMonth();
            const anp = sub.status === 'Issued' ? calculateMonthlyANP(sub.premium_paid) : 0;

            if (sub.status === 'Issued') {
                monthlyTrend[mIndex].issued++;
                monthlyTrend[mIndex].anp += anp;
            } else if (sub.status === 'Declined') {
                monthlyTrend[mIndex].declined++;
                // Do not add to ANP
            }

            const pName = sub.policy?.policy_name || 'Unknown';
            // Only count Issued for Policy Distribution
            if (sub.status === 'Issued') {
                policyDistributionMap[pName] = (policyDistributionMap[pName] || 0) + 1;
            }

            if (mIndex === selectedMonth) {
                if (sub.status === 'Issued') {
                    monthlyCases++;
                } else if (sub.status === 'Declined') {
                    monthlyDeclined++;
                }
            }

            // Cumulative YTD ANP (from Jan to selected month)
            if (mIndex <= selectedMonth && sub.status === 'Issued') {
                monthlyANP += anp;
            }
        });

        const policyDistribution = Object.entries(policyDistributionMap)
            .map(([name, count]) => ({ policy_name: name, count }))
            .sort((a, b) => b.count - a.count);

        // Count active APs YTD (Jan to selected month)
        const activeAPIds = new Set(
            yearSubmissions
                .filter(s => new Date(s.issued_at).getMonth() <= selectedMonth && s.status === 'Issued')
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
                monthlyDeclined, // NEW
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
        const { year, month, statType, view } = req.query;
        const now = new Date();
        const selectedYear = year ? parseInt(year) : now.getFullYear();
        const selectedMonth = (month !== undefined && month !== null) ? parseInt(month) : now.getMonth();
        const prevYear = selectedYear - 1;

        // Fetch 2 years of data for trend comparison
        let historyQuery = supabase
            .from('az_submissions')
            .select('issued_at, premium_paid, profile_id, status')
            .in('status', ['Issued', 'Declined']) // Fetch Issued AND Declined
            .lte('issued_at', `${selectedYear}-12-31`);

        // Filter by View Context (AP vs AL)
        if (view === 'ap') {
            const { data: roleUsers } = await supabase
                .from('profiles')
                .select('id, user_roles!inner(role_code)')
                .eq('user_roles.role_code', 'AP');

            if (roleUsers && roleUsers.length > 0) {
                const ids = roleUsers.map(u => u.id);
                historyQuery = historyQuery.in('profile_id', ids);
            }
        } else if (view === 'al') {
            // For AL view, include AL's own submissions + their team's AP submissions
            const { data: alUsers } = await supabase
                .from('profiles')
                .select('id, user_roles!inner(role_code)')
                .eq('user_roles.role_code', 'AL');

            const alIds = (alUsers || []).map(u => u.id);

            // Get AP team members under these ALs
            const { data: hierarchy } = await supabase
                .from('user_hierarchy')
                .select('user_id')
                .in('report_to_id', alIds)
                .eq('is_active', true);

            const apTeamIds = (hierarchy || []).map(h => h.user_id);
            const allIds = [...new Set([...alIds, ...apTeamIds])];

            if (allIds.length > 0) {
                historyQuery = historyQuery.in('profile_id', allIds);
            }
        }

        const { data: rawHistory } = await historyQuery;

        // FETCH AP IDs (Hierarchy) if needed for AP Stats
        let apIds = [];
        if (statType === 'apAvgANP') {
            const { data: apUsers } = await supabase
                .from('profiles')
                .select('id, user_roles!inner(role_code)')
                .eq('user_roles.role_code', 'AP');

            if (apUsers) {
                apIds = apUsers.map(m => m.id);
            }
        }

        const monthlyData = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let currentValue = 0;
        let prevYearValue = 0;

        // Calculate initial cumulative ANP (Start of Selected Year)
        // Everything before Jan 1st of selected Year
        let cumulativeANP = 0;
        let prevYearCumulativeANP = 0;
        let cumulativeMonthlyANP = 0; // For YTD Monthly ANP
        let prevYearCumulativeMonthlyANP = 0;

        let cumulativeApAnp = 0; // For AP Avg ANP
        let cumulativeApSet = new Set();
        let prevYearCumulativeApAnp = 0;
        let prevYearCumulativeApSet = new Set();

        if (statType === 'totalANP' || statType === 'monthlyANP') {
            // For totalANP, sum all premium_paid
            // For monthlyANP, sum premium_paid / 12
            const calcFunc = statType === 'totalANP'
                ? (s) => (parseFloat(s.premium_paid) || 0)
                : (s) => calculateMonthlyANP(s.premium_paid);

            cumulativeANP = rawHistory
                .filter(s => {
                    const d = new Date(s.issued_at);
                    return d.getFullYear() < selectedYear && s.status === 'Issued';
                })
                .reduce((sum, s) => sum + calcFunc(s), 0);

            prevYearCumulativeANP = rawHistory
                .filter(s => {
                    const d = new Date(s.issued_at);
                    return d.getFullYear() < prevYear && s.status === 'Issued';
                })
                .reduce((sum, s) => sum + calcFunc(s), 0);
        }

        for (let i = 0; i < 12; i++) {
            // Function to filter by year/month
            const getMonthSubs = (y, m) => rawHistory.filter(s => {
                const d = new Date(s.issued_at);
                return d.getFullYear() === y && d.getMonth() === m;
            });

            const currMonthSubs = getMonthSubs(selectedYear, i);
            const prevMonthSubs = i === 0
                ? getMonthSubs(prevYear, 11) // For trend of Jan, compares to Dec prev year
                : getMonthSubs(selectedYear, i - 1);

            // Calculation Helper
            const calculateVal = (subs, type) => {
                const issued = subs.filter(s => s.status === 'Issued');
                const declined = subs.filter(s => s.status === 'Declined');

                if (type === 'totalANP') {
                    return issued.reduce((sum, s) => sum + (parseFloat(s.premium_paid) || 0), 0);
                } else if (type === 'monthlyANP') {
                    return issued.reduce((sum, s) => sum + calculateMonthlyANP(s.premium_paid), 0);
                } else if (type === 'totalCases') {
                    return issued.length + declined.length;
                } else if (type === 'declined') { // NEW TYPE
                    return declined.length;
                } else if (type === 'activityRatio') {
                    return new Set(issued.map(s => s.profile_id)).size;
                }
                return 0;
            };

            let val = calculateVal(currMonthSubs, statType);
            let prevVal = calculateVal(prevMonthSubs, statType);

            // Handle Cumulative Logic for Total ANP and Monthly ANP
            if (statType === 'totalANP' || statType === 'monthlyANP') {
                cumulativeANP += val;
                const currentCumulative = cumulativeANP;
                // Previous cumulative is (Current - CurrentMonthContrib). Start of year uses initial cumulativeANP.
                const prevCumulative = (cumulativeANP - val);

                val = currentCumulative;
                prevVal = prevCumulative;

                // For Yearly Change (Prev Year SAME Month)
                const prevYearSameMonthSubs = getMonthSubs(prevYear, i);
                const prevYearSameMonthContrib = calculateVal(prevYearSameMonthSubs, statType);
                prevYearCumulativeANP += prevYearSameMonthContrib;
                prevYearValue = prevYearCumulativeANP;
            } else if (statType === 'apAvgANP') {
                // Calculate Monthly AP Contribution (Filter by AP IDs)
                const apSubs = currMonthSubs.filter(s => apIds.includes(s.profile_id));
                const issued = apSubs.filter(s => s.status === 'Issued');
                const monthlyTotal = issued.reduce((sum, s) => sum + calculateMonthlyANP(s.premium_paid), 0);

                // Update Cumulative Totals
                cumulativeApAnp += monthlyTotal;
                issued.forEach(s => cumulativeApSet.add(s.profile_id));

                // Current Avg Value
                val = cumulativeApSet.size > 0 ? cumulativeApAnp / cumulativeApSet.size : 0;

                // PREVIOUS YEAR LOGIC (Same Month Cumulative)
                const prevYearSameMonthSubs = getMonthSubs(prevYear, i);
                const prevApSubs = prevYearSameMonthSubs.filter(s => apIds.includes(s.profile_id));
                const prevIssued = prevApSubs.filter(s => s.status === 'Issued');
                const prevMonthlyTotal = prevIssued.reduce((sum, s) => sum + calculateMonthlyANP(s.premium_paid), 0);

                prevYearCumulativeApAnp += prevMonthlyTotal;
                prevIssued.forEach(s => prevYearCumulativeApSet.add(s.profile_id));

                prevYearValue = prevYearCumulativeApSet.size > 0 ? prevYearCumulativeApAnp / prevYearCumulativeApSet.size : 0;
            } else {
                const prevYearSubs = getMonthSubs(prevYear, i);
                prevYearValue = calculateVal(prevYearSubs, statType);
            }

            // Determine Trend (Up/Down) based on previous month
            let trend = val > prevVal ? 'up' : val < prevVal ? 'down' : 'stable';

            // Capture Selected Month values
            if (i === selectedMonth) {
                currentValue = Math.round(val);
                // prevYearValue is updated in the if/else blocks above
            }

            if (i <= (selectedMonth || 11)) {
                monthlyData.push({ month: monthNames[i], value: Math.round(val), trend });
            }
        }

        const yearlyChange = prevYearValue > 0 ? ((currentValue - prevYearValue) / prevYearValue) * 100 : 0;

        let title = '';
        if (statType === 'totalANP') title = 'Total ANP';
        else if (statType === 'monthlyANP') title = 'Monthly ANP';
        else if (statType === 'apAvgANP') title = 'Monthly Avg. ANP (AP)';
        else if (statType === 'activityRatio') title = 'Active APs';
        else if (statType === 'declined') title = 'Declined';
        else if (statType === 'totalALs') title = 'Agent Leaders';
        else if (statType === 'totalAPs') title = 'Agent Partners';
        else title = 'Total Cases';

        res.json({
            success: true,
            data: {
                title,
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
            .select('issued_at, premium_paid, status, policy:policy_id(policy_name)')
            .in('profile_id', teamIds)
            .in('status', ['Issued', 'Declined']) // Fetch Issued AND Declined
            .gte('issued_at', startDate)
            .lte('issued_at', endDate);

        const policyStats = {}; // { policyName: { count, totalANP } }
        const monthlyTrend = Array(12).fill(0).map((_, i) => ({
            month: new Date(0, i).toLocaleString('default', { month: 'short' }),
            policiesIssued: 0,
            policiesDeclined: 0 // NEW
        }));

        let totalIssuedCount = 0;

        (submissions || []).forEach(sub => {
            if (sub.status === 'Issued' || sub.status === 'Declined') {
                // Only count Issued for Policy Distribution
                if (sub.status === 'Issued') {
                    const name = sub.policy?.policy_name || 'Other';
                    const premium = parseFloat(sub.premium_paid) || 0;
                    if (!policyStats[name]) {
                        policyStats[name] = { count: 0, totalANP: 0 };
                    }
                    policyStats[name].count++;
                    policyStats[name].totalANP += premium;
                }
                totalIssuedCount++;
            }

            const monthIdx = new Date(sub.issued_at).getMonth();

            if (sub.status === 'Issued') {
                monthlyTrend[monthIdx].policiesIssued++;
            } else if (sub.status === 'Declined') {
                monthlyTrend[monthIdx].policiesDeclined++;
            }
        });

        const policyDistribution = Object.entries(policyStats)
            .map(([name, stats]) => ({
                policy_name: name,
                count: stats.count,
                totalANP: Math.round(stats.totalANP),
                percentage: totalIssuedCount > 0 ? Math.round((stats.count / totalIssuedCount) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count);

        res.json({
            success: true,
            data: {
                totalCases: totalIssuedCount,
                policyDistribution,
                monthlyTrend
            }
        });

    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;