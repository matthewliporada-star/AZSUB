const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
require('dotenv').config();

// Initialize OAuth2 Client
const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground" // Standard for refreshing tokens
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const ALLIANZ_HO_EMAIL = process.env.ALLIANZ_HO_EMAIL;

const { supabase } = require('./supabase');

/**
 * Sends an email using Google's Gmail API.
 * Dynamically chooses the authentication based on the 'from' email.
 * If the agent has linked their Google account, it sends AS them.
 * Otherwise, it falls back to the system account but sets 'Reply-To'.
 */
async function sendGoogleEmail({ from, to, cc, subject, text, html, attachments }) {
    try {
        let refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
        let authUser = process.env.EMAIL_USER;

        // Try to find the Agent's personal Google Refresh Token
        if (from) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('google_refresh_token, google_email')
                .eq('email', from)
                .maybeSingle();

            if (profile?.google_refresh_token) {
                refreshToken = profile.google_refresh_token;
                authUser = profile.google_email || from;
                console.log(`[GoogleMailer] Using per-user auth for: ${authUser}`);
            }
        }

        const oauth2Client = new OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
        );

        oauth2Client.setCredentials({ refresh_token: refreshToken });
        const { token } = await oauth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: authUser,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: refreshToken,
                accessToken: token
            }
        });

        const mailOptions = {
            from: `"${process.env.SENDER_NAME || 'AZ Submission'}" <${authUser}>`,
            to: Array.isArray(to) ? to.join(', ') : to,
            cc: Array.isArray(cc) ? cc.join(', ') : cc,
            replyTo: from || authUser,
            subject,
            text,
            html,
            attachments: attachments?.map(att => ({
                filename: att.filename || att.name,
                content: att.content
            }))
        };

        const result = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully via Google API:", result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error("❌ Google Mailer Error:", error.message);
        throw error;
    }
}

module.exports = { sendGoogleEmail, ALLIANZ_HO_EMAIL };
