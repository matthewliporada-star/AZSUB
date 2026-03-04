const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Get all serial numbers for admin dashboard
router.get('/admin/serial-numbers', async (req, res) => {
    try {
        // Step 1: Fetch all serial numbers with issuer profile join
        const { data: serialNumbers, error: serialError } = await supabase
            .from('serial_number')
            .select(`
                *,
                issuer:issued_by(first_name, last_name)
            `)
            .order('date', { ascending: false });

        if (serialError) {
            console.error('Error fetching serial numbers:', serialError);
            return res.status(500).json({ success: false, message: 'Failed to fetch serial numbers' });
        }

        // Step 2: Fetch az_submissions with profile info to map serial_id -> requester
        const { data: submissions, error: subError } = await supabase
            .from('az_submissions')
            .select(`
                serial_id,
                profile_id,
                status,
                profiles:profile_id (
                    first_name,
                    last_name
                )
            `);

        if (subError) {
            console.error('Error fetching submissions for serial lookup:', subError);
        }

        // Build lookup map: serial_id -> submission profile info
        const submissionMap = {};
        if (submissions) {
            for (const sub of submissions) {
                if (sub.serial_id) {
                    submissionMap[sub.serial_id] = {
                        profiles: sub.profiles || null,
                        status: sub.status || null,
                    };
                }
            }
        }

        // Step 3: Merge submission profile data onto each serial
        const mergedSerials = (serialNumbers || []).map(serial => ({
            ...serial,
            submissionProfile: submissionMap[serial.serial_id]?.profiles || null,
            submissionStatus: submissionMap[serial.serial_id]?.status || null,
        }));

        // Calculate counts for dashboard cards
        const totalCount = mergedSerials.length;

        const unusedDefault = mergedSerials.filter(
            s => s.Confirm === null && s.serial_type === 'Default'
        ).length;

        const unusedAllianz = mergedSerials.filter(
            s => s.Confirm === null && s.serial_type === 'Allianz Well'
        ).length;

        const usedSerials = mergedSerials.filter(
            s => s.is_issued === true
        ).length;

        res.json({
            success: true,
            data: mergedSerials,
            counts: {
                total: totalCount,
                unusedDefault,
                unusedAllianz,
                usedSerials
            }
        });
    } catch (error) {
        console.error('Error in /admin/serial-numbers:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.patch('/form-submissions/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id) return res.status(400).json({ success: false, message: 'Missing submission ID' });

        const updateData = { status };
        if (status === 'Issued') {
            updateData.date_issued = new Date().toISOString();
        }

        const { error } = await supabase
            .from('az_submissions')
            .update(updateData)
            .eq('sub_id', id);

        if (error) {
            console.error('Error updating status:', error);
            return res.status(500).json({ success: false, message: error.message });
        }

        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (err) {
        console.error('Crash in /form-submissions/:id/status:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;
