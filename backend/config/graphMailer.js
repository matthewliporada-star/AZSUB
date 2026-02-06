require('isomorphic-fetch');
const { Client } = require("@microsoft/microsoft-graph-client");
const { ClientSecretCredential } = require("@azure/identity");
require('dotenv').config();

// Ensure required environment variables are present
if (!process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET) {
    console.warn("⚠️ Microsoft Graph API credentials are missing in .env (AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET)");
}

const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
);

// Initialize the Graph Client with the credential
const client = Client.initWithMiddleware({
    authProvider: {
        getAccessToken: async () => {
            const token = await credential.getToken("https://graph.microsoft.com/.default");
            return token.token;
        }
    }
});

const ALLIANZ_HO_EMAIL = process.env.ALLIANZ_HO_EMAIL;

async function sendGraphEmail({ from, to, cc, bcc, replyTo, subject, text, html, attachments }) {
    // If 'from' is not provided, fallback to env var (or throw if strictly required)
    const sender = from || process.env.EMAIL_USER;

    if (!sender) {
        throw new Error("Sender email (from) is not defined. Pass it to the function or set EMAIL_USER.");
    }

    // Convert single recipients to array
    const toList = Array.isArray(to) ? to : (to ? [to] : []);
    const ccList = Array.isArray(cc) ? cc : (cc ? [cc] : []);
    const bccList = Array.isArray(bcc) ? bcc : (bcc ? [bcc] : []);
    const replyToList = Array.isArray(replyTo) ? replyTo : (replyTo ? [replyTo] : []);

    const message = {
        subject: subject,
        body: {
            contentType: html ? "HTML" : "Text",
            content: html || text || " ", // Fallback to empty string if both missing
        },
        toRecipients: toList.map(email => ({ emailAddress: { address: email } })),
        ccRecipients: ccList.map(email => ({ emailAddress: { address: email } })),
        bccRecipients: bccList.map(email => ({ emailAddress: { address: email } })),
        replyTo: replyToList.map(email => ({ emailAddress: { address: email } }))
    };

    if (attachments && attachments.length > 0) {
        message.attachments = attachments.map(att => {
            // contentBytes must be base64 string
            let contentBytes = "";
            if (Buffer.isBuffer(att.content)) {
                contentBytes = att.content.toString('base64');
            } else if (typeof att.content === 'string') {
                contentBytes = Buffer.from(att.content).toString('base64');
            }

            return {
                "@odata.type": "#microsoft.graph.fileAttachment",
                name: att.filename || att.name || "attachment",
                contentBytes: contentBytes
            };
        });
    }

    try {
        // We send AS the user defined in 'sender'
        console.log(`sending email via Graph API from ${sender} to ${toList.join(', ')}`);
        await client.api(`/users/${sender}/sendMail`)
            .post({
                message: message,
                saveToSentItems: true
            });
        console.log("✅ Email sent successfully via Microsoft Graph API");
        return { success: true };
    } catch (error) {
        console.error("❌ Microsoft Graph API Error:", error.message);
        // Log more details if available
        if (error.body) {
            console.error("Graph Error Body:", JSON.stringify(error.body, null, 2));
        }
        throw error;
    }
}

module.exports = { sendGraphEmail, ALLIANZ_HO_EMAIL };
