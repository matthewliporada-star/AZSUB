// mdroutes.js - Complete working version with all MD endpoints
const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Helper to get premium value
const getPremiumValue = (premium) => parseFloat(premium) || 0;

// Helper to get user IDs by role using role_id
const getUserIdsByRole = async (roleCode) => {
    try {
        const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role_id')
            .eq('role_code', roleCode)
            .single();
        
        if (roleError) {
            console.error(`[MD] Error fetching role_id for ${roleCode}:`, roleError);
            return [];
        }
        
        const roleId = roleData?.role_id;
        if (!roleId) {
            console.log(`[MD] No role_id found for role_code: ${roleCode}`);
            return [];
        }
        
        const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('role_id', roleId);
        
        if (userError) {
            console.error(`[MD] Error fetching users for role ${roleCode}:`, userError);
            return [];
        }
        
        console.log(`[MD] Found ${users?.length || 0} users with role ${roleCode} (role_id: ${roleId})`);
        return users?.map(u => u.id) || [];
    } catch (e) {
        console.error(`[MD] Exception fetching ${roleCode} users:`, e);
        return [];
    }
};

// Helper to get all user IDs under MPs (including ALs and APs)
const getAllUserIdsUnderMPs = async () => {
    try {
        const mpIds = await getUserIdsByRole('MP');
        const alIds = await getUserIdsByRole('AL');
        const apIds = await getUserIdsByRole('AP');
        
        // Get hierarchy to find all users under MPs
        const { data: hierarchy } = await supabase
            .from('user_hierarchy')
            .select('user_id, report_to_id')
            .eq('is_active', true);
        
        // Find all ALs that report to MPs
        const alsUnderMPs = hierarchy?.filter(h => mpIds.includes(h.report_to_id)).map(h => h.user_id) || [];
        
        // Find all APs that report to those ALs or directly to MPs
        const apsUnderALs = hierarchy?.filter(h => alsUnderMPs.includes(h.report_to_id)).map(h => h.user_id) || [];
        const apsUnderMPs = hierarchy?.filter(h => mpIds.includes(h.report_to_id)).map(h => h.user_id) || [];
        
        // Combine all unique IDs
        const allIds = [...new Set([...mpIds, ...alsUnderMPs, ...apsUnderALs, ...apsUnderMPs])];
        
        console.log(`[MD] Total users under MPs: ${allIds.length} (MPs: ${mpIds.length}, ALs: ${alsUnderMPs.length}, APs: ${apsUnderALs.length + apsUnderMPs.length})`);
        
        return allIds;
    } catch (e) {
        console.error('[MD] Error getting users under MPs:', e);
        return [];
    }
};

// Test endpoint
router.get('/md/test', (req, res) => {
    res.json({ success: true, message: 'MD routes are working', timestamp: new Date().toISOString() });
});

// ==========================================
// 1. MP (Management Partner) PERFORMANCE
// ==========================================
router.get('/md/mp-performance', async (req, res) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const queryYear = year ? parseInt(year) : now.getFullYear();
        const queryMonth = (month !== undefined && month !== null) ? parseInt(month) : now.getMonth();

        console.log(`[MD] Fetching MP performance for month=${queryMonth}, year=${queryYear}`);

        const mpIds = await getUserIdsByRole('MP');
        
        if (mpIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const { data: mpUsers, error: mpError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, created_at, status')
            .in('id', mpIds);

        if (mpError) throw mpError;

        // Get ALs and APs under MPs
        const { data: hierarchy } = await supabase
            .from('user_hierarchy')
            .select('user_id, report_to_id, is_active')
            .eq('is_active', true);
        
        const alIds = await getUserIdsByRole('AL');
        const apIds = await getUserIdsByRole('AP');
        
        // Build maps
        const mpToALs = {};
        const alToMP = {};
        hierarchy?.forEach(h => {
            if (alIds.includes(h.user_id) && mpIds.includes(h.report_to_id)) {
                if (!mpToALs[h.report_to_id]) mpToALs[h.report_to_id] = [];
                mpToALs[h.report_to_id].push(h.user_id);
                alToMP[h.user_id] = h.report_to_id;
            }
        });
        
        const alToAPs = {};
        hierarchy?.forEach(h => {
            if (apIds.includes(h.user_id)) {
                if (!alToAPs[h.report_to_id]) alToAPs[h.report_to_id] = [];
                alToAPs[h.report_to_id].push(h.user_id);
            }
        });
        
        // Get all submissions from ALs and APs under MPs
        const allUserIdsUnderMPs = [];
        mpIds.forEach(mpId => {
            const als = mpToALs[mpId] || [];
            allUserIdsUnderMPs.push(...als);
            als.forEach(alId => {
                const aps = alToAPs[alId] || [];
                allUserIdsUnderMPs.push(...aps);
            });
        });
        
        const uniqueUserIds = [...new Set(allUserIdsUnderMPs)];
        
        const { data: allSubmissions, error: subError } = await supabase
            .from('az_submissions')
            .select('*, policy:policy_id(policy_name)')
            .in('profile_id', [...uniqueUserIds, ...mpIds])
            .in('status', ['Issued', 'Declined']);

        if (subError) throw subError;

        const mpPerformance = (mpUsers || []).map(mp => {
            // Get all ALs under this MP
            const alsUnderMP = mpToALs[mp.id] || [];
            
            // Get all APs under these ALs
            let apsUnderMP = [];
            alsUnderMP.forEach(alId => {
                const aps = alToAPs[alId] || [];
                apsUnderMP.push(...aps);
            });
            apsUnderMP = [...new Set(apsUnderMP)];
            
            // Get submissions from MP's team (ALs and APs)
            const teamIds = [mp.id, ...alsUnderMP, ...apsUnderMP];
            const teamSubs = allSubmissions?.filter(s => teamIds.includes(s.profile_id)) || [];
            
            // All-time stats from team
            const allTimeIssued = teamSubs.filter(s => s.status === 'Issued');
            const totalANP = allTimeIssued.reduce((sum, s) => sum + getPremiumValue(s.premium_paid), 0);
            const totalCases = allTimeIssued.length;
            
            // Monthly stats
            const monthlySubs = teamSubs.filter(s => {
                const d = new Date(s.issued_at);
                return d.getFullYear() === queryYear && d.getMonth() === queryMonth;
            });
            const monthlyIssued = monthlySubs.filter(s => s.status === 'Issued');
            const monthlyDeclined = monthlySubs.filter(s => s.status === 'Declined');
            const monthlyANP = monthlyIssued.reduce((sum, s) => sum + getPremiumValue(s.premium_paid), 0);
            const monthlyCases = monthlyIssued.length;
            
            // Activity Ratio
            let activeALCount = 0;
            alsUnderMP.forEach(alId => {
                const hasActivity = monthlyIssued.some(s => s.profile_id === alId);
                if (hasActivity) activeALCount++;
            });
            const activityRatio = alsUnderMP.length > 0 ? Math.round((activeALCount / alsUnderMP.length) * 100) : 0;
            
            let mpStatus = 'AVERAGE';
            if (monthlyCases >= 20) mpStatus = 'PERFORMING';
            else if (monthlyCases >= 10) mpStatus = 'ACTIVE';
            else if (monthlyCases === 0) mpStatus = 'INACTIVE';
            
            return {
                id: mp.id,
                name: `${mp.first_name} ${mp.last_name}`,
                region: 'NCR',
                status: mpStatus,
                totalANP: Math.round(totalANP),
                monthlyANP: Math.round(monthlyANP),
                totalCases: totalCases,
                monthlyCases: monthlyCases,
                monthlyDeclined: monthlyDeclined.length,
                activityRatio: activityRatio,
                alCount: alsUnderMP.length,
                apCount: apsUnderMP.length
            };
        });

        mpPerformance.sort((a, b) => b.monthlyANP - a.monthlyANP);

        res.json({ success: true, data: mpPerformance });
    } catch (e) {
        console.error('[MD] MP Performance Error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==========================================
// 2. AL (Agency Leader) PERFORMANCE
// ==========================================
router.get('/md/al-performance', async (req, res) => {
    try {
        const { month, year, mpId } = req.query;
        const now = new Date();
        const queryYear = year ? parseInt(year) : now.getFullYear();
        const queryMonth = (month !== undefined && month !== null) ? parseInt(month) : now.getMonth();

        let alIds = await getUserIdsByRole('AL');
        
        if (alIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        if (mpId) {
            const { data: hierarchy } = await supabase
                .from('user_hierarchy')
                .select('user_id')
                .eq('report_to_id', mpId)
                .eq('is_active', true);
            
            const filteredAlIds = hierarchy?.map(h => h.user_id) || [];
            alIds = alIds.filter(id => filteredAlIds.includes(id));
            
            if (alIds.length === 0) {
                return res.json({ success: true, data: [] });
            }
        }

        const { data: alUsers, error: alError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, created_at, status')
            .in('id', alIds);

        if (alError) throw alError;

        const apIds = await getUserIdsByRole('AP');
        
        const { data: hierarchy } = await supabase
            .from('user_hierarchy')
            .select('user_id, report_to_id')
            .eq('is_active', true);
        
        const alToAPs = {};
        hierarchy?.forEach(h => {
            if (apIds.includes(h.user_id)) {
                if (!alToAPs[h.report_to_id]) alToAPs[h.report_to_id] = [];
                alToAPs[h.report_to_id].push(h.user_id);
            }
        });

        const { data: alHierarchy } = await supabase
            .from('user_hierarchy')
            .select('user_id, report_to_id')
            .in('user_id', alIds)
            .eq('is_active', true);

        const alToMP = {};
        alHierarchy?.forEach(h => {
            alToMP[h.user_id] = h.report_to_id;
        });

        const mpIdsList = [...new Set(Object.values(alToMP))];
        let mpNames = {};
        if (mpIdsList.length > 0) {
            const { data: mpProfiles } = await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .in('id', mpIdsList);
            mpProfiles?.forEach(mp => {
                mpNames[mp.id] = `${mp.first_name} ${mp.last_name}`;
            });
        }

        // Get all submissions for ALs and their APs
        const allTeamIds = [];
        alIds.forEach(alId => {
            allTeamIds.push(alId);
            const aps = alToAPs[alId] || [];
            allTeamIds.push(...aps);
        });
        
        const { data: allSubmissions, error: subError } = await supabase
            .from('az_submissions')
            .select('*, policy:policy_id(policy_name)')
            .in('profile_id', [...new Set(allTeamIds)])
            .in('status', ['Issued', 'Declined']);

        if (subError) throw subError;

        const alPerformance = (alUsers || []).map(al => {
            const teamIds = [al.id, ...(alToAPs[al.id] || [])];
            const teamSubs = allSubmissions?.filter(s => teamIds.includes(s.profile_id)) || [];
            
            // All-time stats
            const allTimeIssued = teamSubs.filter(s => s.status === 'Issued');
            const totalANP = allTimeIssued.reduce((sum, s) => sum + getPremiumValue(s.premium_paid), 0);
            const totalCases = allTimeIssued.length;
            
            // Monthly stats
            const monthlySubs = teamSubs.filter(s => {
                const d = new Date(s.issued_at);
                return d.getFullYear() === queryYear && d.getMonth() === queryMonth;
            });
            const monthlyIssued = monthlySubs.filter(s => s.status === 'Issued');
            const monthlyDeclined = monthlySubs.filter(s => s.status === 'Declined');
            const monthlyANP = monthlyIssued.reduce((sum, s) => sum + getPremiumValue(s.premium_paid), 0);
            const monthlyCases = monthlyIssued.length;
            
            // Activity Ratio
            const apCount = alToAPs[al.id]?.length || 0;
            let activeAPCount = 0;
            (alToAPs[al.id] || []).forEach(apId => {
                const hasActivity = monthlyIssued.some(s => s.profile_id === apId);
                if (hasActivity) activeAPCount++;
            });
            const activityRatio = apCount > 0 ? Math.round((activeAPCount / apCount) * 100) : 0;
            
            let alStatus = 'NEEDS IMPROVEMENT';
            if (monthlyCases >= 7) alStatus = 'PERFORMING';
            else if (monthlyCases >= 4) alStatus = 'AVERAGE';
            
            return {
                id: al.id,
                name: `${al.first_name} ${al.last_name}`,
                mpId: alToMP[al.id] || null,
                mpName: mpNames[alToMP[al.id]] || 'Unassigned',
                city: 'N/A',
                status: alStatus,
                totalANP: Math.round(totalANP),
                monthlyANP: Math.round(monthlyANP),
                totalCases: totalCases,
                monthlyCases: monthlyCases,
                monthlyDeclined: monthlyDeclined.length,
                activityRatio: activityRatio,
                apCount: apCount,
                activeAPs: activeAPCount
            };
        });

        alPerformance.sort((a, b) => b.monthlyANP - a.monthlyANP);

        res.json({ success: true, data: alPerformance });
    } catch (e) {
        console.error('[MD] AL Performance Error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==========================================
// 3. AP (Agency Partner) PERFORMANCE
// ==========================================
router.get('/md/ap-performance', async (req, res) => {
    try {
        const { month, year, mpId, alId } = req.query;
        const now = new Date();
        const queryYear = year ? parseInt(year) : now.getFullYear();
        const queryMonth = (month !== undefined && month !== null) ? parseInt(month) : now.getMonth();

        let apIds = await getUserIdsByRole('AP');
        
        if (apIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const { data: hierarchy } = await supabase
            .from('user_hierarchy')
            .select('user_id, report_to_id')
            .eq('is_active', true);

        if (mpId) {
            const { data: alsUnderMP } = await supabase
                .from('user_hierarchy')
                .select('user_id')
                .eq('report_to_id', mpId)
                .eq('is_active', true);
            
            const alIdsList = alsUnderMP?.map(a => a.user_id) || [];
            
            if (alIdsList.length > 0) {
                const filteredApIds = hierarchy
                    ?.filter(h => alIdsList.includes(h.report_to_id))
                    .map(h => h.user_id) || [];
                apIds = apIds.filter(id => filteredApIds.includes(id));
            }
        } else if (alId) {
            const filteredApIds = hierarchy
                ?.filter(h => h.report_to_id === alId)
                .map(h => h.user_id) || [];
            apIds = apIds.filter(id => filteredApIds.includes(id));
        }

        if (apIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const { data: apUsers, error: apError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, created_at, last_submission_at, intermediary_code')
            .in('id', apIds);

        if (apError) throw apError;

        const { data: allSubmissions, error: subError } = await supabase
            .from('az_submissions')
            .select('*, policy:policy_id(policy_name)')
            .in('profile_id', apIds)
            .in('status', ['Issued', 'Declined']);

        if (subError) throw subError;

        const apToAL = {};
        hierarchy?.forEach(h => {
            if (apIds.includes(h.user_id)) {
                apToAL[h.user_id] = h.report_to_id;
            }
        });

        const alIdsList = [...new Set(Object.values(apToAL))];
        let alNames = {};
        if (alIdsList.length > 0) {
            const { data: alProfiles } = await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .in('id', alIdsList);
            alProfiles?.forEach(al => {
                alNames[al.id] = `${al.first_name} ${al.last_name}`;
            });
        }

        const alToMP = {};
        const { data: alHierarchy } = await supabase
            .from('user_hierarchy')
            .select('user_id, report_to_id')
            .in('user_id', alIdsList)
            .eq('is_active', true);
        
        alHierarchy?.forEach(h => {
            alToMP[h.user_id] = h.report_to_id;
        });

        const mpIdsList = [...new Set(Object.values(alToMP))];
        let mpNames = {};
        if (mpIdsList.length > 0) {
            const { data: mpProfiles } = await supabase
                .from('profiles')
                .select('id, first_name, last_name')
                .in('id', mpIdsList);
            mpProfiles?.forEach(mp => {
                mpNames[mp.id] = `${mp.first_name} ${mp.last_name}`;
            });
        }

        const apPerformance = (apUsers || []).map(ap => {
            const apSubs = allSubmissions?.filter(s => s.profile_id === ap.id) || [];
            
            const monthlySubs = apSubs.filter(s => {
                const d = new Date(s.issued_at);
                return d.getFullYear() === queryYear && d.getMonth() === queryMonth;
            });
            
            const monthlyIssued = monthlySubs.filter(s => s.status === 'Issued');
            const monthlyDeclined = monthlySubs.filter(s => s.status === 'Declined');
            
            const allTimeIssued = apSubs.filter(s => s.status === 'Issued');
            const totalANP = allTimeIssued.reduce((sum, s) => sum + getPremiumValue(s.premium_paid), 0);
            const totalCases = allTimeIssued.length;
            
            const monthlyANP = monthlyIssued.reduce((sum, s) => sum + getPremiumValue(s.premium_paid), 0);
            const monthlyCases = monthlyIssued.length;
            
            const alIdForAP = apToAL[ap.id];
            const mpIdForAP = alToMP[alIdForAP];
            
            let performanceStatus = 'NEEDS IMPROVEMENT';
            if (monthlyCases >= 7) performanceStatus = 'PERFORMING';
            else if (monthlyCases >= 4) performanceStatus = 'AVERAGE';
            
            return {
                id: ap.id,
                name: `${ap.first_name} ${ap.last_name}`,
                mpId: mpIdForAP || null,
                mpName: mpNames[mpIdForAP] || 'Unassigned',
                alId: alIdForAP || null,
                alName: alNames[alIdForAP] || 'Unassigned',
                city: 'N/A',
                licenseNumber: ap.intermediary_code || `LIC-${ap.id.substring(0, 8)}`,
                lastActivity: ap.last_submission_at ? new Date(ap.last_submission_at).toLocaleDateString() : 'No activity',
                totalANP: Math.round(totalANP),
                monthlyANP: Math.round(monthlyANP),
                totalCases: totalCases,
                monthlyCases: monthlyCases,
                monthlyDeclined: monthlyDeclined.length,
                status: performanceStatus
            };
        });

        res.json({ success: true, data: apPerformance });
    } catch (e) {
        console.error('[MD] AP Performance Error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==========================================
// 4. MD DASHBOARD STATS - FIXED to include all submissions under MPs
// ==========================================
router.get('/md/dashboard-stats', async (req, res) => {
    try {
        const { year, month } = req.query;
        const selectedYear = year ? parseInt(year) : new Date().getFullYear();
        const selectedMonth = (month !== undefined && month !== null) ? parseInt(month) : new Date().getMonth();

        console.log(`[MD] Fetching dashboard stats for month=${selectedMonth}, year=${selectedYear}`);

        const mpIds = await getUserIdsByRole('MP');
        const alIds = await getUserIdsByRole('AL');
        const apIds = await getUserIdsByRole('AP');
        
        console.log(`[MD] Found MPs: ${mpIds.length}, ALs: ${alIds.length}, APs: ${apIds.length}`);
        
        if (mpIds.length === 0) {
            return res.json({
                success: true,
                data: {
                    totalMPs: 0,
                    activeMPs: 0,
                    totalMPANP: 0,
                    totalMPPolicies: 0,
                    avgActivityRatio: 0,
                    totalALs: alIds.length,
                    performingALs: 0,
                    totalAPs: apIds.length,
                    activeAPs: 0,
                    monthSpecificStats: { activityRatio: 0, monthlyANP: 0, totalPolicies: 0, monthlyDeclined: 0 },
                    policyDistribution: [],
                    monthlyTrend: []
                }
            });
        }

        // Get hierarchy to find all users under MPs
        const { data: hierarchy } = await supabase
            .from('user_hierarchy')
            .select('user_id, report_to_id')
            .eq('is_active', true);
        
        // Find all ALs under MPs
        const alsUnderMPs = hierarchy?.filter(h => mpIds.includes(h.report_to_id)).map(h => h.user_id) || [];
        
        // Find all APs under those ALs OR directly under MPs
        const apsUnderALs = hierarchy?.filter(h => alsUnderMPs.includes(h.report_to_id)).map(h => h.user_id) || [];
        const apsUnderMPs = hierarchy?.filter(h => mpIds.includes(h.report_to_id)).map(h => h.user_id) || [];
        
        // Combine all user IDs under MPs (MPs themselves + their ALs + their APs)
        const allUserIdsUnderMPs = [...new Set([...mpIds, ...alsUnderMPs, ...apsUnderALs, ...apsUnderMPs])];
        
        console.log(`[MD] Total users under MPs: ${allUserIdsUnderMPs.length}`);
        
        // Fetch ALL submissions from all users under MPs
        const { data: allSubmissions, error: subError } = await supabase
            .from('az_submissions')
            .select('profile_id, premium_paid, status, issued_at, policy:policy_id(policy_name)')
            .in('profile_id', allUserIdsUnderMPs)
            .in('status', ['Issued', 'Declined']);
        
        if (subError) throw subError;
        
        // Calculate TOTAL ANP from all submissions (all-time)
        const allTimeIssued = allSubmissions?.filter(s => s.status === 'Issued') || [];
        const totalMPANP = allTimeIssued.reduce((sum, s) => sum + getPremiumValue(s.premium_paid), 0);
        
        // Calculate TOTAL CASES from all submissions (all-time)
        const totalMPPolicies = allTimeIssued.length;
        
        console.log(`[MD] Calculated totals - Total ANP: ${totalMPANP}, Total Cases: ${totalMPPolicies}`);
        
        // Filter monthly submissions
        const monthlySubmissions = allSubmissions?.filter(s => {
            const d = new Date(s.issued_at);
            return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
        }) || [];
        
        const monthlyIssued = monthlySubmissions.filter(s => s.status === 'Issued');
        const monthlyDeclined = monthlySubmissions.filter(s => s.status === 'Declined');
        
        // Monthly stats
        const monthlyANP = monthlyIssued.reduce((sum, s) => sum + getPremiumValue(s.premium_paid), 0);
        const monthlyPolicies = monthlyIssued.length;
        
        // Build MP to ALs map for activity ratio
        const mpToALs = {};
        hierarchy?.forEach(h => {
            if (alsUnderMPs.includes(h.user_id) && mpIds.includes(h.report_to_id)) {
                if (!mpToALs[h.report_to_id]) mpToALs[h.report_to_id] = [];
                mpToALs[h.report_to_id].push(h.user_id);
            }
        });
        
        // Calculate average activity ratio across MPs
        let totalActivityRatioSum = 0;
        let activeMPCount = 0;
        
        mpIds.forEach(mpId => {
            const alIdsUnderMP = mpToALs[mpId] || [];
            if (alIdsUnderMP.length > 0) {
                let activeALCount = 0;
                alIdsUnderMP.forEach(alId => {
                    const hasActivity = monthlyIssued.some(s => s.profile_id === alId);
                    if (hasActivity) activeALCount++;
                });
                totalActivityRatioSum += (activeALCount / alIdsUnderMP.length) * 100;
                activeMPCount++;
            }
        });
        
        const avgActivityRatio = activeMPCount > 0 ? Math.round(totalActivityRatioSum / activeMPCount) : 0;
        
        // Count performing ALs (7+ cases from their team)
        let performingALs = 0;
        alsUnderMPs.forEach(alId => {
            // Get APs under this AL
            const apsUnderThisAL = hierarchy?.filter(h => h.report_to_id === alId).map(h => h.user_id) || [];
            const teamIds = [alId, ...apsUnderThisAL];
            const alMonthlyCases = monthlyIssued.filter(s => teamIds.includes(s.profile_id)).length;
            if (alMonthlyCases >= 7) performingALs++;
        });
        
        // Count active APs (those with at least 1 issued submission in the month)
        let activeAPs = 0;
        apIds.forEach(apId => {
            const hasActivity = monthlyIssued.some(s => s.profile_id === apId);
            if (hasActivity) activeAPs++;
        });
        
        // Policy distribution (all-time)
        const policyDistributionMap = {};
        allTimeIssued.forEach(s => {
            const policyName = s.policy?.policy_name || 'Unknown';
            if (!policyDistributionMap[policyName]) policyDistributionMap[policyName] = 0;
            policyDistributionMap[policyName]++;
        });
        
        const policyDistribution = Object.entries(policyDistributionMap)
            .map(([name, count]) => ({
                policy_name: name,
                count: count,
                percentage: totalMPPolicies > 0 ? Math.round((count / totalMPPolicies) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
        
        // Monthly trend
        const monthlyTrend = [];
        for (let i = 0; i < 12; i++) {
            const monthStart = new Date(selectedYear, i, 1);
            const monthEnd = new Date(selectedYear, i + 1, 0, 23, 59, 59, 999);
            
            const monthSubs = allSubmissions?.filter(s => {
                const d = new Date(s.issued_at);
                return d >= monthStart && d <= monthEnd;
            }) || [];
            
            const monthIssued = monthSubs.filter(s => s.status === 'Issued');
            const monthDeclinedCount = monthSubs.filter(s => s.status === 'Declined').length;
            
            monthlyTrend.push({
                month: monthStart.toLocaleString('default', { month: 'short' }),
                issued: monthIssued.length,
                declined: monthDeclinedCount,
                anp: monthIssued.reduce((sum, s) => sum + getPremiumValue(s.premium_paid), 0)
            });
        }
        
        const result = {
            success: true,
            data: {
                totalMPs: mpIds.length,
                activeMPs: mpIds.length,
                totalMPANP: Math.round(totalMPANP),
                totalMPPolicies: totalMPPolicies,
                avgActivityRatio: avgActivityRatio,
                totalALs: alsUnderMPs.length,
                performingALs: performingALs,
                totalAPs: apIds.length,
                activeAPs: activeAPs,
                monthSpecificStats: {
                    activityRatio: avgActivityRatio,
                    monthlyANP: Math.round(monthlyANP),
                    totalPolicies: monthlyPolicies,
                    monthlyDeclined: monthlyDeclined.length
                },
                policyDistribution: policyDistribution,
                monthlyTrend: monthlyTrend
            }
        };
        
        console.log(`[MD] Dashboard stats result:`, {
            totalMPs: result.data.totalMPs,
            totalMPANP: result.data.totalMPANP,
            totalMPPolicies: result.data.totalMPPolicies,
            monthlyANP: result.data.monthSpecificStats.monthlyANP
        });
        
        res.json(result);
    } catch (e) {
        console.error('[MD] Dashboard Stats Error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==========================================
// 5. MONTHLY HISTORY
// ==========================================
router.get('/md/monthly-history', async (req, res) => {
    try {
        const { year, month, statType } = req.query;
        const selectedYear = year ? parseInt(year) : new Date().getFullYear();
        const selectedMonth = (month !== undefined && month !== null) ? parseInt(month) : new Date().getMonth();

        // Get all users under MPs
        const mpIds = await getUserIdsByRole('MP');
        const alIds = await getUserIdsByRole('AL');
        const apIds = await getUserIdsByRole('AP');
        
        const { data: hierarchy } = await supabase
            .from('user_hierarchy')
            .select('user_id, report_to_id')
            .eq('is_active', true);
        
        // Find all users under MPs
        const alsUnderMPs = hierarchy?.filter(h => mpIds.includes(h.report_to_id)).map(h => h.user_id) || [];
        const apsUnderALs = hierarchy?.filter(h => alsUnderMPs.includes(h.report_to_id)).map(h => h.user_id) || [];
        const apsUnderMPs = hierarchy?.filter(h => mpIds.includes(h.report_to_id)).map(h => h.user_id) || [];
        
        const allUserIds = [...new Set([...mpIds, ...alsUnderMPs, ...apsUnderALs, ...apsUnderMPs])];
        
        const { data: submissions } = await supabase
            .from('az_submissions')
            .select('profile_id, premium_paid, status, issued_at')
            .in('profile_id', allUserIds)
            .in('status', ['Issued', 'Declined']);
        
        const monthlyData = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        let currentValue = 0;
        let cumulativeANP = 0;
        
        for (let i = 0; i <= selectedMonth; i++) {
            const monthStart = new Date(selectedYear, i, 1);
            const monthEnd = new Date(selectedYear, i + 1, 0, 23, 59, 59, 999);
            
            const monthSubs = submissions?.filter(s => {
                const d = new Date(s.issued_at);
                return d >= monthStart && d <= monthEnd;
            }) || [];
            
            let val = 0;
            
            if (statType === 'totalMPs') {
                const activeMPs = new Set();
                monthSubs.forEach(s => {
                    if (mpIds.includes(s.profile_id)) activeMPs.add(s.profile_id);
                });
                val = activeMPs.size;
            } 
            else if (statType === 'totalMPANP') {
                const monthlyANP = monthSubs.filter(s => s.status === 'Issued')
                    .reduce((sum, s) => sum + getPremiumValue(s.premium_paid), 0);
                cumulativeANP += monthlyANP;
                val = cumulativeANP;
            }
            else if (statType === 'totalMPPolicies') {
                val = monthSubs.filter(s => s.status === 'Issued').length;
            }
            else if (statType === 'monthlyMPANP') {
                val = monthSubs.filter(s => s.status === 'Issued')
                    .reduce((sum, s) => sum + getPremiumValue(s.premium_paid), 0);
            }
            else if (statType === 'totalCases') {
                val = monthSubs.length;
            }
            
            if (i === selectedMonth) {
                currentValue = val;
            }
            
            monthlyData.push({ month: monthNames[i], value: Math.round(val), trend: 'stable' });
        }
        
        let title = '', description = '', prefix = '', unit = '';
        switch (statType) {
            case 'totalMPs':
                title = 'Total Management Partners';
                description = 'Number of Management Partners in the network';
                break;
            case 'totalMPANP':
                title = 'Total ANP';
                description = 'Cumulative Annual Premium collected by all MPs';
                prefix = '₱ ';
                break;
            case 'totalMPPolicies':
                title = 'Total Cases';
                description = 'Total number of policies issued by all MPs';
                break;
            case 'monthlyMPANP':
                title = 'Monthly ANP';
                description = 'Monthly ANP from all Management Partners';
                prefix = '₱ ';
                break;
            case 'totalCases':
                title = 'Monthly Cases';
                description = 'Total cases (Issued + Declined) for the month';
                break;
            default:
                title = statType;
                description = 'Historical data';
        }
        
        res.json({
            success: true,
            data: {
                title,
                description,
                currentValue: Math.round(currentValue),
                yearlyChange: 0,
                trend: 'stable',
                monthlyData,
                prefix,
                unit
            }
        });
    } catch (e) {
        console.error('[MD] Monthly History Error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ==========================================
// 6. POLICY DETAILS
// ==========================================
router.get('/md/policy-details/:mpId', async (req, res) => {
    try {
        const { mpId } = req.params;
        const { year } = req.query;
        const selectedYear = year ? parseInt(year) : new Date().getFullYear();

        const { data: alsUnderMP } = await supabase
            .from('user_hierarchy')
            .select('user_id')
            .eq('report_to_id', mpId)
            .eq('is_active', true);
        
        const alIds = alsUnderMP?.map(a => a.user_id) || [];
        
        const { data: apsUnderAL } = await supabase
            .from('user_hierarchy')
            .select('user_id')
            .in('report_to_id', alIds)
            .eq('is_active', true);
        
        const apIds = apsUnderAL?.map(a => a.user_id) || [];
        const allIds = [mpId, ...alIds, ...apIds];
        
        const startDate = new Date(selectedYear, 0, 1).toISOString();
        const endDate = new Date(selectedYear, 11, 31, 23, 59, 59, 999).toISOString();
        
        const { data: submissions } = await supabase
            .from('az_submissions')
            .select('issued_at, premium_paid, status, policy:policy_id(policy_name)')
            .in('profile_id', allIds)
            .in('status', ['Issued', 'Declined'])
            .gte('issued_at', startDate)
            .lte('issued_at', endDate);
        
        const policyStats = {};
        const monthlyTrend = Array(12).fill(0).map((_, i) => ({
            month: new Date(0, i).toLocaleString('default', { month: 'short' }),
            policiesIssued: 0,
            policiesDeclined: 0
        }));
        
        let totalIssuedCount = 0;
        
        submissions?.forEach(sub => {
            if (sub.status === 'Issued') {
                const name = sub.policy?.policy_name || 'Other';
                const premium = parseFloat(sub.premium_paid) || 0;
                if (!policyStats[name]) {
                    policyStats[name] = { count: 0, totalANP: 0 };
                }
                policyStats[name].count++;
                policyStats[name].totalANP += premium;
                totalIssuedCount++;
            }
            const monthIdx = new Date(sub.issued_at).getMonth();
            if (sub.status === 'Issued') monthlyTrend[monthIdx].policiesIssued++;
            else if (sub.status === 'Declined') monthlyTrend[monthIdx].policiesDeclined++;
        });
        
        const policyDistribution = Object.entries(policyStats)
            .map(([name, stats]) => ({
                policy_name: name,
                count: stats.count,
                totalANP: Math.round(stats.totalANP),
                percentage: totalIssuedCount > 0 ? Math.round((stats.count / totalIssuedCount) * 100) : 0
            }))
            .sort((a, b) => b.count - a.count);
        
        const { data: mpProfile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', mpId)
            .single();
        
        res.json({
            success: true,
            data: {
                mpName: mpProfile ? `${mpProfile.first_name} ${mpProfile.last_name}` : 'Unknown',
                totalCases: totalIssuedCount,
                policyDistribution,
                monthlyTrend
            }
        });
    } catch (e) {
        console.error('[MD] Policy Details Error:', e);
        res.status(500).json({ success: false, message: e.message });
    }
});

module.exports = router;