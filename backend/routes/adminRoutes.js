const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { sendGraphEmail } = require('../config/graphMailer');

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
        console.error('Error in /form-submissions/:id/status:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Create User - uses admin API to bypass email confirmation
router.post('/admin/create-user', async (req, res) => {
  try {
    const { email, password, firstName, lastName, accountType, status, intermediaryCode } = req.body;

    // Create auth user immediately (no email confirmation needed)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName, account_type: accountType, status: status || 'Active' },
    });

    if (authError) return res.status(400).json({ success: false, message: authError.message });

    const userId = authData.user.id;

    // Insert profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      first_name: firstName,
      last_name: lastName,
      email,
      account_type: accountType,
      status: status || 'Active',
      intermediary_code: intermediaryCode ? parseInt(intermediaryCode) : null,
    }, { onConflict: 'id' });

    if (profileError) {
      // Rollback: delete the auth user if profile insert fails
      await supabase.auth.admin.deleteUser(userId);
      return res.status(400).json({ success: false, message: profileError.message });
    }

    // Send welcome email with credentials
    try {
      await sendGraphEmail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to Caelum Financial Solutions',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
            <h2 style="color: #1a1a2e;">Welcome, ${firstName}!</h2>
            <p>Your account has been created. Here are your login credentials:</p>
            <div style="background: #f4f4f4; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${password}</p>
              <p><strong>Role:</strong> ${accountType}</p>
            </div>
            <p>Please log in and change your password as soon as possible.</p>
            <p style="color: #888; font-size: 12px;">Caelum Financial Solutions</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Welcome email failed:', emailErr.message);
    }

    res.json({ success: true, userId, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset User Password - Generate default password and update auth
router.post('/admin/reset-password', async (req, res) => {
  try {
    const { userId, lastName } = req.body;

    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const year = String(new Date().getFullYear()).slice(-2);
    const passwordPrefix = lastName.slice(0, 2);
    const defaultPassword = `#${passwordPrefix.charAt(0).toUpperCase()}${passwordPrefix.charAt(1).toLowerCase()}${month}${year}`;

    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: defaultPassword,
      email_confirm: true,
    });

    if (updateError) return res.status(400).json({ success: false, message: 'Failed to update password: ' + updateError.message });

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ status: 'Active' })
      .eq('id', userId);

    if (profileError) return res.status(400).json({ success: false, message: 'Failed to update profile: ' + profileError.message });

    res.json({ success: true, message: 'Password reset successfully', generatedPassword: defaultPassword });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
