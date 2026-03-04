const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { supabase } = require('../config/supabase');
require('dotenv').config();

const OAuth2 = google.auth.OAuth2;

/**
 * Returns a configured OAuth2 client.
 */
function getOAuth2Client() {
    return new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback"
    );
}

/**
 * STEP 1: Generate Authorization URL
 * The agent clicks this link to start the Google login process.
 */
router.get('/auth/google/url', (req, res) => {
    const oauth2Client = getOAuth2Client();
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Critical: Required to get the Refresh Token
        prompt: 'consent',     // Ensures we always get a refresh token
        scope: ['https://www.googleapis.com/auth/gmail.send', 'email']
    });
    res.json({ url });
});

/**
 * STEP 2: Handle OAuth2 Callback
 * Google redirects here with a 'code' after the agent approves access.
 * We exchange this for tokens and save them to Supabase.
 */
router.get('/auth/google/callback', async (req, res) => {
    const { code, state } = req.query; // 'state' could be used for security (profile_id)

    if (!code) return res.status(400).send("Authorization code missing.");

    try {
        const oauth2Client = getOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);

        // tokens include: access_token, refresh_token, expiry_date, etc.
        if (!tokens.refresh_token) {
            console.warn("⚠️ No refresh token received. User might have approved already.");
        }

        // 1. Get user info from token
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        const email = userInfo.data.email;

        // 2. Update the profile in Supabase
        // Note: For now, we match by email. In a real app, you'd use 'state' to pass the user ID.
        const updateData = {
            google_email: email,
            ...(tokens.refresh_token ? { google_refresh_token: tokens.refresh_token } : {})
        };

        const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('email', email);

        if (error) throw error;

        // Redirect back to frontend
        res.send(`
            <div style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: #28a745;">Success!</h1>
                <p>Your Google account (${email}) has been connected to the AZ Submission System.</p>
                <p>You can now close this window.</p>
            </div>
        `);
    } catch (error) {
        console.error("❌ OAuth Callback Error:", error.message);
        res.status(500).send("Error authenticating with Google: " + error.message);
    }
});

module.exports = router;
